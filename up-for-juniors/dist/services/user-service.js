"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_model_1 = require("../models/user-model");
class UserService {
    async findById(id) {
        return user_model_1.UserModel.findById(id);
    }
    async findByEmail(email) {
        return user_model_1.UserModel.findByEmail(email);
    }
}
exports.UserService = UserService;
