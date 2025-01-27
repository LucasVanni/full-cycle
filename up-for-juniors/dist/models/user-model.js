"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const database_1 = require("../database");
class UserModel {
    id;
    name;
    email;
    password;
    created_at;
    constructor(data = {}) {
        this.fill(data);
    }
    fill(data) {
        if (data.id !== undefined)
            this.id = data.id;
        if (data.name !== undefined)
            this.name = data.name;
        if (data.email !== undefined)
            this.email = data.email;
        if (data.password !== undefined)
            this.password = data.password;
    }
    static async create({ name, email, password, }, options) {
        const connection = options?.connection || database_1.Database.getInstance();
        const hashedPassword = UserModel.hashPassword(password);
        await connection.execute("INSERT INTO users (id, name, email, password, created_at, updated_at) VALUES (UUID(), ?, ?, ?, NOW(), NOW())", [name, email, hashedPassword]);
        const [rows] = await connection.execute("SELECT * FROM users WHERE email = ?", [email]);
        const user = rows[0];
        return new UserModel({
            id: user.id,
            name: user.name,
            email: user.email,
            password: user.password,
        });
    }
    static hashPassword(password) {
        return bcrypt_1.default.hashSync(password, 10);
    }
    static comparePassword(password, hash) {
        return bcrypt_1.default.compareSync(password, hash);
    }
    static async findById(id) {
        const db = database_1.Database.getInstance();
        const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [id]);
        return rows.length ? new UserModel(rows[0]) : null;
    }
    static async findByEmail(email) {
        const db = database_1.Database.getInstance();
        const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
        return rows.length ? new UserModel(rows[0]) : null;
    }
    static async findAll() {
        const db = database_1.Database.getInstance();
        const [rows] = await db.execute("SELECT * FROM users");
        return rows.map((row) => new UserModel(row));
    }
    async update() {
        const db = database_1.Database.getInstance();
        const hashedPassword = UserModel.hashPassword(this.password);
        const [result] = await db.execute("UPDATE users SET name = ?, email = ?, password = ?, updated_at = NOW() WHERE id = ?", [this.name, this.email, hashedPassword, this.id]);
        if (result.affectedRows === 0) {
            throw new Error("User not found");
        }
    }
    async delete() {
        const db = database_1.Database.getInstance();
        const [result] = await db.execute("DELETE FROM users WHERE id = ?", [this.id]);
        if (result.affectedRows === 0) {
            throw new Error("User not found");
        }
    }
}
exports.UserModel = UserModel;
