import mongoose from "../mongoose.server";
import type { OrderInterface } from "../types";

const OrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      required: false,
    },
    shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "addresses",
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products",
          required: true,
        },
        costPrice: {
          type: Number,
          required: true,
        },
        sellingPrice: {
          type: Number,
          required: true,
        },
        stock: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "stocks",
        },
        quantity: {
          type: Number,
          required: true,
        },
        color: String,
      },
    ],
    orderServiceItems: [
      {
        service: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "services",
          required: true,
        },
        costPrice: {
          type: Number,
          required: true,
        },
        sellingPrice: {
          type: Number,
          required: true,
        },
        stock: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "stocks",
        },
        quantity: {
          type: Number,
          required: true,
        },
        color: String,
      },
    ],
    deliveryDate: {
      type: Date,
      default: Date.now,
    },
    paymentInfo: {
      paymentMethod: String,
      cardNumber: String,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["cancelled", "pending", "completed"],
      default: "pending",
    },
    deliveryStatus: {
      type: String,
      enum: ["pending", "shipped", "delivered"],
      default: "pending",
    },
    paymentReff: String,
    onCredit: {
      type: Boolean,
      default: false,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    balance: {
      type: Number,
      default: 0,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customers",
      required: false,
    },
    shippingTimelines: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "shipping_timelines",
      },
    ],
    discount: {
      type: Number,
      default: 0,
    },
    orderType: {
      type: String,
      enum: ["sale", "order"],
      default: "sale",
    },
    items: [
      {
        productName: String,
        quantity: Number,
        description: String,
        price: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

let Order: mongoose.Model<OrderInterface>;
try {
  Order = mongoose.model<OrderInterface>("orders");
} catch (error) {
  Order = mongoose.model<OrderInterface>("orders", OrderSchema);
}

export { Order };
