import { SlashCommandBuilder } from "@discordjs/builders";
const jobPosting = new SlashCommandBuilder()
  .setName("newjob")
  .setDescription("Insert New Job Posting")

export default jobPosting.toJSON();
