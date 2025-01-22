import { authRouter } from "@/controller/auth-controller";
import { customerRouter } from "@/controller/customer-controller";
import { eventRouter } from "@/controller/event-controller";
import { partnerRouter } from "@/controller/partner-controller";
import { ticketRouter } from "@/controller/ticket-controller";
import { Database } from "@/database";
import discordRouter from "@/discord";

import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();

app.get("/", (_, res) => {
  res.json({ message: "API is running" });
});

app.use(express.json());
app.use("/api/discord", discordRouter);
app.use("/api/auth", authRouter);
app.use("/api/partners", partnerRouter);
app.use("/api/customers", customerRouter);
app.use("/api/events", eventRouter);
app.use("/api/events", ticketRouter);

app.listen(process.env.PORT, async () => {
  const connection = Database.getInstance();
  await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
  await connection.execute("TRUNCATE TABLE users");
  await connection.execute("TRUNCATE TABLE partners");
  await connection.execute("TRUNCATE TABLE customers");
  await connection.execute("TRUNCATE TABLE events");
  await connection.execute("TRUNCATE TABLE tickets");
  await connection.execute("SET FOREIGN_KEY_CHECKS = 1");

  console.log(`Server is running on port ${process.env.PORT}`);
});
