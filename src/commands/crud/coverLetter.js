const {
  SlashCommandBuilder,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
require(`dotenv`).config();
const { Configuration, OpenAIApi } = require("openai");

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

    console.log(response.data.choices[0].text.trim());
  } catch (error) {
    console.log("Error:", error.response.data.error);
  }
}

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
      if (modalResponse.isModalSubmit()) {
        const resume = modalResponse.fields.getTextInputValue("resume");
        const jobPosting = modalResponse.fields.getTextInputValue(
          "jobPostingDescription"
        );
        await generateCoverLetter(resume, jobPosting);
      }
    } catch (err) {
      console.log(err);
    }
  },
};
