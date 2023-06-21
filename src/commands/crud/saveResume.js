const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const db = require("../../models");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("saveresume")
    .setDescription("Don't want to paste your resume every time? Save it!"),
  async execute(interaction) {
    const modal = new ModalBuilder()
      .setTitle("Save Resume")
      .setCustomId("saveResume")
      .setComponents(
        new ActionRowBuilder().setComponents(
          new TextInputBuilder()
            .setLabel("Enter Your Resume")
            .setCustomId("resume")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
        )
      );

    await interaction.showModal(modal);
    try {
      const modalResponse = await interaction.awaitModalSubmit({
        filter: (i) =>
          i.customId === "saveResume" && i.user.id === interaction.user.id,
        time: 300000,
      });
      if (modalResponse.isModalSubmit()) {
        await modalResponse.reply({
          content: "Saving Resume...",
          ephemeral: true,
        });
        const resume = modalResponse.fields.getTextInputValue("resume");
        const user = await db.User.findOne({
          discordId: interaction.user.id,
        });
        if (user) {
          user.resume = resume;
          await user.save();
        } else {
          await db.User.create({
            discordId: interaction.user.id,
            username: interaction.user.username,
            resume: resume,
          });
        }
        await modalResponse.editReply({
          content: `Your resume has been saved! \n ${resume}`,
          ephemeral: true,
        });
      }
    } catch (err) {
      console.log(err);
    }
  },
};
