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
import test from "./commands/test.js";

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
  // console.log(interaction);

  if (interaction.isChatInputCommand()) {
    // console.log(interaction);
    if (interaction.commandName === "testing") {
      const modal = new ModalBuilder()
        .setTitle("New Job Posting")
        .setCustomId("newJob")
        .setComponents(
          new ActionRowBuilder().setComponents(
            new TextInputBuilder()
              .setLabel("Job Posting Name/Details ?")
              .setCustomId("jobPostingInput")
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          )
        );
      await interaction.showModal(modal);
      try{
        const modalResponse = await interaction.awaitModalSubmit({
          filter: (i) => i.customId=='newJob'&&i.user.id === interaction.user.id,
          time: 60000,
        })


        if(modalResponse.isModalSubmit()){
          console.log(modalResponse.fields.getTextInputValue("jobPostingInput"))
          await modalResponse.reply({
            content: "Your submission was received successfully!",
          });
        }
      }catch(err){
        console.log(err)
      }
      // const actionRowComponent = new ActionRowBuilder().setComponents(
      //   new SelectMenuBuilder().setCustomId("job_options").setOptions([
      //     { label: "Waiting Response ⏳", value: "Waiting" },
      //     { label: "Offer/Interview ✅", value: "Offer/Interview" },
      //     { label: "Rejected ❌", value: "Rejected" },
      //   ])
      // );
      // const response = await interaction.reply({
      //   components: [actionRowComponent],
      //   fetchReply: true,
      // });
      // const collectorFilter = (i) => i.user.id === interaction.user.id;

      // try {
      //   const confirmation = await response.awaitMessageComponent({
      //     filter: collectorFilter,
      //     time: 60000,
      //   });
      //   // console.log(confirmation);
      //   // console.log(interaction.user.id);
      // } catch (e) {
      //   await interaction.editReply({
      //     content: "Confirmation not received within 1 minute, cancelling",
      //     components: [],
      //   });
      // }
    } 
    // else  {
      // console.log("sub");
      // console.log(interaction);
      if (interaction.customId === "newJob") {
        console.log(interaction.fields.getTextInputValue("jobPostingInput"));
        interaction.reply({
          content: "Your submission was received successfully!",
        });
      }
    // }
  }
});
async function main() {
  const commands = [test];
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
