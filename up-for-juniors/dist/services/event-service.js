"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedError = exports.EventService = void 0;
const event_model_1 = require("../models/event-model");
class EventService {
    constructor() { }
    async create(data) {
        const { name, description, date, location, partner_id } = data;
        const eventDate = new Date(date);
        const event = await event_model_1.EventModel.create({
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
    async findAll(partner_id) {
        return event_model_1.EventModel.findAll({ where: { partner_id } });
    }
    async findById(id) {
        return event_model_1.EventModel.findById(id);
    }
}
exports.EventService = EventService;
class UnauthorizedError extends Error {
    constructor() {
        super("Unauthorized");
    }
}
exports.UnauthorizedError = UnauthorizedError;
