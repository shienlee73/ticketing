import { Request, Response, NextFunction } from "express";
import { AuthorizationError } from "../errors/AuthorizationError";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new AuthorizationError();
  }

  next();
};
