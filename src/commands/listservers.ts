import { CommandType } from "wokcommands";
import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { db, schema } from '../db/setup'
import { eq, or, and } from 'drizzle-orm'

module.exports = {
    category: 'general',
    name: 'listservers',
    description: 'List all active Servers',
    type: CommandType.SLASH,
    guildOnly: true, // Allow in dms.
    permissions: [PermissionFlagsBits.Administrator],

    callback: async ({ interaction, client }: any ) => {
        const servers = await db.select().from(schema.deployedServers).where(eq(schema.deployedServers.status, 'active'));
        if (servers.length === 0)  return await interaction.reply('No active servers found');

        const embed = new EmbedBuilder()
            .setTitle('Active Servers')
            .setDescription(`Active Servers: ${servers.length}`)
            .setTimestamp(new Date())
            .setColor(5793266)
            .setFooter({ text: `${process.env.SERVER_NAME}` });
        
        for (const server of servers) {
            const discordUser = await client.users.fetch(server.discordUser);
            embed.addFields({
                name: 'Server',
                value: `ServerId: ${server.serverId}\nDiscordUser: ${discordUser}\nPteroUser: ${server.pteroUser}`,
                inline: true
            });
        }


        await interaction.reply({ embeds: [embed] });
    }
};
