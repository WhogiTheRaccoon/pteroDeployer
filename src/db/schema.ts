import { int, sqliteTable, text, integer,  } from 'drizzle-orm/sqlite-core';

export const deployedServers = sqliteTable('deployed_servers', {
    id: integer("id").primaryKey({ autoIncrement: true }),
    discordUser: text("discord_user").notNull(),
    pteroUser: text("ptero_user").notNull(),
    serverId: int("server_id").notNull().unique(),
    status: text().notNull(),
    created_at: text(),
    updated_at: text(),
    expires_at: text(),
});

