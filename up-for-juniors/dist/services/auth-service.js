"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidCredentialsError = exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user-model");
class AuthService {
    constructor() { }
    async login(email, password) {
        const userModel = await user_model_1.UserModel.findByEmail(email);
        const isPasswordValid = await bcrypt_1.default.compare(password, userModel?.password || "");
        if (!userModel || !isPasswordValid) {
            throw new InvalidCredentialsError();
        }
        return jsonwebtoken_1.default.sign({ id: userModel.id, email: userModel.email }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
    }
}
exports.AuthService = AuthService;
class InvalidCredentialsError extends Error {
    constructor() {
        super("Invalid credentials");
    }
}
exports.InvalidCredentialsError = InvalidCredentialsError;
