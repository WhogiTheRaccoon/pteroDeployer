import { CommandType } from "wokcommands";
import { AutocompleteInteraction, MessageFlags } from "discord.js";
import { fetchUserServers, deleteServer } from "../utils/pterodactyl";
import { sendToChannel } from "../utils/logging";

module.exports = {
    category: 'general',
    name: 'cancel',
    description: 'cancel provided server ID',
    type: CommandType.SLASH,
    guildOnly: true, // Allow in dms.
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
        const servers = await fetchUserServers(interaction.user.id);
        if(!servers) return [];
        return servers;
    },

    callback: async ({ interaction }: any ) => { 
        const serverid = interaction.options.getString('serverid')!;
        
        await deleteServer(serverid);
        sendToChannel(interaction, `Server Deleted by User`, `Server ID: \`\`${serverid}\`\`\nUser: <@${interaction.user.id}>`);
        return interaction.reply({ embeds: [{ description: `Server with ID \`\`${serverid}\`\` Has successfully been deleted.`}], flags: MessageFlags.Ephemeral });
    }
};
