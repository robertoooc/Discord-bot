const {
  SlashCommandBuilder,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
require(`dotenv`).config();
const API_KEY = process.env.API_KEY;
const axios = require("axios");
// const db = require("../../models");
async function generateCoverLetter(resume, jobPosting) {
  const prompt = `Write a cover letter for a job application. Tone: conversational, startan, use less corporate jargon.
  The Resume: ${resume}, The Job Posting: ${jobPosting}
  `;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/engines/davinci-codex/completions",
      {
        prompt: prompt,
        max_tokens: 200,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    const generatedText = response.data.choices[0].text;
    console.log(generatedText);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Call the function to generate the cover letter
generateCoverLetter();
module.exports = {
  data: new SlashCommandBuilder()
    .setName("createcoverletter")
    .setDescription("Generate a Cover Letter"),
  async execute(interaction) {
    const modal = new ModalBuilder()
      .setTitle("Cover Letter Generator")
      .setCustomId("coverLetter")
      .setComponents(
        new ActionRowBuilder().setComponents(
          new TextInputBuilder()
            .setLabel("Enter Your Resume")
            .setCustomId("resume")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
        ),
        new ActionRowBuilder().setComponents(
          new TextInputBuilder()
            .setLabel("Enter the Job Posting Description")
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
        time: 60000,
      });
      console.log(modalResponse);
      const resume = modalResponse.fields.getTextInputValue("resume");
      const jobPosting = modalResponse.fields.getTextInputValue("jobPostingDescription");
      console.log(resume,jobPosting)

    } catch (err) {
      console.log(err);
    }
  },
};
