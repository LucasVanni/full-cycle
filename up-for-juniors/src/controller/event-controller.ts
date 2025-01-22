import { EventService } from "@/services/event-service";
import { Router } from "express";

export const eventRouter = Router();

eventRouter.get("/", async (_, res) => {
  const eventService = new EventService();
  const events = await eventService.findAll();

  res.json({ events });
});

eventRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  const eventService = new EventService();
  const event = await eventService.findById(id);

  if (!event) {
    res.status(404).json({ message: "Event not found" });
    return;
  }

  res.json({ event });
});
