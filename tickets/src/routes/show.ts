import { Router, Request, Response } from "express";
import { NotFoundError } from "@tickets73/common";
import { Ticket } from "../models/Ticket";

const router = Router();

router.get("/api/tickets/:id", async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new NotFoundError();
  }

  res.send(ticket);
});

export { router as showTicketRouter };
