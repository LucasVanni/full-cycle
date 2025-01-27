"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketModel = exports.TicketStatus = void 0;
const database_1 = require("../database");
var TicketStatus;
(function (TicketStatus) {
    TicketStatus["available"] = "available";
    TicketStatus["sold"] = "sold";
})(TicketStatus || (exports.TicketStatus = TicketStatus = {}));
class TicketModel {
    id;
    location;
    event_id;
    price;
    status;
    constructor(data = {}) {
        this.fill(data);
    }
    fill(data) {
        if (data.id !== undefined)
            this.id = data.id;
        if (data.location !== undefined)
            this.location = data.location;
        if (data.event_id !== undefined)
            this.event_id = data.event_id;
        if (data.price !== undefined)
            this.price = data.price;
        if (data.status !== undefined)
            this.status = data.status;
    }
    static async create(data) {
        const db = database_1.Database.getInstance();
        const [result] = await db.execute("INSERT INTO tickets (id, location, event_id, price, status, created_at) VALUES (UUID(), ?, ?, ?, ?, NOW())", [data.location, data.event_id, data.price, data.status]);
        const ticket = new TicketModel({
            ...data,
            id: result.insertId,
        });
        return ticket;
    }
    static async createMany(data) {
        const db = database_1.Database.getInstance();
        const values = Array(data.length)
            .fill("(?, ?, ?, ?, ?, ?, ?)")
            .join(", ");
        const params = data.reduce((acc, ticket) => [
            ...acc,
            ticket.id,
            ticket.location,
            ticket.event_id,
            ticket.price,
            ticket.status,
            ticket.created_at,
            ticket.updated_at,
        ], []);
        await db.execute(`INSERT INTO tickets (id, location, event_id, price, status, created_at, updated_at) VALUES ${values}`, params);
        const insertedIds = data.map(ticket => ticket.id);
        const tickets = data.map((ticket, index) => new TicketModel({
            ...ticket,
            id: insertedIds[index],
        }));
        return tickets;
    }
    static async findById(id) {
        const db = database_1.Database.getInstance();
        const [rows] = await db.execute("SELECT * FROM tickets WHERE id = ?", [id]);
        return rows.length ? new TicketModel(rows[0]) : null;
    }
    static async findAll(filter, options) {
        const db = options?.connection ?? database_1.Database.getInstance();
        let query = "SELECT * FROM tickets";
        const params = [];
        if (filter && filter.where) {
            const where = [];
            if (filter.where.event_id) {
                where.push("event_id = ?");
                params.push(filter.where.event_id);
            }
            if (filter.where.ids) {
                where.push(`id IN (${filter.where.ids.map(() => "?").join(", ")})`);
                params.push(...filter.where.ids);
            }
            query += ` WHERE ${where.join(" AND ")}`;
        }
        const [rows] = await db.execute(query, params);
        return rows.map((row) => new TicketModel(row));
    }
    async update() {
        const db = database_1.Database.getInstance();
        const [result] = await db.execute("UPDATE tickets SET location = ?, event_id = ?, price = ?, status = ?, updated_at = NOW() WHERE id = ?", [this.location, this.event_id, this.price, this.status, this.id]);
        if (result.affectedRows === 0) {
            throw new Error("Ticket not found");
        }
    }
    async delete() {
        const db = database_1.Database.getInstance();
        const [result] = await db.execute("DELETE FROM tickets WHERE id = ?", [this.id]);
        if (result.affectedRows === 0) {
            throw new Error("Ticket not found");
        }
    }
}
exports.TicketModel = TicketModel;
