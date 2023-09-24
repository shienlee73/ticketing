import { Request, Response, Router } from "express";
import { body } from "express-validator";
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  AuthorizationError,
  OrderStatus,
} from "@tickets73/common";
import sgMail from "@sendgrid/mail";
import { Order } from "../models/Order";
import { stripe } from "../stripe";
import { Payment } from "../models/Payment";
import { PaymentCreatedPublisher } from "../events/publishers/PaymentCreatedPublisher";
import { natsWrapper } from "../NatsWrapper";

sgMail.setApiKey(process.env.SENDGRID_KEY!);

const router = Router();

router.post(
  "/api/payments",
  requireAuth,
  [body("token").not().isEmpty(), body("orderId").not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.user!.id) {
      throw new AuthorizationError();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError("Cannot pay for an cancelled order");
    }

    const charge = await stripe.charges.create({
      currency: "usd",
      amount: order.price * 100,
      source: token,
    });

    const payment = Payment.build({
      orderId: order.id,
      stripeId: charge.id,
    });
    await payment.save();

    new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    // Send email to user
    const msg = {
      to: req.user!.email,
      from: "shienlee73@gmail.com",
      subject: "Payment Confirmation for Your Order",
      text: `Dear Customer\nYour payment for order ${order.id} has been successfully processed. Thank you for your purchase!`,
      html: `<p>Dear Customer,</p><p>Your payment for order ${order.id} has been successfully processed. Thank you for your purchase!</p>`,
    };
    sgMail.send(msg);

    res.status(201).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
