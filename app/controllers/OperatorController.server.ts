import { redirect } from "@remix-run/node";
import Operator from "~/models/Operator";
import { Product } from "~/models/Product";
import { RestockHistory } from "~/models/RestockHistory";
import { commitSession, getSession } from "~/session";

export default class OperatorController {
  private request: Request;

  /**
   * Initialize a OperatorController instance
   * @param request This Fetch API interface represents a resource request.
   * @returns this
   */
  constructor(request: Request) {
    this.request = request;
  }

  public async getOperatorsx() {
    try {
      const operators = await Operator.find();
      return operators;
    } catch (error) {
      console.error("Error retrieving operators:", error);
    }
  }

  public async getOperator(_id: string) {
    try {
      const operator = await Operator.findById(_id);
      return operator;
    } catch (error) {
      console.error("Error retrieving operator:", error);
    }
  }

  public async getOperators({
    page,
    search_term,
  }: {
    page: number;
    search_term: string;
  }) {
    const limit = 10; // Number of orders per page
    const skipCount = (page - 1) * limit; // Calculate the number of documents to skip

    const searchFilter = search_term
      ? {
          $or: [
            { name: { $regex: search_term, $options: "i" } }, // Case-insensitive search for email
            { description: { $regex: search_term, $options: "i" } }, // Case-insensitive search for username
          ],
        }
      : {};

    try {
      const operators = await Operator.find(searchFilter)
        // .skip(skipCount)
        // .limit(limit)
        .exec();

      const totalCount = await Operator.countDocuments(searchFilter).exec();
      const totalPages = Math.ceil(totalCount / limit);

      return { operators, totalPages };
    } catch (error) {
      console.error("Error retrieving operators:", error);
    }
  }

  public async createOperator({
    fullName,
    email,
    phone,
  }: {
    fullName: string;
    email: string;
    phone: string;
  }) {
    const session = await getSession(this.request.headers.get("Cookie"));

    const existingCategory = await Operator.findOne({ phone });

    if (existingCategory) {
      session.flash("message", {
        title: "Operator already exists",
        status: "error",
      });
      return redirect(`/operators`, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    const customer = await Operator.create({
      fullName,
      email,
      phone,
    });

    if (!customer) {
      session.flash("message", {
        title: "Error Adding Operator",
        status: "error",
      });
      return redirect(`/operators`, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    return customer;
    // session.flash("message", {
    //   title: "Operator Added Successful",
    //   status: "success",
    // });
    // return redirect(`/operators`, {
    //   headers: {
    //     "Set-Cookie": await commitSession(session),
    //   },
    // });
  }

  public async updateOperator({
    id,
    fullName,
    email,
    phone,
  }: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  }) {
    const session = await getSession(this.request.headers.get("Cookie"));

    try {
      const updated = await Operator.findByIdAndUpdate(
        id,
        {
          fullName,
          email,
          phone,
        },
        {
          new: true,
        }
      );

      return updated;
      // session.flash("message", {
      //   title: "Operator Updated Successful",
      //   status: "success",
      // });
      // return redirect(`/operators`, {
      //   headers: {
      //     "Set-Cookie": await commitSession(session),
      //   },
      // });
    } catch (error) {
      session.flash("message", {
        title: "Error Updating Operator",
        status: "error",
      });
      return redirect(`/operators`, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
  }

  public deleteOperator = async (id: string) => {
    const session = await getSession(this.request.headers.get("Cookie"));

    try {
      await Operator.findByIdAndDelete(id);

      return true;
      session.flash("message", {
        title: "Operator Deleted Successful",
        status: "success",
      });
      return redirect(`/operators`, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    } catch (err) {
      console.log(err);
      session.flash("message", {
        title: "Error Deleting Operator",
        status: "error",
      });
      return redirect(`/operators`, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
  };

  public createStock = async ({
    operator,
    productId,
    totalQuantity,
    commission,
    unitPrice,
    amountPayable,
  }: {
    operator: string;
    productId: string;
    totalQuantity: string;
    commission: string;
    unitPrice: string;
    amountPayable: string;
  }) => {
    const stock = await RestockHistory.create({
      operator,
      product: productId,
      totalQuantity,
      commission,
      unitPrice,
      quantityPayable: parseInt(totalQuantity) - parseInt(commission),
      amountPayable:
        (parseInt(totalQuantity) - parseInt(commission)) *
        parseFloat(unitPrice),
    });

    await Product.findByIdAndUpdate(productId, {
      $inc: { stockAtShop: parseInt(totalQuantity) },
    });

    await Operator.findByIdAndUpdate(operator, {
      $inc: { balance: parseFloat(amountPayable) },
    });
    return stock;
  };

  public editStock = async ({
    id,
    productId,
    totalQuantity,
    commission,
    unitPrice,
  }: {
    id: string;
    productId: string;
    totalQuantity: string;
    commission: string;
    unitPrice: string;
    quantityPayable: string;
    amountPayable: string;
  }) => {
    const oldStock = await RestockHistory.findById(id);
    await Product.findByIdAndUpdate(oldStock?.product, {
      $inc: { stockAtShop: -oldStock?.totalQuantity },
    }).exec();

    await Product.findByIdAndUpdate(productId, {
      $inc: { stockAtShop: parseInt(totalQuantity) },
    }).exec();

    await Operator.findByIdAndUpdate(oldStock?.operator, {
      $inc: { balance: -oldStock?.amountPayable },
    }).exec();

    await Operator.findByIdAndUpdate(oldStock?.operator, {
      $inc: {
        balance:
          (parseInt(totalQuantity) - parseInt(commission)) *
          parseFloat(unitPrice),
      },
    }).exec();

    const stock = await RestockHistory.findByIdAndUpdate(
      id,
      {
        product: productId,
        totalQuantity,
        commission,
        unitPrice,
        quantityPayable: parseInt(totalQuantity) - parseInt(commission),
        amountPayable:
          (parseInt(totalQuantity) - parseInt(commission)) *
          parseFloat(unitPrice),
      },
      {
        new: true,
      }
    );

    return stock;
  };

  public deleteStock = async (id: string) => {
    const session = await getSession(this.request.headers.get("Cookie"));

    try {
      const stock = await RestockHistory.findById(id);
      const product = await Product.findById(stock?.product);
      await Product.findByIdAndUpdate(stock?.product, {
        $inc: { stockAtShop: -stock?.totalQuantity },
      });
      await Operator.findByIdAndUpdate(stock?.operator, {
        $inc: { balance: -stock?.amountPayable },
      });
      await RestockHistory.findByIdAndDelete(id);

      return true;
      // session.flash("message", {
      //   title: "Stock Deleted Successful",
      //   status: "success",
      // });
      // return redirect(`/stocks`, {
      //   headers: {
      //     "Set-Cookie": await commitSession(session),
      //   },
      // });
    } catch (err) {
      console.log(err);
      session.flash("message", {
        title: "Error Deleting Stock",
        status: "error",
      });
      return redirect(`/stocks`, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
  };

  public getOperatorStocks = async ({ operatorId }: { operatorId: string }) => {
    const payments = await RestockHistory.find({
      operator: operatorId,
    }).populate("product");
    return payments;
  };

  public getOperatorStocksApi = async ({
    operatorId,
    from,
    to,
  }: {
    operatorId: string;
    from?: string;
    to?: string;
  }) => {
    const fromDate = from ? new Date(from) : new Date();
    fromDate.setHours(0, 0, 0, 0);
    const toDate = to ? new Date(to) : new Date();
    toDate.setHours(23, 59, 59, 999);

    const payments = await RestockHistory.find({
      operator: operatorId,
      createdAt: {
        $gte: fromDate,
        $lte: toDate,
      },
    }).populate("product");
    return payments;
  };
}
