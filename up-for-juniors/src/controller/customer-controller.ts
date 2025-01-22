import { CustomerService } from "@/services/customer-service";
import { Router } from "express";

export const customerRouter = Router();

customerRouter.post("/register", async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  const customerService = new CustomerService();
  const customer = await customerService.register({
    name,
    email,
    password,
    phone,
    address,
  });

  res.status(201).json(customer);
});
