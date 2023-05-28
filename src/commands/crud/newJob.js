// import { SlashCommandBuilder } from "@discordjs/builders";
// const jobPosting = new SlashCommandBuilder()
//   .setName("newjob")
//   .setDescription("Insert New Job Posting")

// export default jobPosting.toJSON();
const {SlashCommandBuilder} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('getresults')
    .setDescription('Get Results'),
  async execute(interaction) {
    return interaction.reply('Get Results');
  }
}