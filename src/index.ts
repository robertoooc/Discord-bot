import { IntentOptions } from "./config/IntentOptions";
import { Client } from "discord.js";
import { dbConnect } from "./db/dbConnect";
import { validateEnv } from "./utils/validateEnv";
import { onInteraction } from "./ events/onInteraction";
(async () => {
  if (!validateEnv()) return;

  const BOT = new Client({ intents: IntentOptions });

  BOT.on("ready", () => console.log("Connected to Discord!"));
  BOT.on(
    "interactionCreate",
    async (interaction) => await onInteraction(interaction)
  );
  await dbConnect();

  await BOT.login(process.env.BOT_TOKEN);
})();
