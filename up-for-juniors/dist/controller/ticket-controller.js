"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketRouter = void 0;
const middleware_1 = require("../middleware");
const partner_service_1 = require("../services/partner-service");
const ticket_service_1 = require("../services/ticket-service");
const express_1 = require("express");
exports.ticketRouter = (0, express_1.Router)();
exports.ticketRouter.use(middleware_1.authMiddleware);
exports.ticketRouter.post("/:eventId/tickets", async (req, res) => {
    const userId = req.user.id;
    const partnerService = new partner_service_1.PartnerService();
    const partner = await partnerService.findByUserId(userId);
    if (!partner) {
        res.status(403).json({ message: "Not authorized" });
        return;
    }
    const { num_tickets, price } = req.body;
    const { eventId } = req.params;
    const ticketService = new ticket_service_1.TicketService();
    await ticketService.createMany({
        eventId,
        numTickets: num_tickets,
        price,
    });
    res.status(204).send();
});
exports.ticketRouter.get("/:eventId/tickets", async (req, res) => {
    const { eventId } = req.params;
    const ticketService = new ticket_service_1.TicketService();
    const tickets = await ticketService.findByEventId(eventId);
    res.json(tickets);
});
exports.ticketRouter.get("/:eventId/tickets/:id", async (req, res) => {
    const { eventId, id } = req.params;
    const ticketService = new ticket_service_1.TicketService();
    const ticket = await ticketService.findById(eventId, id);
    if (!ticket) {
        res.status(404).json({ message: "Ticket not found" });
        return;
    }
    res.json(ticket);
});
