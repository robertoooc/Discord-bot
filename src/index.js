// import { config } from "dotenv";
// require('dotenv').config();
import dotenv from "dotenv";
dotenv.config();
import {
  ActionRowBuilder,
  Client,
  GatewayIntentBits,
  InteractionType,
  ModalBuilder,
  Routes,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
  Events,
  ButtonBuilder,
} from "discord.js";
import { SelectMenuBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import jobPosting from "./commands/newJob.js";
import updateJob from "./commands/updateJob.js";
import getResults from "./commands/getResults.js";
import { dbConnect } from "./models/index.js";
import User from "./models/User.js";
dbConnect();
// config();

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
    if (interaction.customId == "see_all") {
      console.log("see all ,,,");
    }

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

        await udpateResponse.reply({
          content: "Your job posting has been updated!",
        });
      } catch (err) {
        console.log(err);
        interaction.editReply({ content: "Something went wrong!" });
      }
    } else if (interaction.commandName == "getresults") {
      const getResults = await User.findOne({
        discordId: interaction.user.id,
      }).select("jobs");
      const waiting = getResults.jobs.filter((job) => job.status == "waiting");
      const accepted = getResults.jobs.filter(
        (job) => job.status == "accepted"
      );
      const rejected = getResults.jobs.filter(
        (job) => job.status == "rejected"
      );

      console.log(waiting, accepted, rejected);
      const embeddedMessage = new EmbedBuilder()
        .setTitle("Job Postings")
        .setDescription("Here are your job postings")
        .addFields(
          { name: "Total Jobs Applied to", value: `${getResults.jobs.length}` },
          {
            name: "Jobs Waiting Response ⏳",
            value: `${waiting.length}`,
            inline: true,
          },
          {
            name: "Jobs Accepted ✅",
            value: `${accepted.length}`,
            inline: true,
          },
          {
            name: "Jobs Rejected ❌",
            value: `${rejected.length}`,
            inline: true,
          }
        );

      const seeAll = new ButtonBuilder()
        .setCustomId("see_all")
        .setLabel("See All Jobs")
        .setStyle("Primary");

      const waitingButton = new ButtonBuilder()
        .setCustomId("waiting_button")
        .setLabel("See Waiting Response ⏳ Jobs")
        .setStyle("Secondary");

      const acceptedButton = new ButtonBuilder()
        .setCustomId("accepted_button")
        .setLabel("See Accepted ✅ Jobs")
        .setStyle("Success");

      const rejectedButton = new ButtonBuilder()
        .setCustomId("rejected_button")
        .setLabel("See Rejected ❌ Jobs")
        .setStyle("Danger");

      const row = new ActionRowBuilder().setComponents(
        seeAll,
        waitingButton,
        acceptedButton,
        rejectedButton
      );
      try {
        const fetchReply = await interaction.reply({
          embeds: [embeddedMessage],
          components: [row],
          fetchReply: true,
        });

        const collectResponse = await fetchReply.awaitMessageComponent({
          filter: (i) => i.user.id === interaction.user.id,
          time: 60000,
        });
        console.log(collectResponse);
        console.log(collectResponse.customId);

        if (collectResponse.customId == "see_all") {
          const allJobs = getResults.jobs.map((job) => {
            return {
              name: job.name,
              value: job.status,
            };
          });

          const embeddedMessage = new EmbedBuilder()
            .setTitle("All Job Postings")
            .setDescription("Here are your job postings")
            .addFields(allJobs);

          await collectResponse.reply({
            embeds: [embeddedMessage],
          });
        } else if (collectResponse.customId == "waiting_button") {
          const waitingJobs = getResults.jobs
            .filter((job) => job.status == "waiting")
            .map((job) => {
              return {
                name: job.name,
                value: job.status,
              };
            });

          const embeddedMessage = new EmbedBuilder()
            .setTitle("Waiting Response ⏳ Job Postings")
            .setDescription("Here are your job postings")
            .addFields(waitingJobs);

          await collectResponse.reply({
            embeds: [embeddedMessage],
          });
        } else if (collectResponse.customId == "accepted_button") {
          const acceptedJobs = getResults.jobs
            .filter((job) => job.status == "accepted")
            .map((job) => {
              return {
                name: job.name,
                value: job.status,
              };
            });

          const embeddedMessage = new EmbedBuilder()
            .setTitle("Accepted ✅ Job Postings")
            .setDescription("Here are your job postings")
            .addFields(acceptedJobs);

          await collectResponse.reply({
            embeds: [embeddedMessage],
          });
        } else if (collectResponse.customId == "rejected_button") {
          const rejectedJobs = getResults.jobs
            .filter((job) => job.status == "rejected")
            .map((job) => {
              return {
                name: job.name,
                value: job.status,
              };
            });

          const embeddedMessage = new EmbedBuilder()
            .setTitle("Rejected ❌ Job Postings")
            .setDescription("Here are your job postings")
            .addFields(rejectedJobs);

          await collectResponse.reply({
            embeds: [embeddedMessage],
          });
        }
      } catch (err) {
        console.log(err);
        await interaction.editReply("Session Timed Out!");
      }
    } else {
      console.log(interaction.customId);
      await interaction.editReply("Something went wrong!");
    }
  }
});
async function main() {
  const commands = [jobPosting, updateJob, getResults];
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
