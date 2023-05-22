import { SlashCommandBuilder } from '@discordjs/builders';
const test = new SlashCommandBuilder()
  .setName('testing')
  .setDescription('hhg')

export default test.toJSON()