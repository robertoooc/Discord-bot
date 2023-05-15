import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInt } from "../types/types";

export const test: CommandInt = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("type anything")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("the message goes here")
        .setRequired(true)
    ),
  run: async (interaction) => {
    await interaction.deferReply();
    const { user } = interaction;
    const text = interaction.options.getString("message", true);
    console.log(user, text)
  },
};
