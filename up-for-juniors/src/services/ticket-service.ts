import { v4 as uuidv4 } from "uuid";
import { EventModel } from "../models/event-model";
import { TicketModel, TicketStatus } from "../models/ticket-model";

export class TicketService {
  async createMany(data: {
    eventId: string;
    numTickets: number;
    price: number;
  }) {
    const event = await EventModel.findById(data.eventId);

    if (!event) {
      throw new Error("Event not Found");
    }

    const ticketsData = Array(data.numTickets)
      .fill({})
      .map((_, index) => ({
        id: uuidv4(),
        location: `Location ${index}`,
        event_id: event.id,
        price: data.price,
        status: TicketStatus.available,
        created_at: new Date(),
        updated_at: new Date(),
      }));

    await TicketModel.createMany(ticketsData);
  }

  async findByEventId(eventId: string) {
    const event = await EventModel.findById(eventId);

    if (!event) {
      throw new Error("Event not Found");
    }

    return TicketModel.findAll({
      where: {
        event_id: eventId,
      },
    });
  }

  async findById(eventId: string, id: string) {
    const ticket = await TicketModel.findById(id);

    if (!ticket) {
      throw new Error("Ticket not Found");
    }

    if (ticket.event_id !== eventId) {
      throw new Error("Ticket not Found");
    }

    return ticket;
  }
}
