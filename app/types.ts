import type { Document } from "mongodb";

export type StockHistoryInterface = {
  _id: string; //Types.ObjectId
  user: AdminInterface;
  product: ProductInterface;
  price: number;
  quantity: number;
  oeperation: string;
  createdAt: Date;
  updatedAt: Date;
};

export type RestockHistoryInterface = {
  _id: string; //Types.ObjectId
  user: AdminInterface;
  product: ProductInterface;
  price: number;
  costPrice: number;
  quantityPayable: number;
  totalQuantity: number;
  amountPayable: number;
  commission: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductInterface = {
  _id: string; //Types.ObjectId
  name: string;
  description: string;
  quantity: number;
  stockAtShop: number;
  stockAtHome: number;
  quantitySold: number;
  price: number;
  costPrice: number;
  images: ImageInterface[];
  availability: string;
  createdAt: Date;
  updatedAt: Date;
  reorderPoint: number;
  stockHistory: StockHistoryInterface[];
  category: CategoryInterface;
};

export type ImageInterface = {
  _id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CategoryInterface = {
  _id: string;
  name: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminInterface = {
  _id: string;
  username: string;
  email: string;
  role?: string;
  permissions?: [{ name: string; action: string }];
  createdAt: Date;
  updatedAt: Date;
};

export type CustomerInterface = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
};

export type OperatorInterface = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
};

export type EmployeeInterface = {
  _id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  username: string;
  email: string;
  role?: string;
  password: string;
  permissions?: [{ name: string; action: string }];
  createdAt: Date;
  updatedAt: Date;
};

export type CartInterface = {
  _id: string;
  user: string;
  product: ProductInterface;
  stock: StockHistoryInterface;
  quantity: number;
  color: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ServiceCartInterface = {
  _id: string;
  user: string;
  service: ProductInterface;
  stock: StockHistoryInterface;
  quantity: number;
  color: number;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderInterface = {
  _id: string;
  orderId: string;
  orderItems: CartInterface[];
  totalPrice: number;
  deliveryStatus: string;
  status: string;
  user: UserInterface;
  cashier: EmployeeInterface;
  onCredit: boolean;
  shippingAddress: AddressInterface;
  paymentInfo: PaymentInterface;
  paymentStatus: "pending" | "paid" | "failed";
  deliveryDate: string;
  amountPaid: number;
  customer: CustomerInterface;
  salesPerson: EmployeeInterface;
  customerName: string;
  createdAt: string;
  updatedAt: string;
};

export type AddressInterface = {
  _id: string;
  user: UserInterface;
  title: String;
  address: String;
  street: String;
  city: String;
  state: String;
  zip: String;
  default: Boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type EmailHistoryInterface = {
  _id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  storeName: string;
};

export type LogInterface = {
  _id: string;
  user: UserInterface;
  product?: ProductInterface;
  order?: OrderInterface;
  action: string;
};

export type PaymentInterface = {
  _id: string;
  cashier: EmployeeInterface;
  order: OrderInterface;
  method: "momo" | "cash";
  customerName: string;
  customerPhone: string;
  amount: number;
  createdAt: Date;
};

export type ExpenseInterface = {
  _id: string;
  admin: AdminInterface;
  amount: number;
  note: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
};

export type GeneralSettingsInterface = {
  _id: string;
  address: string;
  businessName: string;
  phine: string;
  email: string;
  separateStocks: boolean;
  allowInscription: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// export type PaymentInterface = {
//   _id: string;
//   orderId: string;
//   paymentMethod: string;
//   phoneNumber: string;
//   cardNumber: string;
//   status: string;
//   createdAt: Date;
//   updatedAt: Date;
// }
