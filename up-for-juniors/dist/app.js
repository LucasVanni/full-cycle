"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_controller_1 = require("./controller/auth-controller");
const customer_controller_1 = require("./controller/customer-controller");
const event_controller_1 = require("./controller/event-controller");
const partner_controller_1 = require("./controller/partner-controller");
const purchase_controller_1 = require("./controller/purchase-controller");
const ticket_controller_1 = require("./controller/ticket-controller");
const database_1 = require("./database");
const discord_1 = __importDefault(require("./discord"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.get("/", (_, res) => {
    res.json({ message: "API is running" });
});
app.use(express_1.default.json());
app.use("/api/discord", discord_1.default);
app.use("/api/auth", auth_controller_1.authRouter);
app.use("/api/partners", partner_controller_1.partnerRouter);
app.use("/api/customers", customer_controller_1.customerRouter);
app.use("/api/events", event_controller_1.eventRouter);
app.use("/api/events", ticket_controller_1.ticketRouter);
app.use("/api/purchases", purchase_controller_1.purchaseRouter);
app.listen(process.env.PORT, async () => {
    const connection = database_1.Database.getInstance();
    await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
    await connection.execute("TRUNCATE TABLE users");
    await connection.execute("TRUNCATE TABLE partners");
    await connection.execute("TRUNCATE TABLE customers");
    await connection.execute("TRUNCATE TABLE events");
    await connection.execute("TRUNCATE TABLE tickets");
    await connection.execute("TRUNCATE TABLE purchases");
    await connection.execute("TRUNCATE TABLE purchase_tickets");
    await connection.execute("TRUNCATE TABLE reservation_tickets");
    await connection.execute("SET FOREIGN_KEY_CHECKS = 1");
    console.log(`Server is running on port ${process.env.PORT}`);
});
