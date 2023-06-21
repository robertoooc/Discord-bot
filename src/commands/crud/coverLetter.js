const {
  SlashCommandBuilder,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
  ButtonBuilder,
} = require("discord.js");
require(`dotenv`).config();
const { Configuration, OpenAIApi } = require("openai");
const db = require("../../models");
const configuration = new Configuration({
  apiKey: process.env.API_KEY,
});
const openai = new OpenAIApi(configuration);

async function generateCoverLetter(resume, jobPosting) {
  const prompt = `Tone: Conversational, Spartan, use less Corporate Jargon. Given this resume: ${resume}. Write a 3-4 paragraph cover letter for this job Posting: ${jobPosting}. Focus on the details of the resume and how they relate to the job posting or can be used to show your skills.`;
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0.2,
      max_tokens: 1000,
      top_p: 0.9,
      frequency_penalty: 0.0,
      presence_penalty: 0.6,
    });

    // console.log(response.data.choices[0].text.trim());
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.log("Error:", error.response.data.error);
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("createcoverletter")
    .setDescription("Generate a Cover Letter"),
  async execute(interaction) {
    // let oldResume = false;
    const findUser = await db.User.findOne({
      discordId: interaction.user.id,
    }).populate("resume");
    let component;
    if (!findUser || findUser?.resume == null) {
      component = new ActionRowBuilder().setComponents(
        new TextInputBuilder()
          .setLabel("Resume")
          .setCustomId("resume")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
      );
    } else if (findUser?.resume != null) {
      component = new ActionRowBuilder().setComponents(
        new TextInputBuilder()
          .setLabel("Resume (leave blank to use saved resume)")
          .setCustomId("resume")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(false)
      );
    }

    const modal = new ModalBuilder()
      .setTitle("Cover Letter Generator")
      .setCustomId("coverLetter")
      .setComponents(
        component,
        new ActionRowBuilder().setComponents(
          new TextInputBuilder()
            .setLabel("Job Posting Description")
            .setCustomId("jobPostingDescription")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
        )
      );

    await interaction.showModal(modal);

    try {
      const modalResponse = await interaction.awaitModalSubmit({
        filter: (i) =>
          i.customId === "coverLetter" && i.user.id === interaction.user.id,
        time: 300000,
      });
      if (modalResponse.isModalSubmit()) {
        await modalResponse.reply({
          content: "Generating Cover Letter...",
          ephemeral: true,
        });

        console.log(modalResponse.fields.getTextInputValue("resume").length);
        const resume =
          modalResponse.fields.getTextInputValue("resume").length > 0
            ? modalResponse.fields.getTextInputValue("resume")
            : findUser.resume;

        const jobPosting = modalResponse.fields.getTextInputValue(
          "jobPostingDescription"
        );
        const coverLetter = await generateCoverLetter(resume, jobPosting);

        if (coverLetter.length <= 2000) {
          await modalResponse.editReply({
            content: coverLetter,
            ephemeral: true,
          });
          return;
        }

        const lines = coverLetter.split("\n");
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
          await modalResponse.followUp({
            content: parts[i],
            ephemeral: true,
          });
        }
        // await modalResponse.editReply({
        //   content: `Here is your cover letter: \n ${coverLetter}`,
        //   ephemeral: true,
        // });
      }
    } catch (err) {
      console.log(err);
    }
  },
};
