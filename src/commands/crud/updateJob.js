// import { SlashCommandBuilder } from "@discordjs/builders";
// const updateJob = new SlashCommandBuilder()
//   .setName("updatejob")
//   .setDescription("Update Job Posting")

// export default updateJob.toJSON();

const {SlashCommandBuilder} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('getresults')
    .setDescription('Get Results'),
  async execute(interaction) {
    return interaction.reply('Get Results');
  }
}