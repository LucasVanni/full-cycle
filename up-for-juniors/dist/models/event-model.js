"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventModel = void 0;
const database_1 = require("../database");
class EventModel {
    id;
    name;
    description;
    date;
    location;
    partner_id;
    constructor(data = {}) {
        this.fill(data);
    }
    fill(data) {
        if (data.id !== undefined)
            this.id = data.id;
        if (data.name !== undefined)
            this.name = data.name;
        if (data.description !== undefined)
            this.description = data.description;
        if (data.date !== undefined)
            this.date = data.date;
        if (data.location !== undefined)
            this.location = data.location;
        if (data.partner_id !== undefined)
            this.partner_id = data.partner_id;
    }
    static async create(data) {
        const db = database_1.Database.getInstance();
        await db.execute("INSERT INTO events (id, name, description, date, location, partner_id, created_at, updated_at) VALUES (UUID(), ?, ?, ?, ?, ?, NOW(), NOW())", [data.name, data.description, data.date, data.location, data.partner_id]);
        const [rows] = await db.execute("SELECT * FROM events WHERE partner_id = ? ORDER BY created_at DESC", [data.partner_id]);
        return new EventModel(rows[0]);
    }
    static async findById(id) {
        const db = database_1.Database.getInstance();
        const [rows] = await db.execute("SELECT * FROM events WHERE id = ?", [id]);
        return rows.length ? new EventModel(rows[0]) : null;
    }
    static async findAll(filter) {
        const db = database_1.Database.getInstance();
        let query = "SELECT * FROM events";
        const params = [];
        if (filter && filter.where) {
            if (filter.where.partner_id) {
                query += " WHERE partner_id = ?";
                params.push(filter.where.partner_id);
            }
        }
        const [rows] = await db.execute(query, params);
        return rows.map((row) => new EventModel(row));
    }
    async update() {
        const db = database_1.Database.getInstance();
        const [result] = await db.execute("UPDATE events SET name = ?, description = ?, date = ?, location = ?, partner_id = ?, updated_at = NOW() WHERE id = ?", [
            this.name,
            this.description,
            this.date,
            this.location,
            this.partner_id,
            this.id,
        ]);
        if (result.affectedRows === 0) {
            throw new Error("Event not found");
        }
    }
    async delete() {
        const db = database_1.Database.getInstance();
        const [result] = await db.execute("DELETE FROM events WHERE id = ?", [this.id]);
        if (result.affectedRows === 0) {
            throw new Error("Event not found");
        }
    }
}
exports.EventModel = EventModel;
