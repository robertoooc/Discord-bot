const { SlashCommandBuilder, ActionRowBuilder } = require("discord.js");
const { SelectMenuBuilder } = require("@discordjs/builders");
const db = require("../../models");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("updatejob")
    .setDescription("Update Job Posting"),
  async execute(interaction) {
    try {
      const findUser = await db.User.findOne({
        discordId: interaction.user.id,
      });

      if (!findUser || !findUser.jobs) {
        await interaction.reply({ content: "You have no job postings to update!" });
      } else {
        const jobs = findUser.jobs.map((job) => ({
          label: job.name,
          value: job.id,
        }));

        const selectJobPosting = new ActionRowBuilder().setComponents(
          new SelectMenuBuilder()
            .setCustomId("select_job_posting")
            .setOptions(jobs)
        );

        const response = await interaction.reply({
          content: "Please select the job posting to update.",
          components: [selectJobPosting],
          fetchReply: true,
        });

        const collectorFilter = (i) => i.user.id === interaction.user.id;

        const status = await response.awaitMessageComponent({
          filter: collectorFilter,
          time: 60000,
        });

        const selectedJobId = status.values[0];
        const job = findUser.jobs.find((job) => job.id === selectedJobId);

        const updateStatus = new ActionRowBuilder().setComponents(
          new SelectMenuBuilder()
            .setCustomId("update_status")
            .setOptions([
              { label: "Waiting Response ⏳", value: "waiting" },
              { label: "Offer/Interview ✅", value: "accepted" },
              { label: "Rejected ❌", value: "rejected" },
            ])
            .setMinValues(1)
            .setMaxValues(1)
        );

        const updateResponse = await status.reply({
          content: "Please update the status of your job posting.",
          components: [updateStatus],
          fetchReply: true,
        });

        const updateStatusMessage = await updateResponse.awaitMessageComponent({
          filter: collectorFilter,
          time: 60000,
        });

        const updatedStatusValue = updateStatusMessage.values[0];

        job.status = updatedStatusValue;
        await findUser.save();

        await updateStatusMessage.reply({
          content: `Job posting for ${job.name} has been updated.`,
        });
      }
    } catch (err) {
      console.log(err);
      await interaction.editReply({ content: "Something went wrong!" });
    }
  },
};
