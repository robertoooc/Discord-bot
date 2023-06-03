const { SlashCommandBuilder, ActionRowBuilder } = require("discord.js");
const { SelectMenuBuilder } = require("@discordjs/builders");
const db = require("../../models");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("removejob")
    .setDescription("Remove Job Posting"),
  async execute(interaction) {
    try {
      const findUser = await db.User.findOne({
        discordId: interaction.user.id,
      });

      if (!findUser || findUser.jobs == null) {
        interaction.reply({ content: "You have no job postings to update!" });
      } else {
        const jobs = findUser.jobs.map((job) => {
          return {
            label: job.name,
            value: job.id,
          };
        });

        const selectJobPosting = new ActionRowBuilder().setComponents(
          new SelectMenuBuilder()
            .setCustomId("remove_job_posting")
            .setOptions(jobs)
            .setMinValues(1)
            .setMaxValues(1)
        );

        const response = await interaction.reply({
          content: "Please select a job posting to remove.",
          components: [selectJobPosting],
          fetchReply: true,
        });

        const collectorFilter = (i) => i.user.id === interaction.user.id;

        const status = await response.awaitMessageComponent({
          filter: collectorFilter,
          time: 60000,
        });

        console.log(status.values[0]);

        const job = findUser.jobs.find((job) => job.id == status.values[0]);
        console.log(job);

        findUser.jobs.pull(job);
        await findUser.save();
        console.log(findUser.jobs);

        await status.reply({
          content: `Job posting for ${job.name} has been removed.`,
        });
      }
    } catch (err) {
      console.log(err);
      interaction.editReply({ content: "Something went wrong!" });
    }
  },
};
