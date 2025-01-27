"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partnerRouter = void 0;
const express_1 = require("express");
const middleware_1 = require("../middleware");
const event_service_1 = require("../services/event-service");
const partner_service_1 = require("../services/partner-service");
exports.partnerRouter = (0, express_1.Router)();
exports.partnerRouter.post("/register", async (req, res) => {
    const { name, email, password, company_name } = req.body;
    const partnerService = new partner_service_1.PartnerService();
    const partner = await partnerService.register({
        name,
        email,
        password,
        company_name,
    });
    res.status(201).json(partner);
});
exports.partnerRouter.use(middleware_1.authMiddleware);
exports.partnerRouter.get("/events", async (req, res) => {
    const user_id = req.user.id;
    const partnerService = new partner_service_1.PartnerService();
    const partner = await partnerService.findByUserId(user_id);
    if (!partner) {
        res.status(403).json({ message: "Not authorized" });
        return;
    }
    const eventService = new event_service_1.EventService();
    const events = await eventService.findAll(partner.id);
    res.json({ events });
});
exports.partnerRouter.get("/events/:id", async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;
    const partnerService = new partner_service_1.PartnerService();
    const partner = await partnerService.findByUserId(user_id);
    if (!partner) {
        res.status(403).json({ message: "Not authorized" });
        return;
    }
    const eventService = new event_service_1.EventService();
    const event = await eventService.findById(id);
    if (!event || event.partner_id !== partner.id) {
        res.status(404).json({ message: "Event not found" });
        return;
    }
    res.json({ event });
});
exports.partnerRouter.post("/events", async (req, res) => {
    const { name, description, date, location } = req.body;
    const user_id = req.user.id;
    const partnerService = new partner_service_1.PartnerService();
    const partner = await partnerService.findByUserId(user_id);
    if (!partner) {
        res.status(403).json({ message: "Not authorized" });
        return;
    }
    const eventService = new event_service_1.EventService();
    const event = await eventService.create({
        name,
        description,
        date,
        location,
        partner_id: partner.id,
    });
    res.status(201).json(event);
});
