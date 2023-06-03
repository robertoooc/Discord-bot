const {
  SlashCommandBuilder,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
} = require("discord.js");
const db = require("../../models");
const { SelectMenuBuilder } = require("@discordjs/builders");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("removejob")
    .setDescription("Remove a Job Posting"),
  async execute(interaction) {
    const user = await db.User.findOne({
      discordId: interaction.user.id,
    });
    if (!user || user.jobs.length == 0) {
      return interaction.reply({
        content: "You have no job postings to remove!",
      });
    }

    const jobs = user.jobs.map((job) => {
      return {
        label: job.name,
        value: job.id,
      };
    });

    const selectJobPosting = new ActionRowBuilder().setComponents(
      new SelectMenuBuilder().setCustomId("removo_job_posting").setOptions(jobs)
    );

    const response = await interaction.reply({
      content: "Please select the status of your job posting",
      components: [selectJobPosting],
      fetchReply: true,
    });

    const collectorFilter = (i) => i.user.id === interaction.user.id;

    const status = await response.awaitMessageComponent({
      filter: collectorFilter,
      time: 60000,
    });

    console.log(status.values[0]);
  },
};
