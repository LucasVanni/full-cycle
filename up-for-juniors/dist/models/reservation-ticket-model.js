"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationTicketModel = exports.ReservationStatus = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../database");
var ReservationStatus;
(function (ReservationStatus) {
    ReservationStatus["reserved"] = "reserved";
    ReservationStatus["cancelled"] = "cancelled";
})(ReservationStatus || (exports.ReservationStatus = ReservationStatus = {}));
class ReservationTicketModel {
    id;
    customer_id;
    ticket_id;
    reservation_date;
    status;
    constructor(data = {}) {
        this.fill(data);
    }
    fill(data) {
        if (data.id !== undefined)
            this.id = data.id;
        if (data.customer_id !== undefined)
            this.customer_id = data.customer_id;
        if (data.ticket_id !== undefined)
            this.ticket_id = data.ticket_id;
        if (data.reservation_date !== undefined)
            this.reservation_date = data.reservation_date;
        if (data.status !== undefined)
            this.status = data.status;
    }
    static async create(data, options) {
        const db = options?.connection ?? database_1.Database.getInstance();
        const reservation_date = new Date();
        const id = (0, uuid_1.v4)();
        const [result] = await db.execute("INSERT INTO reservation_tickets (id, customer_id, ticket_id, status, reservation_date) VALUES (?, ?, ?, ?, ?)", [id, data.customer_id, data.ticket_id, data.status, reservation_date]);
        const reservation = new ReservationTicketModel({
            ...data,
            reservation_date,
            id,
        });
        return reservation;
    }
    static async findById(id) {
        const db = database_1.Database.getInstance();
        const [rows] = await db.execute("SELECT * FROM reservation_tickets WHERE id = ?", [id]);
        return rows.length
            ? new ReservationTicketModel(rows[0])
            : null;
    }
    static async findAll() {
        const db = database_1.Database.getInstance();
        const [rows] = await db.execute("SELECT * FROM reservation_tickets");
        return rows.map((row) => new ReservationTicketModel(row));
    }
    async update(options) {
        const db = options?.connection ?? database_1.Database.getInstance();
        const [result] = await db.execute("UPDATE reservation_tickets SET customer_id = ?, ticket_id = ?, status = ? WHERE id = ?", [this.customer_id, this.ticket_id, this.status, this.id]);
        if (result.affectedRows === 0) {
            throw new Error("Reservation not found");
        }
    }
    async delete() {
        const db = database_1.Database.getInstance();
        const [result] = await db.execute("DELETE FROM reservation_tickets WHERE id = ?", [this.id]);
        if (result.affectedRows === 0) {
            throw new Error("Reservation not found");
        }
    }
}
exports.ReservationTicketModel = ReservationTicketModel;
