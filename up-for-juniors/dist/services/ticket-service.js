"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketService = void 0;
const uuid_1 = require("uuid");
const event_model_1 = require("../models/event-model");
const ticket_model_1 = require("../models/ticket-model");
class TicketService {
    async createMany(data) {
        const event = await event_model_1.EventModel.findById(data.eventId);
        if (!event) {
            throw new Error("Event not Found");
        }
        const ticketsData = Array(data.numTickets)
            .fill({})
            .map((_, index) => ({
            id: (0, uuid_1.v4)(),
            location: `Location ${index}`,
            event_id: event.id,
            price: data.price,
            status: ticket_model_1.TicketStatus.available,
            created_at: new Date(),
            updated_at: new Date(),
        }));
        await ticket_model_1.TicketModel.createMany(ticketsData);
    }
    async findByEventId(eventId) {
        const event = await event_model_1.EventModel.findById(eventId);
        if (!event) {
            throw new Error("Event not Found");
        }
        return ticket_model_1.TicketModel.findAll({
            where: {
                event_id: eventId,
            },
        });
    }
    async findById(eventId, id) {
        const ticket = await ticket_model_1.TicketModel.findById(id);
        if (!ticket) {
            throw new Error("Ticket not Found");
        }
        if (ticket.event_id !== eventId) {
            throw new Error("Ticket not Found");
        }
        return ticket;
    }
}
exports.TicketService = TicketService;
