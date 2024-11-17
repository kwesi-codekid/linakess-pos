import type { Schema } from "mongoose";
import mongoose from "../mongoose.server";
import type {
  CategoryInterface,
  ImageInterface,
  ProductInterface,
} from "../types";

const ProductImageSchema: Schema = new mongoose.Schema(
  {
    name: String,
    url: String,
    size: Number,
    type: String,
  },
  { timestamps: true }
);

const CategorySchema: Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
      },
    ],
  },
  { timestamps: true }
);

const ProductSchema: Schema = new mongoose.Schema(
  {
    name: String,
    description: String,
    price: {
      type: Number,
    },
    costPrice: {
      type: Number,
      default: 1,
    },
    availability: String,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categories",
      required: false,
    },
    images: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "images",
      },
    ],
    quantitySold: {
      type: Number,
      default: 0,
    },
    stockHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "stocks",
      },
    ],
    reorderPoint: {
      type: Number,
      default: 5,
    },
    stockAtHome: {
      type: Number,
      default: 0,
    },
    stockAtShop: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

let Product: mongoose.Model<ProductInterface>;
let ProductImage: mongoose.Model<ImageInterface>;
let Category: mongoose.Model<CategoryInterface>;
try {
  Product = mongoose.model<ProductInterface>("products");
  ProductImage = mongoose.model<ImageInterface>("images");
  Category = mongoose.model<CategoryInterface>("categories");
} catch (error) {
  Product = mongoose.model<ProductInterface>("products", ProductSchema);
  ProductImage = mongoose.model<ImageInterface>("images", ProductImageSchema);
  Category = mongoose.model<CategoryInterface>("categories", CategorySchema);
}

export { Product, ProductImage, Category };
