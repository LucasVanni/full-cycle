import createConnection from "@/db/connection";
import bcrypt from "bcrypt";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Connection } from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";

const authRouter = Router();

const createUser = async (
  connection: Connection,
  name: string,
  email: string,
  password: string
) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user_id = uuidv4();

  await connection.execute<ResultSetHeader>(
    "INSERT INTO users (id, name, email, password, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())",
    [user_id, name, email, hashedPassword]
  );

  return user_id;
};

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const connection = await createConnection();

  try {
    const [rows] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    const user = rows.length ? rows[0] : null;

    const isPasswordValid = await bcrypt.compare(password, user?.password || "");

    if (!user || !isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({ message: "Login successful", token });
  } finally {
    await connection.end();
  }
});

authRouter.post("/partners", async (req, res) => {
  const { name, email, password, company_name } = req.body;

  const connection = await createConnection();

  try {
    const user_id = await createUser(connection, name, email, password);

    const [partnerResult] = await connection.execute<ResultSetHeader>(
      "INSERT INTO partners (id, user_id, company_name, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())",
      [uuidv4(), user_id, company_name]
    );

    res.status(201).json({ id: partnerResult.insertId, user_id, company_name });
  } finally {
    await connection.end();
  }
});

authRouter.post("/customers", async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  const connection = await createConnection();

  try {
    const user_id = await createUser(connection, name, email, password);

    const [customerResult] = await connection.execute<ResultSetHeader>(
      "INSERT INTO customers (id, user_id, phone, address, created_at, updated_at) VALUES (UUID(), ?, ?, ?, NOW(), NOW())",
      [user_id, phone, address]
    );

    res
      .status(201)
      .json({ id: customerResult.insertId, user_id, phone, address });
  } finally {
    await connection.end();
  }
});

export default authRouter;
