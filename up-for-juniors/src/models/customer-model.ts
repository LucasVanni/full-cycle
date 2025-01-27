import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { Database } from "../database";
import { UserModel } from "../models/user-model";

export class CustomerModel {
  id: string;
  user_id: string;
  address: string;
  phone: string;
  user?: UserModel;

  constructor(data: Partial<CustomerModel> = {}) {
    this.fill(data);
  }

  fill(data: Partial<CustomerModel>): void {
    if (data.id !== undefined) this.id = data.id;
    if (data.user_id !== undefined) this.user_id = data.user_id;
    if (data.address !== undefined) this.address = data.address;
    if (data.phone !== undefined) this.phone = data.phone;
  }

  static async create(
    data: { user_id: string; address: string; phone: string },
    options?: { connection?: PoolConnection }
  ): Promise<CustomerModel> {
    const db = options?.connection ?? Database.getInstance();

    const { user_id, address, phone } = data;

    const [result] = await db.execute<ResultSetHeader & { insertId: string }>(
      "INSERT INTO customers (id, user_id, address, phone, created_at, updated_at) VALUES (UUID(), ?, ?, ?, NOW(), NOW())",
      [user_id, address, phone]
    );

    const customer = new CustomerModel({
      id: result.insertId,
      user_id,
      address,
      phone,
    });
    return customer;
  }

  static async findById(
    id: string,
    options?: { user?: boolean }
  ): Promise<CustomerModel | null> {
    const db = Database.getInstance();
    let query = "SELECT * FROM customers WHERE id = ?";

    if (options?.user) {
      query =
        "SELECT c.*, users.id as user_id, users.name as user_name, users.email as user_email FROM customers c JOIN users ON c.user_id = users.id WHERE c.id = ?";
    }

    const [rows] = await db.execute<RowDataPacket[]>(query, [id]);

    if (rows.length === 0) return null;

    const customer = new CustomerModel(rows[0] as CustomerModel);

    if (options?.user) {
      customer.user = new UserModel({
        id: rows[0].user_id,
        name: rows[0].user_name,
        email: rows[0].user_email,
      });
    }

    return customer;
  }

  static async findByUserId(
    user_id: string,
    options?: { user?: boolean }
  ): Promise<CustomerModel | null> {
    const db = Database.getInstance();
    let query = "SELECT * FROM customers WHERE user_id = ?";

    if (options?.user) {
      query =
        "SELECT c.*, users.id as user_id, users.name as user_name, users.email as user_email FROM customers c JOIN users ON c.user_id = users.id WHERE c.user_id = ?";
    }

    const [rows] = await db.execute<RowDataPacket[]>(query, [user_id]);

    if (rows.length === 0) return null;

    const customer = new CustomerModel(rows[0] as CustomerModel);

    if (options?.user) {
      customer.user = new UserModel({
        id: rows[0].user_id,
        name: rows[0].user_name,
        email: rows[0].user_email,
      });
    }

    return customer;
  }

  static async findAll(): Promise<CustomerModel[]> {
    const db = Database.getInstance();

    const [rows] = await db.execute<RowDataPacket[]>("SELECT * FROM customers");

    return rows.map((row) => new CustomerModel(row as CustomerModel));
  }

  async update(): Promise<void> {
    const db = Database.getInstance();
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE customers SET user_id = ?, address = ?, phone = ?, updated_at = NOW() WHERE id = ?",
      [this.user_id, this.address, this.phone, this.id]
    );

    if (result.affectedRows === 0) {
      throw new Error("Customer not found");
    }
  }

  async delete(): Promise<void> {
    const db = Database.getInstance();

    const [result] = await db.execute<ResultSetHeader>(
      "DELETE FROM customers WHERE id = ?",
      [this.id]
    );

    if (result.affectedRows === 0) {
      throw new Error("Customer not found");
    }
  }
}
