import type { Schema } from "mongoose";
import mongoose from "../mongoose.server";
import type { RestockHistoryInterface } from "../types";

const RestockHistorySchema: Schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
    },
    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "operators",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },
    unitPrice: {
      type: Number,
    },
    totalQuantity: Number,
    quantityPayable: Number,
    amountPayable: Number,
    commission: Number,
    note: String,
  },
  { timestamps: true }
);

let RestockHistory: mongoose.Model<RestockHistoryInterface>;
try {
  RestockHistory = mongoose.model<RestockHistoryInterface>("restocks");
} catch (error) {
  RestockHistory = mongoose.model<RestockHistoryInterface>(
    "restocks",
    RestockHistorySchema
  );
}

export { RestockHistory };
