import { Router } from "express";
import { authMiddleware } from "../middleware";
import { EventService } from "../services/event-service";
import { PartnerService } from "../services/partner-service";

export const partnerRouter = Router();

partnerRouter.post("/register", async (req, res) => {
  const { name, email, password, company_name } = req.body;

  const partnerService = new PartnerService();
  const partner = await partnerService.register({
    name,
    email,
    password,
    company_name,
  });

  res.status(201).json(partner);
});

partnerRouter.use(authMiddleware);

partnerRouter.get("/events", async (req, res) => {
  const user_id = req.user!.id;

  const partnerService = new PartnerService();
  const partner = await partnerService.findByUserId(user_id);

  if (!partner) {
    res.status(403).json({ message: "Not authorized" });
    return;
  }

  const eventService = new EventService();
  const events = await eventService.findAll(partner.id);

  res.json({ events });
});

partnerRouter.get("/events/:id", async (req, res) => {
  const { id } = req.params;

  const user_id = req.user!.id;

  const partnerService = new PartnerService();
  const partner = await partnerService.findByUserId(user_id);

  if (!partner) {
    res.status(403).json({ message: "Not authorized" });
    return;
  }

  const eventService = new EventService();
  const event = await eventService.findById(id);

  if (!event || event.partner_id !== partner.id) {
    res.status(404).json({ message: "Event not found" });
    return;
  }

  res.json({ event });
});

partnerRouter.post("/events", async (req, res) => {
  const { name, description, date, location } = req.body;

  const user_id = req.user!.id;

  const partnerService = new PartnerService();
  const partner = await partnerService.findByUserId(user_id);

  if (!partner) {
    res.status(403).json({ message: "Not authorized" });
    return;
  }

  const eventService = new EventService();
  const event = await eventService.create({
    name,
    description,
    date,
    location,
    partner_id: partner.id,
  });

  res.status(201).json(event);
});
