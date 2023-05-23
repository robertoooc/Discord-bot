import { SlashCommandBuilder } from "@discordjs/builders";
const test = new SlashCommandBuilder()
  .setName("testing")
  .setDescription("hhg")
  // .addStringOption((option) =>
  //   option.setName("input")
  //   .setDescription("The input to echo back")
  // );
export default test.toJSON();
