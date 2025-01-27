"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseModel = exports.PurchaseStatus = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../database");
var PurchaseStatus;
(function (PurchaseStatus) {
    PurchaseStatus["pending"] = "pending";
    PurchaseStatus["paid"] = "paid";
    PurchaseStatus["error"] = "error";
    PurchaseStatus["cancelled"] = "cancelled";
})(PurchaseStatus || (exports.PurchaseStatus = PurchaseStatus = {}));
class PurchaseModel {
    id;
    customer_id;
    purchase_date;
    total_amount;
    status;
    constructor(data = {}) {
        this.fill(data);
    }
    fill(data) {
        if (data.id !== undefined)
            this.id = data.id;
        if (data.customer_id !== undefined)
            this.customer_id = data.customer_id;
        if (data.purchase_date !== undefined)
            this.purchase_date = data.purchase_date;
        if (data.total_amount !== undefined)
            this.total_amount = data.total_amount;
        if (data.status !== undefined)
            this.status = data.status;
    }
    static async create(data, options) {
        const db = options?.connection ?? database_1.Database.getInstance();
        const purchase_date = new Date();
        const id = (0, uuid_1.v4)();
        await db.execute("INSERT INTO purchases (id, customer_id, total_amount, status, purchase_date) VALUES (?, ?, ?, ?, ?)", [id, data.customer_id, data.total_amount, data.status, purchase_date]);
        const purchase = new PurchaseModel({
            ...data,
            purchase_date,
            id,
        });
        return purchase;
    }
    static async findById(id) {
        const db = database_1.Database.getInstance();
        const [rows] = await db.execute("SELECT * FROM purchases WHERE id = ?", [id]);
        return rows.length ? new PurchaseModel(rows[0]) : null;
    }
    static async findAll() {
        const db = database_1.Database.getInstance();
        const [rows] = await db.execute("SELECT * FROM purchases");
        return rows.map((row) => new PurchaseModel(row));
    }
    async update(options) {
        const db = options?.connection ?? database_1.Database.getInstance();
        const [result] = await db.execute("UPDATE purchases SET customer_id = ?, total_amount = ?, status = ? WHERE id = ?", [this.customer_id, this.total_amount, this.status, this.id]);
        if (result.affectedRows === 0) {
            throw new Error("Purchase not found");
        }
    }
    async delete() {
        const db = database_1.Database.getInstance();
        const [result] = await db.execute("DELETE FROM purchases WHERE id = ?", [this.id]);
        if (result.affectedRows === 0) {
            throw new Error("Purchase not found");
        }
    }
}
exports.PurchaseModel = PurchaseModel;
