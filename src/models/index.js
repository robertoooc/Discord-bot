import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
// require('dotenv').config();

export function dbConnect() {
  const dbName = "DiscordBot";
  const uri = process.env.MONGOD_URI || "mongodb://127.0.0.1/" + dbName;
  console.log(process.env.MONGOD_URI);

  mongoose.connect(uri);
  const db = mongoose.connection;

  db.once("open", () =>
    console.log(`mongodb has connected at ${db.host}:${db.port}`)
  );

  db.on("error", (error) => console.log(error.message));

  return db;
}
