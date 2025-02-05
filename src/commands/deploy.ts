import { CommandType } from "wokcommands";
import { CommandInteraction, EmbedBuilder, MessageFlags, AutocompleteInteraction } from "discord.js";
import { deployInstance, checkExistingServers } from "../utils/pterodactyl";
import { sendToChannel } from "../utils/logging";
import fs from 'fs/promises';
import path from 'path';

module.exports = {
    category: 'general',
    name: 'deploy',
    description: 'Deploy a gameServer',
    type: CommandType.SLASH,
    guildOnly: false, // Allow in dms.
    options: [
        {
            name: 'servername',
            description: 'The name of the server',
            required: true,
            type: 3,
        },
        {
            name: 'gametype',
            description: 'The type of game to deploy',
            required: true,
            type: 3,
            autocomplete: true,
        },
        {
            name: 'email',
            description: 'Your email address',
            required: true,
            type: 3,
        },
        {
            name: 'serverdescription',
            description: 'The description of the server <nullable>',
            required: false,
            type: 3,
        },
    ],

    // Kind of a weird approach for autocomplete options, But I wanted to make adding or removing games as simple as possible for inexperienced admins. The main issue is every installation
    // can have different nest/egg Ids. This way it's just a matter of adding or removing lines from the games.csv file.
    autocomplete: async (interaction: AutocompleteInteraction) => {
        try {
            const filePath = path.join(__dirname, '../games.csv');
            const gamesData = await fs.readFile(filePath, 'utf-8');
            return gamesData
                .split('\n')
                .map(line => line.trim())  // Remove whitespace from each line
                .filter(Boolean)  // Remove empty lines
                .map(line => {
                    const [name, ...rest] = line.split(':');  
                    const value = rest.join(':').trim(); // Preserve `:` inside values
                    
                    return {
                        name: name ? name[0].toUpperCase() + name.slice(1).toLowerCase() : '',
                        value
                    };
                });
        } catch (error: any) {
            console.error('Error fetching games:', error);
            return [];
        }
    },

    callback: async ({ interaction }: any ) => { 
        try {
            const user = interaction.user;
            const email = interaction.options.getString('email')!;
            const serverName = interaction.options.getString('servername')!;
            const gameType = interaction.options.getString('gametype')!;
            const serverDescription = interaction.options.getString('serverdescription');
            user.email = email;

            // Check if user has reached the maximum number of servers
            await checkExistingServers(user);

            const { newUser, newServer } = await deployInstance(user, { serverName, serverDescription, gameType });
            if (!newServer || !newUser) throw new Error('Failed to create the server instance.');

            const messageDetails = `
            **Server Name:** \`${newServer.name}\`
            **Server Description:** \`${newServer.description || 'N/A'}\`
            **Game Type:** \`${gameType}\`
            **Owner:** \`${newUser}\`
            **Discord User:** <@${interaction.user.id}>
            **Email:** \`${email}\`
            `;

            // Create and send embed response
            const embed = new EmbedBuilder()
            .setTitle('✅ Server Deployed Successfully')
            .setDescription(`${messageDetails}\n\nPlease check your email with steps to access your server.\n If you have any questions, please contact support.`)
            .setTimestamp()
            .setColor(0x5865F2)
            .setFooter({ text: `${process.env.SERVER_NAME} - By Whogi` });

            // Log to Administration Channel
            sendToChannel(interaction, `📢 New Server Deployed`, messageDetails);

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (error: any) {
            console.error('Error deploying server:', error);
            const errorMessage = error.message?.includes('you already have') ? error.message : '❌ An error occurred while deploying your server. Please try again later.';
            return interaction.reply({ embeds: [{ description: `❌ ${errorMessage}`}], flags: MessageFlags.Ephemeral });
        }
    }
};