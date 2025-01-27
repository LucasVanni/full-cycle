"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_service_1 = require("./services/user-service");
const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "No token provided" });
        return;
    }
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
        res.status(401).json({ message: "Invalid token" });
        return;
    }
    const userService = new user_service_1.UserService();
    const user = await userService.findById(decoded.id);
    if (!user) {
        res.status(401).json({ message: "Invalid token" });
        return;
    }
    req.user = user;
    next();
};
exports.authMiddleware = authMiddleware;
