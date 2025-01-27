import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";
import { Database } from "../database";
export enum ReservationStatus {
  reserved = "reserved",
  cancelled = "cancelled",
}

export class ReservationTicketModel {
  id: string;
  customer_id: string;
  ticket_id: string;
  reservation_date: Date;
  status: ReservationStatus;

  constructor(data: Partial<ReservationTicketModel> = {}) {
    this.fill(data);
  }

  fill(data: Partial<ReservationTicketModel>): void {
    if (data.id !== undefined) this.id = data.id;
    if (data.customer_id !== undefined) this.customer_id = data.customer_id;
    if (data.ticket_id !== undefined) this.ticket_id = data.ticket_id;
    if (data.reservation_date !== undefined) this.reservation_date = data.reservation_date;
    if (data.status !== undefined) this.status = data.status;
  }

  static async create(
    data: {
      customer_id: string;
      ticket_id: string;
      status: ReservationStatus;
    },
    options?: { connection?: PoolConnection }
  ): Promise<ReservationTicketModel> {
    const db = options?.connection ?? Database.getInstance();
    const reservation_date = new Date();
    const id = uuidv4();
    
    const [result] = await db.execute<ResultSetHeader>(
      "INSERT INTO reservation_tickets (id, customer_id, ticket_id, status, reservation_date) VALUES (?, ?, ?, ?, ?)",
      [id, data.customer_id, data.ticket_id, data.status, reservation_date]
    );
    
    const reservation = new ReservationTicketModel({
      ...data,
      reservation_date,
      id,
    });
    
    return reservation;
  }

  static async findById(id: string): Promise<ReservationTicketModel | null> {
    const db = Database.getInstance();

    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM reservation_tickets WHERE id = ?",
      [id]
    );
    
    return rows.length
      ? new ReservationTicketModel(rows[0] as ReservationTicketModel)
      : null;
  }

  static async findAll(): Promise<ReservationTicketModel[]> {
    const db = Database.getInstance();

    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM reservation_tickets"
    );

    return rows.map(
      (row) => new ReservationTicketModel(row as ReservationTicketModel)
    );
  }

  async update(options?: { connection?: PoolConnection }): Promise<void> {
    const db = options?.connection ?? Database.getInstance();

    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE reservation_tickets SET customer_id = ?, ticket_id = ?, status = ? WHERE id = ?",
      [this.customer_id, this.ticket_id, this.status, this.id]
    );
    
    if (result.affectedRows === 0) {
      throw new Error("Reservation not found");
    }
  }

  async delete(): Promise<void> {
    const db = Database.getInstance();
    
    const [result] = await db.execute<ResultSetHeader>(
      "DELETE FROM reservation_tickets WHERE id = ?",
      [this.id]
    );
    
    if (result.affectedRows === 0) {
      throw new Error("Reservation not found");
    }
  }


}