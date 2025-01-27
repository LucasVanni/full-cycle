import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";
import { Database } from "../database";

export enum PurchaseStatus {
  pending = "pending",
  paid = "paid",
  error = "error",
  cancelled = "cancelled",
}

export class PurchaseModel {
  id: string;
  customer_id: string;
  purchase_date: Date;
  total_amount: number;
  status: PurchaseStatus;

  constructor(data: Partial<PurchaseModel> = {}) {
    this.fill(data);
  }

  fill(data: Partial<PurchaseModel>): void {
    if (data.id !== undefined) this.id = data.id;
    if (data.customer_id !== undefined) this.customer_id = data.customer_id;
    if (data.purchase_date !== undefined) this.purchase_date = data.purchase_date;
    if (data.total_amount !== undefined) this.total_amount = data.total_amount;
    if (data.status !== undefined) this.status = data.status;
  }

  static async create(
    data: {
      customer_id: string;
      total_amount: number;
      status: PurchaseStatus;
    },
    options?: { connection?: PoolConnection }
  ): Promise<PurchaseModel> {
    const db = options?.connection ?? Database.getInstance();
    
    const purchase_date = new Date();

    const id = uuidv4();
    
    await db.execute<ResultSetHeader>(
      "INSERT INTO purchases (id, customer_id, total_amount, status, purchase_date) VALUES (?, ?, ?, ?, ?)",
      [id, data.customer_id, data.total_amount, data.status, purchase_date]
    );
    
    const purchase = new PurchaseModel({
      ...data,
      purchase_date,
      id,
    });
    
    return purchase;
  }

  static async findById(id: string): Promise<PurchaseModel | null> {
    const db = Database.getInstance();
    
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM purchases WHERE id = ?",
      [id]
    );
    
    return rows.length ? new PurchaseModel(rows[0] as PurchaseModel) : null;
  }

  static async findAll(): Promise<PurchaseModel[]> {
    const db = Database.getInstance();
    
    const [rows] = await db.execute<RowDataPacket[]>("SELECT * FROM purchases");
    
    return rows.map((row) => new PurchaseModel(row as PurchaseModel));
  }

  async update(options?: { connection?: PoolConnection }): Promise<void> {
    const db = options?.connection ?? Database.getInstance();
    
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE purchases SET customer_id = ?, total_amount = ?, status = ? WHERE id = ?",
      [this.customer_id, this.total_amount, this.status, this.id]
    );
    
    if (result.affectedRows === 0) {
      throw new Error("Purchase not found");
    }
  }

  async delete(): Promise<void> {
    const db = Database.getInstance();
    
    const [result] = await db.execute<ResultSetHeader>(
      "DELETE FROM purchases WHERE id = ?",
      [this.id]
    );
   
    if (result.affectedRows === 0) {
      throw new Error("Purchase not found");
    }
  }
}