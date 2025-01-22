import createConnection from "@/db/connection";
import { Router } from "express";
import { RowDataPacket } from "mysql2";
import partnersRouter from "./partners";

const eventsRouter = Router();

eventsRouter.use("/partners", partnersRouter);

eventsRouter.get("/", async (req, res) => {
  const connection = await createConnection();

  try {
    const [events] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM events"
    );

    res.json({ events });
  } finally {
    await connection.end();
  }
});

eventsRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  const connection = await createConnection();

  try {
    const [events] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM events WHERE id = ?",
      [id]
    );

    const event = events.length ? events[0] : null;

    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    res.json({ event });
  } finally {
    await connection.end();
  }
});

export default eventsRouter;
