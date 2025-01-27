"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartnerModel = void 0;
const database_1 = require("../database");
const user_model_1 = require("../models/user-model");
class PartnerModel {
    id;
    user_id;
    company_name;
    user;
    constructor(partner = {}) {
        this.fill(partner);
    }
    fill(partner) {
        if (partner.id !== undefined)
            this.id = partner.id;
        if (partner.user_id !== undefined)
            this.user_id = partner.user_id;
        if (partner.company_name !== undefined)
            this.company_name = partner.company_name;
    }
    static async create(partner, options) {
        const connection = options?.connection || database_1.Database.getInstance();
        const { user_id, company_name } = partner;
        await connection.execute("INSERT INTO partners (id, user_id, company_name, created_at, updated_at) VALUES (UUID(), ?, ?, NOW(), NOW())", [user_id, company_name]);
        const [rows] = await connection.execute("SELECT * FROM partners WHERE user_id = ?", [user_id]);
        return new PartnerModel(rows[0]);
    }
    static async findById(id, options) {
        const db = database_1.Database.getInstance();
        let query = "SELECT * FROM partners WHERE id = ?";
        if (options?.user) {
            query =
                "SELECT p.*, users.id as user_id, users.name as user_name, users.email as user_email FROM partners p JOIN users ON p.user_id = users.id WHERE p.id = ?";
        }
        const [rows] = await db.execute(query, [id]);
        if (rows.length === 0)
            return null;
        const partner = new PartnerModel(rows[0]);
        if (options?.user) {
            partner.user = new user_model_1.UserModel({
                id: rows[0].user_id,
                name: rows[0].user_name,
                email: rows[0].user_email,
            });
        }
        return partner;
    }
    static async findByUserId(userId, options) {
        const db = database_1.Database.getInstance();
        let query = "SELECT * FROM partners WHERE user_id = ?";
        if (options?.user) {
            query =
                "SELECT p.*, users.id as user_id, users.name as user_name, users.email as user_email FROM partners p JOIN users ON p.user_id = users.id WHERE p.user_id = ?";
        }
        const [rows] = await db.execute(query, [userId]);
        if (rows.length === 0)
            return null;
        const partner = new PartnerModel(rows[0]);
        if (options?.user) {
            partner.user = new user_model_1.UserModel({
                id: rows[0].user_id,
                name: rows[0].user_name,
                email: rows[0].user_email,
            });
        }
        return partner;
    }
    static async findAll() {
        const db = database_1.Database.getInstance();
        const [rows] = await db.execute("SELECT * FROM partners");
        return rows.map((row) => new PartnerModel(row));
    }
    async update() {
        const db = database_1.Database.getInstance();
        const [result] = await db.execute("UPDATE partners SET user_id = ?, company_name = ?, updated_at = NOW() WHERE id = ?", [this.user_id, this.company_name, this.id]);
        if (result.affectedRows === 0) {
            throw new Error("Partner not found");
        }
    }
    async delete() {
        const db = database_1.Database.getInstance();
        const [result] = await db.execute("DELETE FROM partners WHERE id = ?", [this.id]);
        if (result.affectedRows === 0) {
            throw new Error("Partner not found");
        }
    }
}
exports.PartnerModel = PartnerModel;
