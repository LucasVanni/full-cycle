import { EventModel } from "@/models/event-model";

export class EventService {
  constructor() {}

  async create(data: {
    name: string;
    description: string;
    date: string;
    location: string;
    partner_id: string;
  }) {
    const { name, description, date, location, partner_id } = data;

    const eventDate = new Date(date);

    const event = await EventModel.create({
      name,
      description,
      date: eventDate,
      location,
      partner_id,
    });

    return {
      message: "Partner Event created",
      id: event.id,
      name,
      description,
      date: eventDate,
      location,
      partner_id,
    };
  }

  async findAll(partner_id?: string) {
    return EventModel.findAll({ where: { partner_id } });
  }

  async findById(id: string) {
    return EventModel.findById(id);
  }
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
  }
}
