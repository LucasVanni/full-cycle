
import { Database } from "@/database";
import { UserModel } from "@/models/user-model";
import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";

export class PartnerModel {
    id: string;
    user_id: string;
    company_name: string;
    user?: UserModel;

  constructor(partner: Partial<PartnerModel> = {}) {
    this.fill(partner);
  }

  private fill(partner: Partial<PartnerModel>): void {
    if (partner.id !== undefined) this.id = partner.id;
    if (partner.user_id !== undefined) this.user_id = partner.user_id;
    if (partner.company_name !== undefined) this.company_name = partner.company_name;
  }

  static async create(partner: {
    user_id: string;
    company_name: string;
  }, options?: {connection: PoolConnection}): Promise<PartnerModel> {
    const connection = options?.connection || Database.getInstance();

    const { user_id, company_name } = partner;
    
    await connection.execute<ResultSetHeader>(
      "INSERT INTO partners (id, user_id, company_name, created_at, updated_at) VALUES (UUID(), ?, ?, NOW(), NOW())",
      [user_id, company_name]
    );

    const [rows] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM partners WHERE user_id = ?",
      [user_id]
    );

    return new PartnerModel(rows[0] as PartnerModel);
  }

  static async findById(
    id: number,
    options?: { user?: boolean }
  ): Promise<PartnerModel | null> {
    const db = Database.getInstance();
    
    let query = "SELECT * FROM partners WHERE id = ?";

    if (options?.user) {
      query =
        "SELECT p.*, users.id as user_id, users.name as user_name, users.email as user_email FROM partners p JOIN users ON p.user_id = users.id WHERE p.id = ?";
    }

    const [rows] = await db.execute<RowDataPacket[]>(query, [id]);

    if (rows.length === 0) return null;

    const partner = new PartnerModel(rows[0] as PartnerModel);

    if (options?.user) {
      partner.user = new UserModel({
        id: rows[0].user_id,
        name: rows[0].user_name,
        email: rows[0].user_email,
      });
    }

    return partner;
  }

  static async findByUserId(
    userId: string,
    options?: { user?: boolean }
  ): Promise<PartnerModel | null> {
    const db = Database.getInstance();
    let query = "SELECT * FROM partners WHERE user_id = ?";

    if (options?.user) {
      query =
        "SELECT p.*, users.id as user_id, users.name as user_name, users.email as user_email FROM partners p JOIN users ON p.user_id = users.id WHERE p.user_id = ?";
    }
    const [rows] = await db.execute<RowDataPacket[]>(query, [userId]);

    if (rows.length === 0) return null;

    const partner = new PartnerModel(rows[0] as PartnerModel);

    if (options?.user) {
      partner.user = new UserModel({
        id: rows[0].user_id,
        name: rows[0].user_name,
        email: rows[0].user_email,
      });
    }

    return partner;
  }

  static async findAll(): Promise<PartnerModel[]> {
    const db = Database.getInstance();

    const [rows] = await db.execute<RowDataPacket[]>("SELECT * FROM partners");

    return rows.map((row) => new PartnerModel(row as PartnerModel));
  }

  async update(): Promise<void> {
    const db = Database.getInstance();

    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE partners SET user_id = ?, company_name = ?, updated_at = NOW() WHERE id = ?",
      [this.user_id, this.company_name, this.id]
    );

    if (result.affectedRows === 0) {
      throw new Error("Partner not found");
    }
  }

  async delete(): Promise<void> {
    const db = Database.getInstance();

    const [result] = await db.execute<ResultSetHeader>(
      "DELETE FROM partners WHERE id = ?",
      [this.id]
    );

    if (result.affectedRows === 0) {
      throw new Error("Partner not found");
    }
  }
}
