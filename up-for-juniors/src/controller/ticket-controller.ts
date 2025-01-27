import { authMiddleware } from "../middleware";
import { PartnerService } from "../services/partner-service";
import { TicketService } from "../services/ticket-service";

import { Router } from "express";
export const ticketRouter = Router();

ticketRouter.use(authMiddleware);

ticketRouter.post("/:eventId/tickets", async (req, res) => {
  const userId = req.user!.id;

  const partnerService = new PartnerService();

  const partner = await partnerService.findByUserId(userId);

  if (!partner) {
    res.status(403).json({ message: "Not authorized" });
    return;
  }

  const { num_tickets, price } = req.body;

  const { eventId } = req.params;

  const ticketService = new TicketService();

  await ticketService.createMany({
    eventId,
    numTickets: num_tickets,
    price,
  });

  res.status(204).send();
});

ticketRouter.get("/:eventId/tickets", async (req, res) => {
  const { eventId } = req.params;

  const ticketService = new TicketService();

  const tickets = await ticketService.findByEventId(eventId);

  res.json(tickets);
});

ticketRouter.get("/:eventId/tickets/:id", async (req, res) => {
  const { eventId, id } = req.params;

  const ticketService = new TicketService();

  const ticket = await ticketService.findById(eventId, id);

  if (!ticket) {
    res.status(404).json({ message: "Ticket not found" });
    return;
  }

  res.json(ticket);
});
