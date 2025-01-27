import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { Database } from "../database";

export enum TicketStatus {
  available = "available",
  sold = "sold",
}

export class TicketModel {
  id: string;
  location: string;
  event_id: string;
  price: number;
  status: TicketStatus;

  constructor(data: Partial<TicketModel> = {}) {
    this.fill(data);
  }

  fill(data: Partial<TicketModel>): void {
    if (data.id !== undefined) this.id = data.id;
    if (data.location !== undefined) this.location = data.location;
    if (data.event_id !== undefined) this.event_id = data.event_id;
    if (data.price !== undefined) this.price = data.price;
    if (data.status !== undefined) this.status = data.status;
  }

  static async create(data: {
    location: string;
    event_id: string;
    price: number;
    status: TicketStatus;
  }): Promise<TicketModel> {
    const db = Database.getInstance();

    const [result] = await db.execute<ResultSetHeader & { insertId: string }>(
      "INSERT INTO tickets (id, location, event_id, price, status, created_at) VALUES (UUID(), ?, ?, ?, ?, NOW())",
      [data.location, data.event_id, data.price, data.status]
    );

    const ticket = new TicketModel({
      ...data,
      id: result.insertId,
    });

    return ticket;
  }

  static async createMany(
    data: {
      id: string;
      location: string;
      event_id: string;
      price: number;
      status: TicketStatus;
      created_at: Date;
      updated_at: Date;
    }[]
  ): Promise<TicketModel[]> {
    const db = Database.getInstance();

    const values = Array(data.length)
      .fill("(?, ?, ?, ?, ?, ?, ?)")
      .join(", ");

    const params = data.reduce<(string | number | Date)[]>(
      (acc, ticket) => [
        ...acc,
        ticket.id,
        ticket.location,
        ticket.event_id,
        ticket.price,
        ticket.status,
        ticket.created_at,
        ticket.updated_at,
      ],
      []
    );

    await db.execute<ResultSetHeader>(
      `INSERT INTO tickets (id, location, event_id, price, status, created_at, updated_at) VALUES ${values}`,
      params
    );

    const insertedIds = data.map(ticket => ticket.id);

    const tickets = data.map(
      (ticket, index) =>
        new TicketModel({
          ...ticket,
          id: insertedIds[index],
        })
    );
    return tickets;
  }

  static async findById(id: string): Promise<TicketModel | null> {
    const db = Database.getInstance();
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM tickets WHERE id = ?",
      [id]
    );
    return rows.length ? new TicketModel(rows[0] as TicketModel) : null;
  }

  static async findAll(
    filter?: {
      where?: { event_id?: string; ids?: string[] };
    },
    options?: { connection?: PoolConnection }
  ): Promise<TicketModel[]> {
    const db = options?.connection ?? Database.getInstance();

    let query = "SELECT * FROM tickets";

    const params = [];

    if (filter && filter.where) {
      const where = [];

      if (filter.where.event_id) {
        where.push("event_id = ?");

        params.push(filter.where.event_id);
      }

      if (filter.where.ids) {
        where.push(`id IN (${filter.where.ids.map(() => "?").join(", ")})`);

        params.push(...filter.where.ids);
      }

      query += ` WHERE ${where.join(" AND ")}`;
    }

    const [rows] = await db.execute<RowDataPacket[]>(query, params);

    return rows.map((row) => new TicketModel(row as TicketModel));
  }

  async update(): Promise<void> {
    const db = Database.getInstance();

    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE tickets SET location = ?, event_id = ?, price = ?, status = ?, updated_at = NOW() WHERE id = ?",
      [this.location, this.event_id, this.price, this.status, this.id]
    );

    if (result.affectedRows === 0) {
      throw new Error("Ticket not found");
    }
  }

  async delete(): Promise<void> {
    const db = Database.getInstance();

    const [result] = await db.execute<ResultSetHeader>(
      "DELETE FROM tickets WHERE id = ?",
      [this.id]
    );

    if (result.affectedRows === 0) {
      throw new Error("Ticket not found");
    }
  }
}
