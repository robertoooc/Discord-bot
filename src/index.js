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
    // console.log(interaction.commandName);
    if (interaction.commandName === "testing") {
      const actionRowComponent = new ActionRowBuilder().setComponents(
        new SelectMenuBuilder().setCustomId("food_options").setOptions([
          { label: "Waiting Response ⏳", value: "Waiting" },
          { label: "Offer/Interview ✅", value: "Offer/Interview" },
          { label: "Rejected ❌", value: "Rejected" },
        ])
      );
      const response = await interaction.reply({
        components: [actionRowComponent],
        fetchReply: true,
      });
      const collectorFilter = (i) => i.user.id === interaction.user.id;

      try {
        const confirmation = await response.awaitMessageComponent({
          filter: collectorFilter,
          time: 60000,
        });
        console.log(confirmation)
      } catch (e) {
        await interaction.editReply({
          content: "Confirmation not received within 1 minute, cancelling",
          components: [],
        });
      }
    }
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
