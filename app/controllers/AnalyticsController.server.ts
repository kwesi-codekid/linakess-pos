/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Dashboard and Reporting Analytics Controller

import { redirect, json } from "@remix-run/node";
import moment from "moment";
import { commitSession, getSession } from "~/session";
import AdminController from "./AdminController.server";
import { Order } from "~/models/Order";
import { Payment } from "~/models/PaymentDetails";
import { Product } from "~/models/Product";
import { Customer } from "~/models/Customer";
import { RestockHistory } from "~/models/RestockHistory";
import { PaymentInterface, RestockHistoryInterface } from "~/types";
import Operator from "~/models/Operator";
import OperatorController from "./OperatorController.server";
import mongoose from "mongoose";

export default class AnalyticsController {
  private request: Request;

  /**
   * Initialize a OrderController instance
   * @param request This Fetch API interface represents a resource request.
   * @returns this
   */
  constructor(request: Request) {
    this.request = request;
  }

  async getDashboardData() {
    const orders = await Order.find();
    const payments = await Payment.find();
    const products = await Product.find();
    const customers = await Customer.find();
    const operators = await Operator.find();

    const totalSales = orders.reduce((acc, order) => {
      return acc + order.totalPrice;
    }, 0);

    const totalPayments = payments.reduce(
      (acc: any, payment: PaymentInterface) => {
        const month = moment(payment.createdAt).format("MMM");
        if (acc[month]) {
          acc[month] += payment.amount;
        } else {
          acc[month] = payment.amount;
        }
        return acc;
      },
      {}
    );

    const totalProducts = products.length;

    const totalCustomers = customers.length;
    const totalOperators = operators.length;

    const data = {
      totalSales,
      totalPayments,
      totalProducts,
      totalCustomers,
      totalOperators,
    };

    return data;
  }

  async getMonthlySalesData() {
    const orders = await Order.find();

    // get the months
    const months = orders.reduce((acc, order) => {
      const month = moment(order.createdAt).format("MMM");
      if (!acc.includes(month)) {
        acc.push(month);
      }
      return acc;
    }, []);

    // get the sales for each month
    const sales = orders.reduce((acc, order) => {
      const month = moment(order.createdAt).format("MMM");
      if (acc[month]) {
        acc[month] += order.totalPrice;
      } else {
        acc[month] = order.totalPrice;
      }
      return acc;
    }, {});

    // get the payments for each month
    const payments = await Payment.find();
    const paymentData = payments.reduce((acc, payment: PaymentInterface) => {
      const month = moment(payment.createdAt).format("MMM");
      if (acc[month]) {
        acc[month] += payment.amount;
      } else {
        acc[month] = payment.amount;
      }
      return acc;
    }, {});

    return { months, sales, payments: paymentData };
  }

  async getSalesData() {
    const orders = await Order.find();
    const salesData = orders.reduce((acc, order) => {
      const date = moment(order.createdAt).format("MMM DD, YYYY");
      if (acc[date]) {
        acc[date] += order.totalPrice;
      } else {
        acc[date] = order.totalPrice;
      }
      return acc;
    }, {});

    return json(salesData);
  }

  async getRestockData() {
    const restocks = await RestockHistory.find();
    const restockData = restocks.reduce((acc, restock) => {
      const date = moment(restock.createdAt).format("MMM DD, YYYY");
      if (acc[date]) {
        acc[date] += restock.amount;
      } else {
        acc[date] = restock.amount;
      }
      return acc;
    }, {});

    return json(restockData);
  }

  /**
   * Get the analytics data for the operators
   * @returns The analytics data for the operators
   */
  public async getOperatorReport({
    operatorId,
    reportType,
  }: {
    operatorId: string;
    reportType: string;
  }) {
    if (reportType === "stock") {
      const operatorStock = await RestockHistory.find({
        operator: operatorId,
      }).populate("product");

      const totalStock = operatorStock.reduce((acc, stock) => {
        return acc + stock.totalQuantity;
      }, 0);

      const totalCommission = operatorStock.reduce((acc, stock) => {
        return acc + stock.commission;
      }, 0);

      const totalProductsPayable = operatorStock.reduce(
        (acc, stock: RestockHistoryInterface) => {
          return acc + stock.quantityPayable;
        },
        0
      );

      const totalAmountPayable = operatorStock.reduce((acc, stock) => {
        return acc + stock.amountPayable;
      }, 0);

      return {
        data: operatorStock,
        totalProducts: totalStock,
        totalCommission,
        totalProductsPayable,
        totalAmountPayable,
        reportType: "stock",
      };
    } else if (reportType === "finance") {
      const operatorPayments = await Payment.find({
        operator: operatorId,
      });

      // amount payable
      const operatorStock = await RestockHistory.find({
        operator: operatorId,
      }).populate("product");
      const totalAmountPayable = operatorStock.reduce((acc, stock) => {
        return acc + stock.amountPayable;
      }, 0);

      // balance
      const operator = await Operator.find({
        _id: operatorId,
      });
      const totalBalance = operator[0].balance;

      const operatorLoans = await Payment.find({
        operator: operatorId,
        transactionType: "loan",
      });
      const totalLoans = operatorLoans.reduce((acc, payment) => {
        return acc + payment.amount;
      }, 0);

      const operatorPayouts = await Payment.find({
        operator: operatorId,
        transactionType: "payout",
      });
      const totalPayouts = operatorPayouts.reduce((acc, payment) => {
        return acc + payment.amount;
      }, 0);

      return {
        data: operatorPayments,
        loans: totalLoans,
        payouts: totalPayouts,
        totalAmountPayable,
        totalBalance,
        reportType: "finance",
      };
    }
  }

  /**
   * Get the analytics data for the customers
   * @returns The analytics data for the customers
   */
  public async getCustomerReport({
    customer,
    reportType,
  }: {
    customer: string;
    reportType: string;
  }) {
    switch (reportType) {
      case "overall":
        if (customer === "all-customers") {
          const allCustomerData = await Order.find()
            .populate("customer")
            .populate("user")
            .populate("orderItems.product")
            .exec();
          return allCustomerData;
        } else if (customer !== "all-customers") {
          const customerData = Order.find({
            customer: customer,
          });
          return customerData;
        }
        break;

      case "sales":
        if (customer === "all-customers") {
          const allCustomerData = await Order.find({
            orderType: "sale",
          })
            .populate("customer")
            .populate("user")
            .populate("orderItems.product")
            .exec();
          return allCustomerData;
        } else if (customer !== "all-customers") {
          const customerData = Order.find({
            customer: customer,
            orderType: "sale",
          })
            .populate("customer")
            .populate("user")
            .populate("orderItems.product")
            .exec();
          return customerData;
        }
        break;
      case "orders":
        if (customer === "all-customers") {
          const allCustomerData = await Order.find({
            orderType: "order",
          })
            .populate("customer")
            .populate("user")
            .populate("orderItems.product")
            .exec();
          return allCustomerData;
        } else if (customer !== "all-customers") {
          const customerData = Order.find({
            customer: customer,
            orderType: "order",
          })
            .populate("customer")
            .populate("user")
            .populate("orderItems.product")
            .populate("orderServiceItems.service")
            .exec();
          return customerData;
        }
        break;

      default:
        return undefined;
        break;
    }
  }

  public getTopCustomers = async () => {
    try {
      const topCustomers = await Order.aggregate([
        {
          $group: {
            _id: "$customer",
            totalSpent: { $sum: "$totalPrice" },
          },
        },
        {
          $lookup: {
            from: "customers",
            localField: "_id",
            foreignField: "_id",
            as: "customerInfo",
          },
        },
        {
          $unwind: "$customerInfo",
        },
        {
          $sort: { totalSpent: -1 },
        },
        {
          $limit: 10,
        },
        {
          $project: {
            _id: 0,
            customerId: "$_id",
            fullName: "$customerInfo.fullName",
            email: "$customerInfo.email",
            phone: "$customerInfo.phone",
            totalSpent: 1,
          },
        },
      ]);

      return topCustomers;
    } catch (err) {
      console.error(err);
    }
  };

  public getSalesReport = async ({
    employee,
    date,
    type,
  }: {
    employee: string;
    date: string;
    type: string;
  }) => {
    switch (type) {
      case "order":
        const itemsSolds = await this.getItemsSoldByUserOnDay(
          employee,
          date,
          type
        );
        return itemsSolds;
      case "sale":
        const itemsSold = await this.getItemsSoldByUserOnDay(
          employee,
          date,
          type
        );
        return itemsSold;
      default:
        break;
    }
  };

  private getItemsSoldByUserOnDay = async (userId, date, type) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      const orders = await Order.find({
        user: new mongoose.Types.ObjectId(userId),
        orderType: type,
        deliveryDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      }).populate("orderItems.product orderServiceItems.service");

      // Extracting items from orders
      const items = orders.reduce((acc, order) => {
        acc.push(...order.orderItems, ...order.orderServiceItems);
        return acc;
      }, []);

      const rawOrderItems = orders.reduce((acc, order) => {
        acc.push(...order.items);
        return acc;
      }, []);

      // Calculating total quantity of items sold
      let totalItems = 0;
      let totalProfit = 0;
      let totalOrdersAmount = null;
      let totalSalesAmount = null;

      orders.forEach((order) => {
        order?.orderItems.forEach((item) => {
          totalItems += item?.quantity;
        });

        order?.orderServiceItems.forEach((item) => {
          totalItems += item?.quantity;
        });

        totalSalesAmount += order?.totalPrice;
        totalOrdersAmount += order?.totalPrice;

        order?.orderItems.forEach((item) => {
          totalProfit +=
            (item?.sellingPrice - item?.costPrice) * item?.quantity;
        });
        order?.orderServiceItems.forEach((item) => {
          totalProfit +=
            (item?.sellingPrice - item?.costPrice) * item?.quantity;
        });
      });

      const ress = {
        items: orders,
        totalItems,
        rawOrderItems,
        totalProfit,
        totalSalesAmount,
        grandTotal: totalSalesAmount + totalOrdersAmount,
        totalOrdersAmount,
      };

      return ress;
    } catch (error) {
      console.error(
        "Error retrieving items sold by user on a specific day:",
        error
      );
      throw error;
    }
  };

  public async getCompletedOrders({
    search_term,
    status,
    from,
    to,
  }: {
    search_term?: string;
    status?: string;
    from?: string;
    to?: string;
  }) {
    const fromDate = from ? new Date(from) : new Date();
    fromDate.setHours(0, 0, 0, 0);
    const toDate = to ? new Date(to) : new Date();
    toDate.setHours(23, 59, 59, 999);

    const searchFilter = search_term
      ? {
          $or: [
            { orderId: { $regex: search_term, $options: "i" } },
            { deliveryStatus: { $regex: status, $options: "i" } },
          ],
        }
      : {};

    if (from && to) {
      searchFilter.createdAt = {
        $gte: fromDate,
        $lte: toDate,
      };
    }

    const orders = await Order.find({
      onCredit: false,
      orderType: "order",
      status: "completed",
      ...searchFilter,
    })
      // .skip(skipCount)
      // .limit(limit)
      .populate("customer")
      .populate({
        path: "orderServiceItems.service",
      })
      .populate({
        path: "orderItems.product",
      })
      .populate("user")
      .sort({ createdAt: "desc" })
      .exec();

    return orders;
  }

  public async getPendingOrders({
    search_term,
    status,
    from,
    to,
  }: {
    search_term?: string;
    status?: string;
    from?: string;
    to?: string;
  }) {
    const fromDate = from ? new Date(from) : new Date();
    fromDate.setHours(0, 0, 0, 0);
    const toDate = to ? new Date(to) : new Date();
    toDate.setHours(23, 59, 59, 999);

    const searchFilter = search_term
      ? {
          $or: [
            { orderId: { $regex: search_term, $options: "i" } },
            { deliveryStatus: { $regex: status, $options: "i" } },
          ],
        }
      : {};

    if (from && to) {
      searchFilter.createdAt = {
        $gte: fromDate,
        $lte: toDate,
      };
    }

    const orders = await Order.find({
      onCredit: false,
      orderType: "order",
      status: "pending",
      ...searchFilter,
    })
      // .skip(skipCount)
      // .limit(limit)
      .populate("customer")
      .populate({
        path: "orderServiceItems.service",
      })
      .populate({
        path: "orderItems.product",
      })
      .populate("user")
      .sort({ createdAt: "desc" })
      .exec();

    return orders;
  }

  public getStockHistory = async ({
    date,
    reorderPoint,
    type,
    fastMovinngThreshold = 100,
    slowMovinngThreshold = 10,
  }: {
    date?: string;
    reorderPoint?: number;
    type?: string;
    fastMovinngThreshold?: number;
    slowMovinngThreshold?: number;
  }) => {
    switch (type) {
      case "restocks":
        const allRestocks = await this.additionalStock(date);
        return allRestocks;
      case "belowPoint":
        const productBelowReorderPoint =
          await this.getProductsBelowReorderPoint(reorderPoint);
        return productBelowReorderPoint;
      case "currentStock":
        const currentStock = await Product.find();
        return currentStock;
      default:
        const fastMoving = await this.getFastMovingStock(fastMovinngThreshold);
        const slowMoving = await this.getSlowMovingStock(slowMovinngThreshold);
        const highProfitStocks = await this.getTop10HighProfitStocks();
        return {
          fastMoving,
          slowMoving,
          highProfitStocks,
        };
    }
  };

  private additionalStock = async (date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const allRestocks = await RestockHistory.find({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate("product")
      .populate("operator");

    return allRestocks;
  };

  private getProductsBelowReorderPoint = async (reorderPoint) => {
    try {
      const products = await Product.find({
        $or: [
          { stockAtHome: { $lt: reorderPoint } },
          { stockAtShop: { $lt: reorderPoint } },
        ],
      });

      return products;
    } catch (error) {
      console.error("Error retrieving products below reorder point:", error);
      throw error;
    }
  };

  private getFastMovingStock = async (fastMovinngThreshold) => {
    try {
      const fastMovingProducts = await Product.find({
        quantitySold: { $gt: fastMovinngThreshold },
      });

      return fastMovingProducts;
    } catch (error) {
      console.error("Error retrieving fast-moving stock:", error);
      throw error;
    }
  };

  private getSlowMovingStock = async (slowMovinngThreshold) => {
    try {
      const slowMovingProducts = await Product.find({
        quantitySold: { $lt: slowMovinngThreshold },
      });

      return slowMovingProducts;
    } catch (error) {
      console.error("Error retrieving slow-moving stock:", error);
      throw error;
    }
  };

  private getTop10HighProfitStocks = async () => {
    try {
      const products = await Product.aggregate([
        {
          $project: {
            name: 1,
            description: 1,
            price: 1,
            costPrice: 1,
            quantitySold: 1,
            profit: {
              $multiply: [
                { $subtract: ["$price", "$costPrice"] },
                "$quantitySold",
              ],
            },
          },
        },
        {
          $sort: { profit: -1 },
        },
        {
          $limit: 10,
        },
      ]);

      return products;
    } catch (error) {
      console.error("Error retrieving top 10 high profit stocks:", error);
      throw error;
    }
  };

  public getOwingReport = async () => {
    const customersOwing = await Customer.find({ balance: { $lt: 0 } }).exec();

    const result = await Order.aggregate([
      {
        $match: {
          orderType: "sale",
          balance: { $lt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          totalOwing: { $sum: "$balance" },
        },
      },
    ]);
    const totalOwingFromSales = result[0]?.totalOwing || 0;

    const resultTwo = await Order.aggregate([
      {
        $match: {
          orderType: "order",
          balance: { $lt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          totalOwing: { $sum: "$balance" },
        },
      },
    ]);

    console.log(resultTwo);

    const totalOwingFromOrders = resultTwo[0]?.totalOwing || 0;

    const grandTotal = totalOwingFromOrders + totalOwingFromSales;

    return {
      customersOwing,
      totalOwingFromSales,
      totalOwingFromOrders,
      grandTotal,
    };
  };

  public getFinancialReport = async () => {
    const totalCostPriceForIndividualProduct =
      await this.getTotalCostPriceForIndividualProduct();

    const grandTotalForAllProducts = await this.getGrandTotalForAllProducts();

    const totalProfitForIndividualProduct =
      await this.getTotalProfitForIndividualProduct();

    const totalProfitAmount = await this.getTotalProfitAmount();

    const totalOwingAmount = await this.getTotalOwingAmount();

    const totalRepayments = await this.getTotalRepayments();
    return {
      totalCostPriceForIndividualProduct,
      grandTotalForAllProducts,
      totalProfitForIndividualProduct,
      totalProfitAmount,
      totalOwingAmount,
      totalRepayments,
    };
  };

  private getTotalCostPriceForIndividualProduct = async () => {
    try {
      const result = await Order.aggregate([
        { $unwind: "$orderItems" },
        {
          $group: {
            _id: "$orderItems.product",
            totalCostPrice: { $sum: "$orderItems.costPrice" },
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        { $unwind: "$productDetails" },
        {
          $project: {
            productName: "$productDetails.name",
            totalCostPrice: 1,
          },
        },
      ]);
      return result;
    } catch (error) {
      console.error(
        "Error calculating total cost price for individual product:",
        error
      );
      throw error;
    }
  };

  private getGrandTotalForAllProducts = async () => {
    try {
      const result = await Order.aggregate([
        { $unwind: "$orderItems" },
        {
          $group: {
            _id: null,
            grandTotal: {
              $sum: {
                $multiply: ["$orderItems.sellingPrice", "$orderItems.quantity"],
              },
            },
          },
        },
      ]);
      return result.length ? result[0].grandTotal : 0;
    } catch (error) {
      console.error("Error calculating grand total for all products:", error);
      throw error;
    }
  };

  private getTotalProfitForIndividualProduct = async () => {
    try {
      const result = await Order.aggregate([
        { $unwind: "$orderItems" },
        {
          $group: {
            _id: "$orderItems.product",
            totalProfit: {
              $sum: {
                $multiply: [
                  {
                    $subtract: [
                      "$orderItems.sellingPrice",
                      "$orderItems.costPrice",
                    ],
                  },
                  "$orderItems.quantity",
                ],
              },
            },
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        { $unwind: "$productDetails" },
        {
          $project: {
            productName: "$productDetails.name",
            totalProfit: 1,
          },
        },
      ]);
      return result;
    } catch (error) {
      console.error(
        "Error calculating total profit for individual product:",
        error
      );
      throw error;
    }
  };

  private getTotalProfitAmount = async () => {
    try {
      const result = await Order.aggregate([
        { $unwind: "$orderItems" },
        {
          $group: {
            _id: null,
            totalProfit: {
              $sum: {
                $multiply: [
                  {
                    $subtract: [
                      "$orderItems.sellingPrice",
                      "$orderItems.costPrice",
                    ],
                  },
                  "$orderItems.quantity",
                ],
              },
            },
          },
        },
      ]);
      return result.length ? result[0].totalProfit : 0;
    } catch (error) {
      console.error("Error calculating total profit amount:", error);
      throw error;
    }
  };

  private getTotalOwingAmount = async () => {
    try {
      const result = await Order.aggregate([
        {
          $match: {
            balance: { $gt: 0 },
          },
        },
        {
          $group: {
            _id: null,
            totalOwing: { $sum: "$balance" },
          },
        },
      ]);
      return result.length ? result[0].totalOwing : 0;
    } catch (error) {
      console.error("Error calculating total owing amount:", error);
      throw error;
    }
  };

  private getTotalRepayments = async () => {
    try {
      const result = await Order.aggregate([
        {
          $group: {
            _id: null,
            totalRepayments: { $sum: "$amountPaid" },
          },
        },
      ]);
      return result.length ? result[0].totalRepayments : 0;
    } catch (error) {
      console.error("Error calculating total repayments:", error);
      throw error;
    }
  };
}
