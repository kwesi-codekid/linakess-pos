import mongoose from "../mongoose.server";
import type { OperatorInterface } from "../types";

const operatorSchema: mongoose.Schema<OperatorInterface> =
  new mongoose.Schema<OperatorInterface>(
    {
      fullName: String,
      email: {
        type: String,
        required: false,
      },
      phone: {
        type: String,
        unique: true,
      },
      balance: {
        type: Number,
        default: 0,
      },
    },
    { timestamps: true }
  );

let Operator: mongoose.Model<OperatorInterface>;
try {
  Operator = mongoose.model<OperatorInterface>("operators");
} catch (error) {
  Operator = mongoose.model<OperatorInterface>("operators", operatorSchema);
}

export default Operator;
