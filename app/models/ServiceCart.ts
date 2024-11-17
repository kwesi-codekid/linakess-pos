import mongoose from "../mongoose.server";
import type { ServiceCartInterface } from "../types";

const ServiceCartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      required: false,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "services",
    },
    quantity: {
      type: Number,
      required: true,
    },
    stock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "stocks",
    },
    color: String,
    inscription: String,
  },
  {
    timestamps: true,
  }
);

let ServiceCart: mongoose.Model<ServiceCartInterface>;
try {
  ServiceCart = mongoose.model<ServiceCartInterface>("serrvice_carts");
} catch (error) {
  ServiceCart = mongoose.model<ServiceCartInterface>(
    "serrvice_carts",
    ServiceCartSchema
  );
}
export { ServiceCart };
