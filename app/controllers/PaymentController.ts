import {
  createCookieSessionStorage,
  json,
  redirect,
  type SessionStorage,
} from "@remix-run/node";
import { Payment } from "~/models/PaymentDetails";
import AdminController from "./AdminController.server";
import { Order } from "~/models/Order";
import Operator from "~/models/Operator";
import { RestockHistory } from "~/models/RestockHistory";
import { Customer } from "~/models/Customer";

export default class PaymentController {
  private request: Request;
  private domain: string;
  private session: any;
  private Cart: any;
  private Product: any;
  private ProductImages: any;
  private storage: SessionStorage;

  /**
   * Initialize a PaymentController instance
   * @param request This Fetch API interface represents a resource request.
   * @returns this
   */
  constructor(request: Request) {
    this.request = request;
    this.domain = (this.request.headers.get("host") as string).split(":")[0];

    const secret = "asfafasfasjfhasf";
    if (!secret) {
      throw new Error("No session secret provided");
    }
    this.storage = createCookieSessionStorage({
      cookie: {
        name: "__session",
        secrets: [secret],
        sameSite: "lax",
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      },
    });
  }

  public addPaymentDetails = async ({
    user,
    method,
    mobileNumber,
  }: {
    user: string;
    method: string;
    mobileNumber: string;
  }) => {
    const existingPaymentDetail = await this.PaymentDetails.findOne({
      user,
      method,
    });

    if (existingPaymentDetail) {
      this.PaymentDetails.findByIdAndUpdate(existingPaymentDetail._id, {
        $inc: { quantity: 1 },
      }).exec();
    } else {
      const cart = await this.PaymentDetails.create({
        user,
        product,
        quantity: 1,
      });

      if (!cart) {
        return json(
          {
            error: "Error creating cart",
            fields: {},
          },
          { status: 400 }
        );
      }
    }

    return redirect(`"/products/${product}"`, 200);
  };

  public getUserPaymentDetails = async ({ user }: { user: string }) => {
    try {
      const payment_details = await this.PaymentDetails.find({ user });

      return payment_details;
    } catch (error) {
      console.error("Error retrieving carts:", error);
    }
  };

  public requestHubtelPayment = async ({
    totalAmount,
    customerName,
    orderId,
  }: {
    totalAmount: number;
    customerName: string;
    orderId: string;
  }) => {
    return new Promise<{
      responseCode: string;
      status: string;
      data: {
        checkoutUrl: string;
        checkoutId: string;
        clientReference: string;
        message: string;
        checkoutDirectUrl: string;
      };
    }>(async (resolve, reject) => {
      try {
        const data = JSON.stringify({
          totalAmount,
          description: customerName,
          callbackUrl:
            "https://webhook.site/a6849fb9-e114-4a2c-afe8-f8e062547e34",
          returnUrl: "http://kwamina.com:3000/api/hubtell_callback",
          merchantAccountNumber: "2017174",
          cancellationUrl: "http://hubtel.com/",
          clientReference: orderId,
        });

        // Convert the input string to a binary string
        const binaryString = unescape(
          encodeURIComponent("pQn0DNm:a1d146a4492c41cdbe2263250adf6bf8")
        );

        // Encode the binary string using Base64
        const encodedString = btoa(binaryString);

        const config = {
          method: "post",
          maxBodyLength: Infinity,
          url: "https://payproxyapi.hubtel.com/items/initiate",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${encodedString}`,
          },
          data: data,
        };

        const response = await axios.request(config);
        resolve(response.data);
      } catch (error) {
        reject({
          responseCode: "400",
          status: "Error",
          data: {},
        });
      }
    });
  };

  public hubtelCallback = async ({
    orderId,
    paymentReff,
  }: {
    orderId: string;
    paymentReff: string;
  }) => {
    const orderController = await new OrderController(this.request);
    await orderController.orderPaymentStatus({
      status: "paid",
      orderId,
      paymentReff,
    });
    return json({ message: "Success" }, 200);
  };

  public getOrderPayments = async ({ orderId }: { orderId: string }) => {
    const payments = await Payment.find({ order: orderId }).populate("cashier");
    return payments;
  };

  public makePayment = async ({
    orderId,
    paymentMethod,
    customer,
    amount,
  }: {
    orderId: string;
    paymentMethod?: string;
    customer?: string;
    amount: string;
  }) => {
    const adminController = await new AdminController(this.request);
    const adminId = await adminController.getAdminId();

    const payment = await Payment.create({
      amount,
      order: orderId,
      user: adminId,
      customer,
    });

    if (!payment) {
      console.log("somemthing went wrong...");
      throw new Error("Error creating payment");
    }

    await Order.findByIdAndUpdate(orderId, {
      $inc: { amountPaid: parseFloat(amount) },
    }).exec();

    const order = await Order.findOne({ _id: orderId }).exec();

    if (order?.amountPaid >= order?.totalPrice) {
      await Order.findByIdAndUpdate(orderId, {
        $set: { paymentStatus: "paid" },
      }).exec();
    }

    return true;
  };

  public createOperatorTransaction = async ({
    paymentMethod,
    operator,
    amount,
    transactionType,
    description,
  }: {
    paymentMethod?: string;
    operator?: string;
    amount: string;
    transactionType: string;
    description: string;
  }) => {
    const adminController = await new AdminController(this.request);
    const adminId = await adminController.getAdminId();
    const payment = await Payment.create({
      paymentMethod,
      operator,
      amount,
      transactionType,
      description,
      user: adminId,
    });

    await Operator.findOneAndUpdate(
      { _id: operator },
      {
        $inc: {
          balance: -parseFloat(amount),
        },
      }
    );

    return payment;
  };

  public getCustomerPayments = async ({
    customerId,
  }: {
    customerId: string;
  }) => {
    const payments = await Payment.find({
      customer: customerId,
    })
      .populate("order")
      .populate("user")
      .exec();
    return payments;
  };

  public getOperatorPayments = async ({
    operatorId,
  }: {
    operatorId: string;
  }) => {
    const payments = await Payment.find({
      operator: operatorId,
    });
    return payments;
  };

  public getOperatorPaymentsApi = async ({
    operatorId,
    from,
    to,
  }: {
    operatorId: string;
    from: string;
    to: string;
  }) => {
    const fromDate = from ? new Date(from) : new Date();
    fromDate.setHours(0, 0, 0, 0);
    const toDate = to ? new Date(to) : new Date();
    toDate.setHours(23, 59, 59, 999);

    const payments = await Payment.find({
      operator: operatorId,
      createdAt: {
        $gte: fromDate,
        $lte: toDate,
      },
    });
    return payments;
  };

  public getaymentsByOrderId = async (orderId: string) => {
    const payments = await Payment.find({ order: orderId });
    return payments;
  };

  public createCustomerTransaction = async ({
    paymentMethod,
    customer,
    amount,
    transactionType,
    description,
    orderId,
  }: {
    paymentMethod?: string;
    customer?: string;
    amount: string;
    transactionType: string;
    description: string;
    orderId: string;
  }) => {
    const adminController = await new AdminController(this.request);
    const adminId = await adminController.getAdminId();
    const payment = await Payment.create({
      paymentMethod,
      customer,
      amount,
      transactionType,
      description,
      user: adminId,
      order: orderId,
    });

    const currentOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        $inc: { amountPaid: parseFloat(amount), balance: parseFloat(amount) },
      },
      {
        new: true,
      }
    ).exec();

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus:
        currentOrder?.totalPrice <= currentOrder?.amountPaid
          ? "paid"
          : "pending",
    }).exec();

    await Customer.findOneAndUpdate(
      { _id: customer },
      {
        $inc: {
          balance: parseFloat(amount),
        },
      }
    );

    return payment;
  };

  public editCustomerTransaction = async ({
    id,
    paymentId,
    amount,
    description,
  }: {
    id: string;
    amount: string;
    paymentId: string;
    description: string;
  }) => {
    const payment = await Payment.findById(paymentId);

    await Order.findByIdAndUpdate(payment.order, {
      $inc: {
        amountPaid: -parseFloat(payment.amount),
      },
    }).exec();

    await Order.findByIdAndUpdate(payment.order, {
      $inc: {
        amountPaid: parseFloat(amount),
      },
    }).exec();

    await Customer.findOneAndUpdate(
      { _id: payment.customer },
      {
        $inc: {
          balance: -parseFloat(payment.amount),
        },
      }
    );

    await Customer.findOneAndUpdate(
      { _id: payment.customer },
      {
        $inc: {
          balance: parseFloat(amount),
        },
      }
    );

    await Payment.findByIdAndUpdate(
      paymentId,
      {
        amount,
        description,
      },
      {
        new: true,
      }
    ).exec();

    return payment;
  };

  public deleteCustomerTransaction = async ({
    paymentId,
  }: {
    paymentId: string;
  }) => {
    const payment = await Payment.findById(paymentId);
    await Payment.findByIdAndDelete(paymentId);

    await Order.findByIdAndUpdate(payment.order, {
      $inc: {
        amountPaid: -parseFloat(payment.amount),
      },
    }).exec();

    await Customer.findOneAndUpdate(
      { _id: payment.customer },
      {
        $inc: {
          balance: -parseFloat(payment.amount),
        },
      }
    );

    return payment;
  };

  public editOperatorTransaction = async ({
    id,
    transactionType,
    amount,
    description,
  }: {
    id: string;
    amount: string;
    transactionType: string;
    description: string;
  }) => {
    const payment = await Payment.findById(id);

    await Operator.findOneAndUpdate(
      { _id: payment.operator },
      {
        $inc: {
          balance: parseFloat(payment.amount),
        },
      }
    );

    await Operator.findOneAndUpdate(
      { _id: payment.operator },
      {
        $inc: {
          balance: -parseFloat(amount),
        },
      }
    );

    await Payment.findByIdAndUpdate(
      id,
      {
        amount,
        description,
        transactionType,
      },
      {
        new: true,
      }
    ).exec();

    return payment;
  };

  public deleteOperatorTransaction = async (id: string) => {
    const payment = await Payment.findById(id);

    await Operator.findOneAndUpdate(
      { _id: payment.operator },
      {
        $inc: {
          balance: parseFloat(payment.amount),
        },
      }
    );

    await Payment.findByIdAndDelete(id);
    return payment;
  };
}
