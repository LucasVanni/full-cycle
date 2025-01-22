import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserService } from "./services/user-service";


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

  const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload & { id: string };

  if (!decoded) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }

  const userService = new UserService();
  const user = await userService.findById(decoded.id);

  if (!user) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }

  req.user = user as { id: string; email: string };

  next();
};
