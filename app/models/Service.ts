import mongoose from "../mongoose.server";
import type { CustomerInterface } from "../types";

const ServiceShema: mongoose.Schema<CustomerInterface> =
  new mongoose.Schema<CustomerInterface>(
    {
      name: String,
      price: {
        type: Number,
        default: 0,
      },
      description: String,
    },
    { timestamps: true }
  );

let Service: mongoose.Model<CustomerInterface>;
try {
  Service = mongoose.model<CustomerInterface>("services");
} catch (error) {
  Service = mongoose.model<CustomerInterface>("services", ServiceShema);
}

export { Service };
