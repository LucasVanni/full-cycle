"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_service_1 = require("../services/auth-service");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const authService = new auth_service_1.AuthService();
    try {
        const token = await authService.login(email, password);
        res.json({ token });
    }
    catch (error) {
        if (error instanceof auth_service_1.InvalidCredentialsError) {
            res.status(401).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Unexpected error occurred" });
        }
    }
});
