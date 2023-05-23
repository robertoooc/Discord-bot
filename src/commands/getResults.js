import { SlashCommandBuilder } from "@discordjs/builders";
const getResults = new SlashCommandBuilder()
  .setName("getresults")
  .setDescription("Get Results to all Job Postings")

export default getResults.toJSON();
