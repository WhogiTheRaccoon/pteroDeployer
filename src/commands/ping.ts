import { CommandType } from "wokcommands";
import { EmbedBuilder } from "discord.js";

module.exports = {
    category: 'general',
    name: 'ping',
    description: 'Check bots status',
    type: CommandType.SLASH,
    guildOnly: true, // Allow in dms.

    callback: async ({ interaction }: any ) => {

        const embed = new EmbedBuilder()
            .setTitle('Bot Ping')
            .setDescription(`Server Is Alive`)
            .setTimestamp(new Date())
            .setColor(5793266)
            .setFooter({ text: `${process.env.SERVER_NAME}` });

        await interaction.reply({ embeds: [embed] });
    }
};
