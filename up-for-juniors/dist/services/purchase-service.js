"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseService = void 0;
const database_1 = require("../database");
const customer_model_1 = require("../models/customer-model");
const purchase_model_1 = require("../models/purchase-model");
const purchase_ticket_model_1 = require("../models/purchase-ticket-model");
const reservation_ticket_model_1 = require("../models/reservation-ticket-model");
const ticket_model_1 = require("../models/ticket-model");
class PurchaseService {
    paymentService;
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async create(data) {
        const customer = await customer_model_1.CustomerModel.findById(data.customerId, {
            user: true, //eager loading
        });
        if (!customer) {
            throw new Error("Customer not found");
        }
        const tickets = await ticket_model_1.TicketModel.findAll({
            where: { ids: data.ticketIds },
        });
        if (tickets.length !== data.ticketIds.length) {
            throw new Error("Some tickets not found");
        }
        if (tickets.some((t) => t.status !== ticket_model_1.TicketStatus.available)) {
            throw new Error("Some tickets are not available");
        }
        const amount = tickets.reduce((total, ticket) => total + ticket.price, 0);
        const db = database_1.Database.getInstance();
        const connection = await db.getConnection();
        let purchase;
        try {
            await connection.beginTransaction();
            purchase = await purchase_model_1.PurchaseModel.create({
                customer_id: data.customerId,
                total_amount: amount,
                status: purchase_model_1.PurchaseStatus.pending,
            }, { connection });
            await this.associateTicketsWithPurchase(purchase.id, data.ticketIds, connection);
            await connection.commit();
        }
        catch (error) {
            await connection.rollback();
            throw error;
        }
        finally {
            connection.release();
        }
        try {
            await connection.beginTransaction();
            purchase.status = purchase_model_1.PurchaseStatus.paid;
            await purchase.update({ connection });
            await reservation_ticket_model_1.ReservationTicketModel.create({
                customer_id: data.customerId,
                ticket_id: data.ticketIds[0],
                status: reservation_ticket_model_1.ReservationStatus.reserved,
            }, { connection });
            await this.paymentService.processPayment({
                name: customer.user.name,
                email: customer.user.email,
                address: customer.address,
                phone: customer.phone,
            }, purchase.total_amount, data.cardToken);
            await connection.commit();
            return purchase.id;
        }
        catch (error) {
            await connection.rollback();
            purchase.status = purchase_model_1.PurchaseStatus.error;
            await purchase.update({ connection });
            throw error;
        }
        finally {
            connection.release();
        }
    }
    async associateTicketsWithPurchase(purchaseId, ticketIds, connection) {
        const purchaseTickets = ticketIds.map((ticketId) => ({
            purchase_id: purchaseId,
            ticket_id: ticketId,
        }));
        await purchase_ticket_model_1.PurchaseTicketModel.createMany(purchaseTickets, { connection });
    }
    async findById(id) {
        return purchase_model_1.PurchaseModel.findById(id);
    }
}
exports.PurchaseService = PurchaseService;
