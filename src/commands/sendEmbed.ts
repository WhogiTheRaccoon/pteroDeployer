import { CommandType } from "wokcommands";
import { EmbedBuilder, PermissionFlagsBits } from "discord.js";

module.exports = {
    category: 'general',
    name: 'sendembed',
    description: 'Send an embed in chat.',
    type: CommandType.SLASH,
    guildOnly: true, // Allow in dms.
    permissions: [PermissionFlagsBits.Administrator],
    options: [
        {
            name: 'embedname',
            description: 'The embed you wish to send.',
            required: true,
            type: 3,
            autocomplete: true,
        },
    ],

    autocomplete: async ({ interaction }: any) => {
        const embeds = ['introduction'];

        return embeds.map(embed => {
            return {
                name: embed.charAt(0).toUpperCase() + embed.slice(1),
                value: embed
            }
        })
    },

    callback: async ({ interaction }: any ) => {
        const embedName = interaction.options.getString('embedname');
        let embed;

        switch(embedName) {
            case 'introduction':
                embed = new EmbedBuilder()
                    .setTitle(`Welcome to ${process.env.SERVER_NAME}!`)
                    .setDescription(`Thanks for you interest in our servers!\n ${process.env.SERVER_NAME} is a private host for friends and family to deploy and enjoy game servers together.\n We have a variety of games to choose from, and we are always adding more.\n\n To get started, simply type \`/deploy\` to deploy a game server.\n\n **__It's extremely important that you have dms enabled so the bot can send you messages. If you fail to heed this warning your server will be deleted.__**`)
                    .setColor('#FF0000')
                    .setTimestamp()
                    .setFooter({ text: `${process.env.SERVER_NAME}` });
                break;
            default:
                break;
        }

        await interaction.reply({ embeds: [embed] });
    }
};
