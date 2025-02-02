import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import dotenv from 'dotenv';
import * as schema from './schema';
dotenv.config();

const dbFile = process.env.DB_FILE;
if (!dbFile) throw new Error('DB_FILE environment variable is required');

const sqlite = new Database(dbFile, { verbose: console.log });
const db = drizzle(sqlite);

// Error handling with more detailed logging
process.on('uncaughtException', (error: any) => {
    console.error('Uncaught Exception:', error.stack || error);
    process.exit(1);
});

process.on('unhandledRejection', (error: any) => {
    console.error('Unhandled Rejection:', error.stack || error);
    process.exit(1);
});

export { db, schema, sqlite };