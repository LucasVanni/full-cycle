"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventRouter = void 0;
const express_1 = require("express");
const event_service_1 = require("../services/event-service");
exports.eventRouter = (0, express_1.Router)();
exports.eventRouter.get("/", async (_, res) => {
    const eventService = new event_service_1.EventService();
    const events = await eventService.findAll();
    res.json({ events });
});
exports.eventRouter.get("/:id", async (req, res) => {
    const { id } = req.params;
    const eventService = new event_service_1.EventService();
    const event = await eventService.findById(id);
    if (!event) {
        res.status(404).json({ message: "Event not found" });
        return;
    }
    res.json({ event });
});
