import createConnection from "@/db/connection";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";


export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (!decoded) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }

  const connection = await createConnection();

  const [user] = await connection.execute<RowDataPacket[]>(
    "SELECT * FROM users WHERE id = ?",
    [decoded.id]
  );

  if (!user) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }

  req.user = user[0] as { id: string; email: string };

  next();
};
