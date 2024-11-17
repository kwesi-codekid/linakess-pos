import { redirect } from "@remix-run/node";
import { Customer } from "../models/Customer";
import { commitSession, getSession } from "~/session";

export default class CustomerController {
  private request: Request;

  /**
   * Initialize a CustomerController instance
   * @param request This Fetch API interface represents a resource request.
   * @returns this
   */
  constructor(request: Request) {
    this.request = request;
  }

  public async getCustomersx() {
    try {
      const customers = await Customer.find();
      return customers;
    } catch (error) {
      console.error("Error retrieving customers:", error);
    }
  }

  public async getCustomer(id: string) {
    try {
      const customer = await Customer.findById(id);
      return customer;
    } catch (error) {
      console.error("Error retrieving customer:", error);
    }
  }

  public async getCustomers({
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
      const customers = await Customer.find(searchFilter)
        // .skip(skipCount)
        // .limit(limit)
        .exec();

      const totalCount = await Customer.countDocuments(searchFilter).exec();
      const totalPages = Math.ceil(totalCount / limit);

      return { customers, totalPages };
    } catch (error) {
      console.error("Error retrieving customers:", error);
    }
  }

  public async createCustomer({
    fullName,
    email,
    phone,
  }: {
    fullName: string;
    email: string;
    phone: string;
  }) {
    const session = await getSession(this.request.headers.get("Cookie"));

    const existingCategory = await Customer.findOne({ phone });

    if (existingCategory) {
      session.flash("message", {
        title: "Customer already exists",
        status: "error",
      });
      return redirect(`/customers`, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    const customer = await Customer.create({
      fullName,
      email,
      phone,
    });

    if (!customer) {
      session.flash("message", {
        title: "Error Adding Customer",
        status: "error",
      });
      return redirect(`/customers`, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    return customer;
    // session.flash("message", {
    //   title: "Customer Added Successful",
    //   status: "success",
    // });
    // return redirect(`/customers`, {
    //   headers: {
    //     "Set-Cookie": await commitSession(session),
    //   },
    // });
  }

  public async updateCustomer({
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
      const updated = await Customer.findByIdAndUpdate(
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
      //   title: "Customer Updated Successful",
      //   status: "success",
      // });
      // return redirect(`/customers`, {
      //   headers: {
      //     "Set-Cookie": await commitSession(session),
      //   },
      // });
    } catch (error) {
      session.flash("message", {
        title: "Error Updating Customer",
        status: "error",
      });
      return redirect(`/customers`, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
  }

  public deleteCustomer = async (id: string) => {
    const session = await getSession(this.request.headers.get("Cookie"));

    try {
      await Customer.findByIdAndDelete(id);

      return true;
      session.flash("message", {
        title: "Customer Deleted Successful",
        status: "success",
      });
      return redirect(`/customers`, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    } catch (err) {
      console.log(err);
      session.flash("message", {
        title: "Error Deleting Customer",
        status: "error",
      });
      return redirect(`/customers`, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
  };
}
