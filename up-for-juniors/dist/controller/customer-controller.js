"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerRouter = void 0;
const express_1 = require("express");
const customer_service_1 = require("../services/customer-service");
exports.customerRouter = (0, express_1.Router)();
exports.customerRouter.post("/register", async (req, res) => {
    const { name, email, password, phone, address } = req.body;
    const customerService = new customer_service_1.CustomerService();
    const customer = await customerService.register({
        name,
        email,
        password,
        phone,
        address,
    });
    res.status(201).json(customer);
});
