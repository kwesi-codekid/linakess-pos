import mongoose from "../mongoose.server";
import type { CustomerInterface } from "../types";

const CustomerShema: mongoose.Schema<CustomerInterface> =
  new mongoose.Schema<CustomerInterface>(
    {
      fullName: String,
      email: {
        type: String,
//        required: false,
      },
      phone: {
        type: String,
        // unique: true,
      },
      balance: {
        type: Number,
        default: 0,
      },
    },
    { timestamps: true }
  );

let Customer: mongoose.Model<CustomerInterface>;
try {
  Customer = mongoose.model<CustomerInterface>("customers");
} catch (error) {
  Customer = mongoose.model<CustomerInterface>("customers", CustomerShema);
}

export { Customer };
