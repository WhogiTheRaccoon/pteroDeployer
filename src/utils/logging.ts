import { EmbedBuilder, TextChannel  } from "discord.js";
import { client } from "../index";

// Send message to channel using interaction in same guild.
export async function sendToChannel(interaction: any, title: string, message: string) {
    const channel = await interaction.guild?.channels.fetch(process.env.LOG_CHANNEL_ID as string);
    if (!channel) throw new Error("Failed to fetch channel");

    const embed = new EmbedBuilder()
        .setTitle(`${title}`)
        .setDescription(`${message}`)
        .setTimestamp()
        .setColor(0x5865F2)
        .setFooter({ text: `${process.env.SERVER_NAME} - By Whogi` });

    return channel.send({ embeds: [embed] });
}

// Send message to channel in a specific guild for administrative logging.
export async function sendToAdminChannel(title: string, message: string) {
    const guild = await client.guilds.fetch(process.env.GUILD_ID as string);
    const channel = await guild.channels.fetch(process.env.LOG_CHANNEL_ID as string);
    
    if (!channel || !(channel instanceof TextChannel)) {
        throw new Error("Failed to fetch a valid text channel");
    }

    const embed = new EmbedBuilder()
        .setTitle(`${title}`)
        .setDescription(`${message}`)
        .setTimestamp()
        .setColor(0x5865F2)
        .setFooter({ text: `${process.env.SERVER_NAME} - By Whogi` });

    return channel.send({ embeds: [embed] });
}