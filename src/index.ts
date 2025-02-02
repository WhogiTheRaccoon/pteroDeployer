import { Client, IntentsBitField, Partials, ActivityType } from 'discord.js';
import WOK from 'wokcommands';
import path from 'path';
import colors from 'colors';
import { sqlite } from './db/setup';

// Constants
require('dotenv').config();

// Clients
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.DirectMessageReactions,
    ],
    partials: [Partials.Channel, Partials.Message, Partials.Reaction],
    presence: {
        status: "online",
        activities: [ { name: `${process.env.SERVER_NAME} Billing System`, type: ActivityType.Watching, url: `${process.env.SITE_URL}` } ],
    }
});

client.on('ready', () => {
    new WOK({
        client,
        commandsDir: path.join(__dirname, 'commands'),
        featuresDir: path.join(__dirname, 'features'),
        testServers: [`${process.env.GUILD_ID}`],
        botOwners: ['202967961298927616', '195305902981644288'],
        disabledDefaultCommands: [
            "channelcommand",
            "customcommand",
            "requiredpermissions",
            "requiredroles",
            "togglecommand",
            "prefix"
        ],
    })
    console.log(colors.green(`Logged in as ${client.user?.tag}`));
});

if(!process.env.TOKEN) {
    console.log(colors.red("Please provide a token in the .env file"));
    process.exit(1);
}

client.login(process.env.TOKEN as string);

// Handle graceful shutdown
const shutdown = () => {
    console.log("Shutting down bot...");
    sqlite.close(); // Close SQLite database
    console.log("✅ Database connection closed.");
    process.exit(0);
};
  
process.on("SIGINT", shutdown);  // Handles Ctrl+C
process.on("SIGTERM", shutdown); // Handles kill command
process.on("uncaughtException", (err) => {
    console.error("Unhandled error:", err);
    shutdown();
});

// Export client for use in other files
export { client };