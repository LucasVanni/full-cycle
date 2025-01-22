import { AuthService, InvalidCredentialsError } from "@/services/auth-service";
import { Router } from "express";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const authService = new AuthService();
  try {

    const token = await authService.login(email, password);

    res.json({ token });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      res.status(401).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unexpected error occurred" });
    }
  }
});
