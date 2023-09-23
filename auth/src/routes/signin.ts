import { Router, Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { validateRequest, BadRequestError } from "@tickets73/common";
import { Password } from "../services/Password";

const router = Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").trim().notEmpty().withMessage("You must supply a password"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      throw new BadRequestError("Invalid credentials");
    }

    const isMatch = await Password.compare(existingUser.password, password);

    if (!isMatch) {
      throw new BadRequestError("Invalid credentials");
    }

    // Generate JWT
    const token = jwt.sign({ id: existingUser.id, email: existingUser.email }, process.env.JWT_KEY!);
    // Store it on session object
    req.session = {
      jwt: token,
    };

    res.status(200).send(existingUser);
  }
);

export { router as signinRouter };
