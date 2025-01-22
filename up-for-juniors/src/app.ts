import authRouter from "@/auth";
import discordRouter from "@/discord";

import dotenv from "dotenv";
import express from "express";
import createConnection from "./db/connection";
import eventsRouter from "./events";


dotenv.config();

const app = express();

app.get("/", (_, res) => {
  res.json({ message: "API is running" });
});

app.use(express.json());
app.use("/api/discord", discordRouter);
app.use("/api/auth", authRouter);
app.use("/api", eventsRouter);

app.listen(process.env.PORT, async () => {
  const connection = await createConnection();
  await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
  await connection.execute("TRUNCATE TABLE users");
  await connection.execute("TRUNCATE TABLE partners");
  await connection.execute("TRUNCATE TABLE customers");
  await connection.execute("TRUNCATE TABLE events");
  await connection.execute("SET FOREIGN_KEY_CHECKS = 1");

  console.log(`Server is running on port ${process.env.PORT}`);
});
