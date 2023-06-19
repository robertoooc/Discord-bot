const {
  SlashCommandBuilder,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
} = require("discord.js");
const db = require("../../models");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("saveresume")
    .setDescription("Don't want to paste your resume every time? Save it!"),
  async execute(interaction) {},
};
