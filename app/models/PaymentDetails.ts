import mongoose from "../mongoose.server";
import type { PaymentInterface } from "../types";

const PaymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customers",
    },
    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "operators",
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "orders",
    },
    method: {
      type: String,
      enum: ["momo", "cash"],
      default: "cash",
    },
    transactionType: {
      type: String,
      enum: ["loan", "payout", "order"],
      default: "order",
    },
    amount: {
      type: Number,
      required: true,
    },
    description: String,
  },
  {
    timestamps: true,
  }
);

let Payment: mongoose.Model<PaymentInterface>;
try {
  Payment = mongoose.model<PaymentInterface>("payments");
} catch (error) {
  Payment = mongoose.model<PaymentInterface>("payments", PaymentSchema);
}

export { Payment };
