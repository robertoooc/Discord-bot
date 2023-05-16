import { Client } from "discord.js";
import { REST } from "@discordjs/rest";
import { CommandList } from "../commands/_CommandList";
import { Routes } from "discord-api-types/v9";

export const onReady = async (BOT: Client) => {
  const rest = new REST({ version: "9" }).setToken(
    process.env.BOT_TOKEN as string
  );
  const commandData = CommandList.map((command) => command.data.toJSON());

  await rest.put(
    // not using applicationGuildCommands just so the bot can be used everywhere as opposed to one specific server
    Routes.applicationCommands(
      BOT.user?.id || "missing id"
    ),
    { body: commandData }
  );
  console.log('maybe workds')
};
