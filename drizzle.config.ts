import { defineConfig } from 'drizzle-kit';

if(!process.env.DB_FILE) throw new Error('DB_FILE environment variable is required');

export default defineConfig({
    dialect: 'sqlite',
    out: './src/db/migrations',
    schema: "./src/db/schema.ts",
    dbCredentials: {
        url: process.env.DB_FILE,
    },
});
