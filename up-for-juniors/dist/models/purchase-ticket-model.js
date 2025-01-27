"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseTicketModel = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../database");
class PurchaseTicketModel {
    id;
    purchase_id;
    ticket_id;
    constructor(data = {}) {
        this.fill(data);
    }
    fill(data) {
        this.id = data.id;
        this.purchase_id = data.purchase_id;
        this.ticket_id = data.ticket_id;
    }
    static async create(data) {
        const db = database_1.Database.getInstance();
        const id = (0, uuid_1.v4)();
        await db.execute("INSERT INTO purchase_tickets (id, purchase_id, ticket_id) VALUES (?, ?, ?)", [id, data.purchase_id, data.ticket_id]);
        const purchaseTicket = new PurchaseTicketModel({
            ...data,
            id,
        });
        return purchaseTicket;
    }
    static async createMany(data, options) {
        const db = options?.connection ?? database_1.Database.getInstance();
        const params = data.reduce((acc, ticket) => [...acc, (0, uuid_1.v4)(), ticket.purchase_id, ticket.ticket_id], []);
        const values = Array(data.length).fill("(?, ?, ?)").join(", ");
        await db.execute(`INSERT INTO purchase_tickets (id, purchase_id, ticket_id) VALUES ${values}`, params);
        return data.map((ticket, index) => new PurchaseTicketModel({
            ...ticket,
            id: params[index * 3 + 1],
        }));
    }
    static async findById(id) {
        const db = database_1.Database.getInstance();
        const [rows] = await db.execute("SELECT * FROM purchase_tickets WHERE id = ?", [id]);
        return rows.length
            ? new PurchaseTicketModel(rows[0])
            : null;
    }
    static async findAll() {
        const db = database_1.Database.getInstance();
        const [rows] = await db.execute("SELECT * FROM purchase_tickets");
        return rows.map((row) => new PurchaseTicketModel(row));
    }
    async update() {
        const db = database_1.Database.getInstance();
        const [result] = await db.execute("UPDATE purchase_tickets SET purchase_id = ?, ticket_id = ? WHERE id = ?", [this.purchase_id, this.ticket_id, this.id]);
        if (result.affectedRows === 0) {
            throw new Error("Purchase ticket not found");
        }
    }
    async delete() {
        const db = database_1.Database.getInstance();
        const [result] = await db.execute("DELETE FROM purchase_tickets WHERE id = ?", [this.id]);
        if (result.affectedRows === 0) {
            throw new Error("Purchase ticket not found");
        }
    }
}
exports.PurchaseTicketModel = PurchaseTicketModel;
