import { SlashCommandBuilder } from "@discordjs/builders";
const updateJob = new SlashCommandBuilder()
  .setName("updatejob")
  .setDescription("Update Job Posting")

export default updateJob.toJSON();
