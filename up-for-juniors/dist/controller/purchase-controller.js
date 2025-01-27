"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseRouter = void 0;
const express_1 = require("express");
const middleware_1 = require("../middleware");
const customer_service_1 = require("../services/customer-service");
const payment_service_1 = require("../services/payment-service");
const purchase_service_1 = require("../services/purchase-service");
exports.purchaseRouter = (0, express_1.Router)();
exports.purchaseRouter.use(middleware_1.authMiddleware);
exports.purchaseRouter.post("/", async (req, res) => {
    const customerService = new customer_service_1.CustomerService();
    const customer = await customerService.findByUserId(req.user.id);
    if (!customer) {
        res.status(400).json({ message: "User needs be a customer" });
        return;
    }
    const { ticket_ids, card_token } = req.body;
    const paymentService = new payment_service_1.PaymentService();
    const purchaseService = new purchase_service_1.PurchaseService(paymentService);
    const newPurchaseId = await purchaseService.create({
        customerId: customer.id,
        ticketIds: ticket_ids,
        cardToken: card_token,
    });
    const purchase = await purchaseService.findById(newPurchaseId);
    res.status(201).json(purchase);
});
