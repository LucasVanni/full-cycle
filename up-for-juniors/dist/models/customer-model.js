"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerModel = void 0;
const database_1 = require("../database");
const user_model_1 = require("../models/user-model");
class CustomerModel {
    id;
    user_id;
    address;
    phone;
    user;
    constructor(data = {}) {
        this.fill(data);
    }
    fill(data) {
        if (data.id !== undefined)
            this.id = data.id;
        if (data.user_id !== undefined)
            this.user_id = data.user_id;
        if (data.address !== undefined)
            this.address = data.address;
        if (data.phone !== undefined)
            this.phone = data.phone;
    }
    static async create(data, options) {
        const db = options?.connection ?? database_1.Database.getInstance();
        const { user_id, address, phone } = data;
        const [result] = await db.execute("INSERT INTO customers (id, user_id, address, phone, created_at, updated_at) VALUES (UUID(), ?, ?, ?, NOW(), NOW())", [user_id, address, phone]);
        const customer = new CustomerModel({
            id: result.insertId,
            user_id,
            address,
            phone,
        });
        return customer;
    }
    static async findById(id, options) {
        const db = database_1.Database.getInstance();
        let query = "SELECT * FROM customers WHERE id = ?";
        if (options?.user) {
            query =
                "SELECT c.*, users.id as user_id, users.name as user_name, users.email as user_email FROM customers c JOIN users ON c.user_id = users.id WHERE c.id = ?";
        }
        const [rows] = await db.execute(query, [id]);
        if (rows.length === 0)
            return null;
        const customer = new CustomerModel(rows[0]);
        if (options?.user) {
            customer.user = new user_model_1.UserModel({
                id: rows[0].user_id,
                name: rows[0].user_name,
                email: rows[0].user_email,
            });
        }
        return customer;
    }
    static async findByUserId(user_id, options) {
        const db = database_1.Database.getInstance();
        let query = "SELECT * FROM customers WHERE user_id = ?";
        if (options?.user) {
            query =
                "SELECT c.*, users.id as user_id, users.name as user_name, users.email as user_email FROM customers c JOIN users ON c.user_id = users.id WHERE c.user_id = ?";
        }
        const [rows] = await db.execute(query, [user_id]);
        if (rows.length === 0)
            return null;
        const customer = new CustomerModel(rows[0]);
        if (options?.user) {
            customer.user = new user_model_1.UserModel({
                id: rows[0].user_id,
                name: rows[0].user_name,
                email: rows[0].user_email,
            });
        }
        return customer;
    }
    static async findAll() {
        const db = database_1.Database.getInstance();
        const [rows] = await db.execute("SELECT * FROM customers");
        return rows.map((row) => new CustomerModel(row));
    }
    async update() {
        const db = database_1.Database.getInstance();
        const [result] = await db.execute("UPDATE customers SET user_id = ?, address = ?, phone = ?, updated_at = NOW() WHERE id = ?", [this.user_id, this.address, this.phone, this.id]);
        if (result.affectedRows === 0) {
            throw new Error("Customer not found");
        }
    }
    async delete() {
        const db = database_1.Database.getInstance();
        const [result] = await db.execute("DELETE FROM customers WHERE id = ?", [this.id]);
        if (result.affectedRows === 0) {
            throw new Error("Customer not found");
        }
    }
}
exports.CustomerModel = CustomerModel;
