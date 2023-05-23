import { config } from "dotenv";
import {
  ActionRowBuilder,
  Client,
  GatewayIntentBits,
  InteractionType,
  ModalBuilder,
  Routes,
  TextInputBuilder,
  TextInputStyle,
  Events,
} from "discord.js";
import { SelectMenuBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import jobPosting from "./commands/newJob.js";
import updateJob from "./commands/updateJob.js";
import { dbConnect } from "./models/index.js";
import User from "./models/User.js";
dbConnect();
config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

client.on("ready", () => console.log(`${client.user.tag} has logged in!`));

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "newjob") {
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
          ),
          new ActionRowBuilder().setComponents(
            new TextInputBuilder()
              .setLabel("Notes")
              .setCustomId("notes")
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(false)
          )
        );

      await interaction.showModal(modal);

      try {
        const modalResponse = await interaction.awaitModalSubmit({
          filter: (i) =>
            i.customId == "newJob" && i.user.id === interaction.user.id,
          time: 60000,
        });

        if (modalResponse.isModalSubmit()) {
          const actionRowComponent = new ActionRowBuilder().setComponents(
            new SelectMenuBuilder().setCustomId("job_options").setOptions([
              { label: "Waiting Response ⏳", value: "waiting" },
              { label: "Offer/Interview ✅", value: "accepted" },
              { label: "Rejected ❌", value: "rejected" },
            ])
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

          await status.reply({
            content: "Your submission was received successfully!",
          });

          const findUser = await User.findOne({
            discordId: interaction.user.id,
          });

          if (findUser) {
            const job = {
              name: modalResponse.fields.getTextInputValue("jobPostingInput"),
              status: status.values[0],
              link: modalResponse.fields.getTextInputValue("jobPostingLink"),
              notes: modalResponse.fields.getTextInputValue("notes"),
            };

            findUser.jobs.push(job);
            await findUser.save();
          } else {
            const user = await User.create({
              username: interaction.user.username,
              discordId: interaction.user.id,
              jobs: [
                {
                  name: modalResponse.fields.getTextInputValue(
                    "jobPostingInput"
                  ),
                  status: status.values[0],
                  link: modalResponse.fields.getTextInputValue(
                    "jobPostingLink"
                  ),
                  notes: modalResponse.fields.getTextInputValue("notes"),
                },
              ],
            });
            await user.save();
          }
        }
      } catch (err) {
        console.log(err);
        await interaction.editReply({
          content: "Confirmation not received within 1 minute, cancelling",
          components: [],
        });
      }
    } else if (interaction.commandName == "updatejob") {
      try {
        const findUser = await User.findOne({
          discordId: interaction.user.id,
        });

        if (!findUser)
          interaction.reply({ content: "You have no job postings to update!" });

        const jobs = findUser.jobs.map((job) => {
          return {
            label: job.name,
            value: job.id,
          };
        });

        const selectJobPosting = new ActionRowBuilder().setComponents(
          new SelectMenuBuilder()
            .setCustomId("select_job_posting")
            .setOptions(jobs)
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

        const job = findUser.jobs.find((job) => job.id == status.values[0]);
        console.log(job);

        const updateStatus = new ActionRowBuilder().setComponents(
          new SelectMenuBuilder().setCustomId("update_status").setOptions([
            { label: "Waiting Response ⏳", value: "waiting" },
            { label: "Offer/Interview ✅", value: "accepted" },
            { label: "Rejected ❌", value: "rejected" },
          ])
        );

        const updateResponse = await status.reply({
          content: "Please update the status of your job posting",
          components: [updateStatus],
          fetchReply: true,
        });

        const udpateResponse = await updateResponse.awaitMessageComponent({
          filter: collectorFilter,
          time: 60000,
        });
        console.log(udpateResponse.values[0]);

        job.status = udpateResponse.values[0];
        await findUser.save();

        await udpateResponse.reply({content: "Your job posting has been updated!"})
      } catch (err) {
        console.log(err);
        interaction.editReply({ content: "Something went wrong!" });
      }
    }
  }
});
async function main() {
  const commands = [jobPosting, updateJob];
  try {
    console.log("Started refreshing application (/) commands.");
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });
    client.login(process.env.BOT_TOKEN);
  } catch (err) {
    console.log(err);
  }
}

main();
