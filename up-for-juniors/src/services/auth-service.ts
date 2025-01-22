import { UserModel } from "@/models/user-model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthService {
  constructor() {}

  async login(email: string, password: string) {
    const userModel = await UserModel.findByEmail(email);

    const isPasswordValid = await bcrypt.compare(
      password,
      userModel?.password || ""
    );

    if (!userModel || !isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    return jwt.sign(
      { id: userModel.id, email: userModel.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid credentials");
  }
}
