import { SlashCommandBuilder, } from "@discordjs/builders";
import { CommandInt } from "../types/types";
import { MessageEmbed } from "discord.js";
export const test: any = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("type anything")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("the message goes here")
        .setRequired(true)
    ),
  run: async (interaction:any) => {
    await interaction.deferReply();
    const { user } = interaction;
    const text = interaction.options.getString("message", true);
    console.log(user, text);
    const sendMessage = new MessageEmbed();
    sendMessage.setTitle("test");
    sendMessage.setDescription(text);
    sendMessage.setAuthor({
      name: user.tag,
      // iconURL: user.displayAvatarURL(),
    });
    
		const message = await interaction.editReply({ content: 'You can react with Unicode emojis!', fetchReply: true })
    await message.react('🛑')
    // message.reply

    // sendMessage.addField("Day",new Date(Date.now()).toLocaleString(), true);
    // await interaction.reply({embeds:[sendMessage]})
    
  },
};

