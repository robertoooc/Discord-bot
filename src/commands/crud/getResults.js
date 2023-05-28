const {SlashCommandBuilder} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('getresults')
    .setDescription('Get Results'),
  async execute(interaction) {
    return interaction.reply('Get Results');
  }
}