import createConnection from "@/db/connection";
import { Router } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { authMiddleware } from "../../auth/middleware";

const partnersRouter = Router();

partnersRouter.use(authMiddleware);

partnersRouter.get("/events", async (req, res) => {
  const user_id = req.user!.id;

  const connection = await createConnection();

  try {
    const [rows] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM partners WHERE user_id = ?",
      [user_id]
    );

    const partner = rows.length ? rows[0] : null;

    if (!partner) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    const [events] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM events WHERE partner_id = ?",
      [partner.id]
    );

    res.json({ events });
  } finally {
    await connection.end();
  }
});

partnersRouter.get("/events/:id", async (req, res) => {
  const { id } = req.params;

  const user_id = req.user!.id;

  const connection = await createConnection();

  try {
    const [rows] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM partners WHERE user_id = ?",
      [user_id]
    );

    const partner = rows.length ? rows[0] : null;

    if (!partner) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    const [events] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM events WHERE id = ? AND partner_id = ?",
      [id, partner.id]
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

partnersRouter.post("/events", async (req, res) => {
  const { name, description, date, location } = req.body;

  const user_id = req.user!.id;

  const connection = await createConnection();

  try {
    const [rows] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM partners WHERE user_id = ?",
      [user_id]
    );

    const partner = rows.length ? rows[0] : null;

    if (!partner) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    const eventDate = new Date(date);

    const [result] = await connection.execute<ResultSetHeader>(
      "INSERT INTO events (id, name, description, date, location, partner_id, created_at, updated_at) VALUES (UUID(), ?, ?, ?, ?, ?, NOW(), NOW())",
      [name, description, eventDate, location, partner.id]
    );

    res.status(201).json({
      message: "Partner Event created",
      id: result.insertId,
      name,
      description,
      date: eventDate,
      location,
      partner_id: partner.id,
    });
  } finally {
    await connection.end();
  }
});

export default partnersRouter;
