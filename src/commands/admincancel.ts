import { CommandType } from "wokcommands";
import { AutocompleteInteraction, MessageFlags, PermissionFlagsBits } from "discord.js";
import { fetchAllServers, deleteServer } from "../utils/pterodactyl";
import { sendToChannel } from "../utils/logging";

module.exports = {
    category: 'general',
    name: 'admincancel',
    description: 'cancel provided server ID',
    type: CommandType.SLASH,
    guildOnly: true, // Allow in dms.
    permissions: [PermissionFlagsBits.Administrator],
    options: [
        {
            name: 'serverid',
            description: 'The server you wish to cancel.',
            required: true,
            type: 3,
            autocomplete: true,
        },
    ],

    autocomplete: async (command: any, argument: string, interaction: AutocompleteInteraction) => {
        if (interaction.user.id !== '195305902981644288' && interaction.user.id !== '202967961298927616') return []; // Only allow Root users to use this command.
        const servers = await fetchAllServers();
        return servers;
    },

    callback: async ({ interaction }: any ) => { 
        const serverid = interaction.options.getString('serverid')!;

        await deleteServer(serverid);
        sendToChannel(interaction, `Server Deleted by Admin`, `Server ID: \`\`${serverid}\`\`\nUser: <@${interaction.user.id}>`);
        return interaction.reply({ embeds: [{ description: `Server with ID \`\`${serverid}\`\` Has successfully been deleted.`}], flags: MessageFlags.Ephemeral });
    }
};
