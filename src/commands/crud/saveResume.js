const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const { SelectMenuBuilder } = require("@discordjs/builders");
const db = require("../../models");

async function getResume(user, interaction) {
  try {
    const findUser = await db.User.findOne({
      discordId: user.id,
    });

    if (!findUser || !findUser?.resume) {
      return await interaction.editReply({
        content: "You have no resume to view!",
        ephemeral: true,
        components: [],
      });
    }

    const resume = findUser.resume;

    if (resume.length <= 2000) {
      await interaction.editReply({
        content: resume,
        ephemeral: true,
      });
      return;
    }

    const lines = resume.split("\n");
    let currentPart = "";
    let parts = [];

    for (const line of lines) {
      if (currentPart.length + line.length <= 2000) {
        currentPart += line + "\n";
      } else {
        parts.push(currentPart);
        currentPart = line + "\n";
      }
    }

    if (currentPart.length > 0) {
      parts.push(currentPart);
    }

    for (let i = 0; i < parts.length; i++) {
      await interaction.followUp({
        content: parts[i],
        ephemeral: true,
      });
    }
    return;
  } catch (err) {
    console.error("Error retrieving resume:", err);
    await interaction.editReply({
      content: "An error occurred while retrieving your resume.",
      ephemeral: true,
    });
  }
}

async function updateResume(user, interaction, resume) {
  try {
    let findUser = await db.User.findOne({
      discordId: user.id,
    });

    if (!findUser) {
      findUser = await db.User.create({
        discordId: user.id,
        username: user.username,
        resume: resume,
      });
    } else {
      findUser.resume = resume;
      await findUser.save();
    }

    return getResume(user, interaction);
  } catch (err) {
    console.error("Error updating resume:", err);
    await interaction.reply({
      content: "An error occurred while updating your resume.",
      ephemeral: true,
    });
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Save or view your resume."),
  async execute(interaction) {
    try {
      const actionRowComponent = new ActionRowBuilder().setComponents(
        new SelectMenuBuilder()
          .setCustomId("resume_options")
          .setOptions([
            { label: "View Resume", value: "view" },
            { label: "Update Resume", value: "update" },
          ])
          .setMinValues(1)
          .setMaxValues(1)
      );
      const response = await interaction.reply({
        content: "Please select an option",
        components: [actionRowComponent],
        fetchReply: true,
      });

      const collectorFilter = (i) => i.user.id === interaction.user.id;

      const status = await response.awaitMessageComponent({
        filter: collectorFilter,
        time: 600000,
      });

      if (status.values[0] === "view") {
        await getResume(status.user, interaction);
      } else if (status.values[0] === "update") {
        const modal = new ModalBuilder()
          .setTitle("Update Resume")
          .setCustomId("updateResume")
          .setComponents(
            new ActionRowBuilder().setComponents(
              new TextInputBuilder()
                .setLabel("Enter Your Resume")
                .setCustomId("resume")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
            )
          );

        await status.showModal(modal);

        const modalResponse = await interaction.awaitModalSubmit({
          filter: (i) =>
            i.customId === "updateResume" && i.user.id === interaction.user.id,
          time: 300000,
        });

        if (modalResponse.isModalSubmit()) {
          await modalResponse.reply({
            content: "Updating Resume...",
            ephemeral: true,
          });
          const resume = modalResponse.fields.getTextInputValue("resume");

          await updateResume(status.user, interaction, resume);
        }
      }
    } catch (err) {
      console.error("Error executing resume command:", err);
      await interaction.reply({
        content: "An error occurred while executing the resume command.",
        ephemeral: true,
      });
    }
  },
};
