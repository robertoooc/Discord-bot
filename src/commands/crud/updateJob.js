const {SlashCommandBuilder} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName("updatejob")
  .setDescription("Update Job Posting"),
  async execute(interaction) {
    return interaction.reply('Get Results');
  }
}