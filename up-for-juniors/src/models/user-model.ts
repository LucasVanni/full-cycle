import bcrypt from "bcrypt";
import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { Database } from "../database";

export class UserModel {
  id: string;
  name: string;
  email: string;
  password: string;
  created_at: Date;

  constructor(data: Partial<UserModel> = {}) {
    this.fill(data);
  }

  private fill(data: Partial<UserModel>): void {
    if (data.id !== undefined) this.id = data.id;
    if (data.name !== undefined) this.name = data.name;
    if (data.email !== undefined) this.email = data.email;
    if (data.password !== undefined) this.password = data.password;
  }

  static async create(
    {
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    },
    options?: { connection?: PoolConnection }
  ): Promise<UserModel> {
    const connection = options?.connection || Database.getInstance();

    const hashedPassword = UserModel.hashPassword(password);

    await connection.execute<ResultSetHeader>(
      "INSERT INTO users (id, name, email, password, created_at, updated_at) VALUES (UUID(), ?, ?, ?, NOW(), NOW())",
      [name, email, hashedPassword]
    );

    const [rows] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    const user = rows[0];

    return new UserModel({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
    });
  }

  protected static hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  protected static comparePassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }

  static async findById(id: string): Promise<UserModel | null> {
    const db = Database.getInstance();

    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );

    return rows.length ? new UserModel(rows[0] as UserModel) : null;
  }

  static async findByEmail(email: string): Promise<UserModel | null> {
    const db = Database.getInstance();

    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    return rows.length ? new UserModel(rows[0] as UserModel) : null;
  }

  static async findAll(): Promise<UserModel[]> {
    const db = Database.getInstance();

    const [rows] = await db.execute<RowDataPacket[]>("SELECT * FROM users");

    return rows.map((row) => new UserModel(row as UserModel));
  }

  async update(): Promise<void> {
    const db = Database.getInstance();

    const hashedPassword = UserModel.hashPassword(this.password);

    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE users SET name = ?, email = ?, password = ?, updated_at = NOW() WHERE id = ?",
      [this.name, this.email, hashedPassword, this.id]
    );

    if (result.affectedRows === 0) {
      throw new Error("User not found");
    }
  }

  async delete(): Promise<void> {
    const db = Database.getInstance();

    const [result] = await db.execute<ResultSetHeader>(
      "DELETE FROM users WHERE id = ?",
      [this.id]
    );

    if (result.affectedRows === 0) {
      throw new Error("User not found");
    }
  }
}
