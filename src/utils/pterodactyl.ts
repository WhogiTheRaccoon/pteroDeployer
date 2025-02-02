import node from 'jspteroapi';
import { db, schema } from '../db/setup'
import { eq, or, and } from 'drizzle-orm'

// Initialize Pterodactyl API
const application = new node.Application(
    process.env.PTERO_URL as string, 
    process.env.PTERO_TOKEN as string
);

// Find unused Ip for pterodactyl Node
async function findUnusedIp() {
    const nodeID = Number(process.env.NODE) || 1;
    const allocations = await application.getAllAllocations(nodeID);
    const unusedAllocation = allocations.find((allocation) => !allocation.attributes.assigned);

    if (!unusedAllocation) throw new Error('No unused IP found');
    return unusedAllocation.attributes.id;
}

// Create User in pterodactyl.
export async function getOrCreateUser({username, firstName, lastName, email, externalId, password}: CreateUserOptions) { 
    const users = await application.getAllUsers();
    let existingUser = users.find((u) => u.attributes.username === `${username}`);

    return existingUser?.attributes.id ?? (await application.createUser(username, firstName, lastName, email, undefined, undefined, undefined, externalId)).id;
}

export async function suspendServer(serverId: any) {
    console.log(`Suspending server ${serverId}`);
    return await application.suspendServer(serverId);
}

export async function unSuspendServer(serverId: any) {
    console.log(`Unsuspending server ${serverId}`);
    return await application.unSuspendServer(serverId);
}

// Create Server in pterodactyl.
export async function createServer({name, ownerId, description, nestId, eggId, defaultAllocationId, cpu, ram, disk}: CreateServerOptions) {
    const newServer = await application.createServer(name, ownerId, description, nestId, eggId, defaultAllocationId, undefined, undefined, cpu, ram, disk);
    if(newServer.id === undefined) throw new Error("Failed to create server");

    return newServer;
}

export async function deleteServer(serverId: any) {
    return await application.deleteServer(serverId);
}

// Check if User already has x servers.
export async function checkExistingServers(user: any) {
    const userServers: any = await db.select().from(schema.deployedServers).where(and(eq(schema.deployedServers.discordUser, user.id), eq(schema.deployedServers.status, 'active')));    

    const maxServers = Number(process.env.SERVER_PER_USER) || 0;
    if (userServers.length >= maxServers) throw new Error(`Sorry ${user.username}, you already have ${userServers.length} server/s. (Max ${maxServers})`);

    return userServers;
}

// Set row so server expires after 1 week
async function setExpireDate(serverId: number, discordUser: any) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + Number(process.env.SERVER_EXPIRE || 14));

    const server: any = await application.getServerInfo(serverId);
    if(server === undefined) throw new Error("Failed to fetch server");

    return await db.insert(schema.deployedServers).values({
        discordUser: discordUser.id, 
        pteroUser: server?.user,
        serverId: serverId,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        expires_at: expiryDate.toISOString()
    });
}

export async function deployInstance(user: any, server: any) {
    const [gameNest, gameEgg] = server.gameType.split(':');
    const allocation = await findUnusedIp();

    // Get or create pterodactyl User
    const newUser: any = await getOrCreateUser({
        username: `${process.env.SERVER_PREFIX}_${user.username}`,
        firstName: `discord_${user.globalName}`,
        lastName: `${process.env.SERVER_PREFIX}Deploy`,
        email: user.email,
        externalId: user.id,
    });

    // Create pterodactyl Server
    const newServer = await createServer({
        name: server.serverName,
        ownerId: newUser,
        description: server.serverDescription,
        nestId: gameNest,
        eggId: gameEgg,
        defaultAllocationId: allocation as any,
        cpu: Number(process.env.CPU_LIMIT) || 100,
        ram: Number(process.env.RAM_LIMIT) || 1024,
        disk: Number(process.env.DISK_LIMIT) || 1024
    });

    // Set server Expiry
    await setExpireDate(newServer.id, user);

    return {newUser, newServer};
}