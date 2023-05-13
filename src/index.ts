import { IntentOptions } from "./config/IntentOptions";
import { Client } from "discord.js";
import { dbConnect } from "./db/dbConnect";
// import { validateEnv } from "./utils/validateEnv";

(async () => {
  // if (!validateEnv()) return;

  const BOT = new Client({intents: IntentOptions});


  BOT.on("ready", () => console.log("Connected to Discord!"));

   await dbConnect();

  await BOT.login(process.env.BOT_TOKEN);
})();