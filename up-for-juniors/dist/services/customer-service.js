"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerService = void 0;
const database_1 = require("../database");
const customer_model_1 = require("../models/customer-model");
const user_model_1 = require("../models/user-model");
class CustomerService {
    async register(customer) {
        const connection = await database_1.Database.getInstance().getConnection();
        const { name, email, password, phone, address } = customer;
        try {
            await connection.beginTransaction();
            const user = await user_model_1.UserModel.create({
                name,
                email,
                password,
            }, { connection });
            const customer = await customer_model_1.CustomerModel.create({
                user_id: user.id,
                phone,
                address,
            }, { connection });
            await connection.commit();
            return { id: customer.id, user_id: user.id, phone, address };
        }
        catch (error) {
            await connection.rollback();
            throw error;
        }
        finally {
            connection.release();
        }
    }
    async findByUserId(userId) {
        return customer_model_1.CustomerModel.findByUserId(userId);
    }
}
exports.CustomerService = CustomerService;
