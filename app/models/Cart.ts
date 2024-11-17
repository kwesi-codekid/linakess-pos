import mongoose from "../mongoose.server";
import type { CartInterface } from "../types";

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      required: false,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
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

let Cart: mongoose.Model<CartInterface>;
try {
  Cart = mongoose.model<CartInterface>("carts");
} catch (error) {
  Cart = mongoose.model<CartInterface>("carts", CartSchema);
}
export { Cart };

// const GuestCartsSchema = new mongoose.Schema(
//   {
//     guestId: {
//       type: String,
//       required: true,
//     },
//     product: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "products",
//     },
//     quantity: {
//       type: Number,
//       required: true,
//     },
//     color: String,
//     inscription: String,
//   },
//   {
//     timestamps: true,
//   }
// );
