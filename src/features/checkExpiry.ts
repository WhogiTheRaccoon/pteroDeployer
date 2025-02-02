import { db, schema } from '../db/setup'
import { eq } from 'drizzle-orm'
import { deleteServer, suspendServer, unSuspendServer } from "../utils/pterodactyl";
import colors from 'colors';
import { sendToAdminChannel } from '../utils/logging';

module.exports = async (instance: any, client: any) => {

    // Contact the user and ask if they wish to extend their server 14 days or not. 
    // If they ignore the dms or don't respond within 1 minute, continue and check after 8 hours.
    // If they still ignore it until the server expires the server will be marked as expired and deleted.
    async function checkWithUser() {
        const date = new Date();
        const servers = await db.select().from(schema.deployedServers).where(eq(schema.deployedServers.status, 'active'));
    
        for (const server of servers) {
            // Check if server is about to expire
            const expiresAt = new Date(server.expires_at as string);
            const diffDays = Math.ceil(Math.abs(expiresAt.getTime() - date.getTime()) / (1000 * 3600 * 24));
            if (diffDays > 2) continue;
    
            // Get user and create DM channel if it doesn't exist
            const user = await client.users.fetch(server.discordUser);
            await user.createDM();
    
            // Send expiration warning to user
            const initialMessage = await user.dmChannel.send({ embeds: [{ description: `Hello! Your server with ID \`\`${server.serverId}\`\` is about to expire. Do you wish to extend it for another 14 days?`}] });
            await initialMessage.react('✅');
            await initialMessage.react('❌');

            const filter = (reaction: any, reactingUser: any) => {
                return ['✅', '❌'].includes(reaction.emoji.name) && reactingUser.id === user.id;
            };

            try {
                const collected = await initialMessage.awaitReactions({ filter, max: 1, time: Number(process.env.USER_WAIT_TIME) || 300000, errors: ['time'] });
                const reaction = collected.first();

                if(reaction.emoji.name === '✅') {
                    const extendedExpiresAt = new Date(server.expires_at as string);
                    extendedExpiresAt.setDate(extendedExpiresAt.getDate() + Number(process.env.SERVER_EXPIRE || 14));
            
                    await unSuspendServer(server.serverId);
                    await db.update(schema.deployedServers).set({ expires_at: extendedExpiresAt.toISOString() }).where(eq(schema.deployedServers.serverId, server.serverId));
                    await user.dmChannel.send({ embeds: [{ description: `Your server has been extended. Please let us know if you need anything else.` }] });
                    await sendToAdminChannel('⌛ Server Extended', `Server \`\`${server.serverId}\`\` has been extended by 14 days.\nNow Expires at \`\`${extendedExpiresAt.toISOString()}\`\`\nOwner: <@${user.id}>`);
                    
                } else if(reaction.emoji.name === '❌') {
                    await db.update(schema.deployedServers).set({ status: 'expired' }).where(eq(schema.deployedServers.serverId, server.serverId));
                    await deleteServer(server.serverId);
                    await user.dmChannel.send({ embeds: [{ description: `Your server has been marked as expired and will be deleted shortly.` }] });
                    await sendToAdminChannel('⚰️ Server Expired', `<@${user.id}> no longer wishes to keep server \`\`${server.serverId}\`\` Server.\n\`\`${server.serverId}\`\` has been marked as expired and will be deleted shortly.`);
                }
            } catch (error) {
                await user.dmChannel.send({ 
                    embeds: [{  description: `No response received. You will receive another warning in 8h. If you fail to respond, your server will be marked as expired. **__Your server will be suspended in the meantime.__**`  }] 
                });
                await suspendServer(server.serverId);
                await sendToAdminChannel('💧 Server Suspended', `Server \`\`${server.serverId}\`\` has been suspended due to no response from user.\nUser: <@${user.id}>`);
                continue; // Skip to next server if no response
            }
        }
    }
    
    // Check for expired servers and delete them
    async function checkExpired() {
        console.log(colors.cyan("Checking for expired servers..."));
        const date = new Date();

        // Get all active servers
        const expiredServers = await db.select().from(schema.deployedServers).where(eq(schema.deployedServers.status, 'active'));
        for (const server of expiredServers) {
            const expiresAt = new Date(server.expires_at as string); 
            if (date > expiresAt) {
                const user = await client.users.fetch(server.discordUser);

                await db.update(schema.deployedServers).set({ status: 'expired' }).where(eq(schema.deployedServers.serverId, server.serverId));
                await deleteServer(server.serverId);
                await sendToAdminChannel('Server Expired', `Server ${server.serverId} has expired and been deleted.\nUser: ${user.tag}`);
                console.log(colors.red(`Server \`\`${server.serverId}\`\` expired`));
            }
        }
    }
    
    // Run the checks every 8 hours
    checkWithUser();
    setInterval(checkWithUser, 8 * 60 * 60 * 1000); // 8 hours

    checkExpired();
    setInterval(checkExpired, 8 * 60 * 60 * 1000); // 8 hours
}