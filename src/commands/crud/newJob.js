const {
  SlashCommandBuilder,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const db = require("../../models");
const { SelectMenuBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("newjob")
    .setDescription("Insert New Job Posting"),
  async execute(interaction) {
    const modal = new ModalBuilder()
      .setTitle("New Job Posting")
      .setCustomId("newJob")
      .setComponents(
        new ActionRowBuilder().setComponents(
          new TextInputBuilder()
            .setLabel("Job Posting Name")
            .setCustomId("jobPostingInput")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ),
        new ActionRowBuilder().setComponents(
          new TextInputBuilder()
            .setLabel("Job Posting Link")
            .setCustomId("jobPostingLink")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        )
      );

    await interaction.showModal(modal);

    try {
      const modalResponse = await interaction.awaitModalSubmit({
        filter: (i) => i.customId === "newJob" && i.user.id === interaction.user.id,
        time: 60000,
      });

      if (modalResponse.isModalSubmit()) {
        const actionRowComponent = new ActionRowBuilder().setComponents(
          new SelectMenuBuilder()
            .setCustomId("job_options")
            .setOptions([
              { label: "Waiting Response ⏳", value: "waiting" },
              { label: "Offer/Interview ✅", value: "accepted" },
              { label: "Rejected ❌", value: "rejected" },
            ])
            .setMinValues(1)
            .setMaxValues(1)
        );

        const response = await modalResponse.reply({
          content: "Please select the status of your job posting",
          components: [actionRowComponent],
          fetchReply: true,
        });

        const collectorFilter = (i) => i.user.id === interaction.user.id;

        const status = await response.awaitMessageComponent({
          filter: collectorFilter,
          time: 60000,
        });

        const jobName = modalResponse.fields.getTextInputValue("jobPostingInput");

        await status.reply({
          content: `Job posting for ${jobName} has been added.`,
        });

        const user = await db.User.findOne({ discordId: interaction.user.id });

        const job = {
          name: modalResponse.fields.getTextInputValue("jobPostingInput"),
          status: status.values[0],
          link: modalResponse.fields.getTextInputValue("jobPostingLink"),
        };

        if (user) {
          user.jobs.push(job);
          await user.save();
        } else {
          const newUser = await db.User.create({
            username: interaction.user.username,
            discordId: interaction.user.id,
            jobs: [job],
          });
          await newUser.save();
        }
      }
      return;
    } catch (err) {
      console.log(err);
      await interaction.editReply({
        content: "Confirmation not received within 1 minute, cancelling",
        components: [],
      });
    }
  },
};
