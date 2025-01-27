"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartnerService = void 0;
const database_1 = require("../database");
const partner_model_1 = require("../models/partner-model");
const user_model_1 = require("../models/user-model");
class PartnerService {
    async register(partner) {
        const { name, email, password, company_name } = partner;
        const connection = await database_1.Database.getInstance().getConnection();
        try {
            await connection.beginTransaction();
            const user = await user_model_1.UserModel.create({
                name,
                email,
                password,
            }, { connection });
            const partner = await partner_model_1.PartnerModel.create({
                user_id: user.id,
                company_name,
            }, { connection });
            await connection.commit();
            return { id: partner.id, user_id: user.id, company_name };
        }
        catch (error) {
            await connection.rollback();
            throw error;
        }
        finally {
            connection.release();
        }
    }
    async findByUserId(user_id) {
        return partner_model_1.PartnerModel.findByUserId(user_id);
    }
}
exports.PartnerService = PartnerService;
