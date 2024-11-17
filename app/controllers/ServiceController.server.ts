import { redirect } from "@remix-run/node";
import { Service } from "../models/Service";
import { commitSession, getSession } from "~/session";

export default class ServiceController {
  private request: Request;

  /**
   * Initialize a ServiceController instance
   * @param request This Fetch API interface represents a resource request.
   * @returns this
   */
  constructor(request: Request) {
    this.request = request;
  }

  public async getServices({
    page,
    search_term,
  }: {
    page: number;
    search_term: string;
  }) {
    const limit = 20; // Number of orders per page
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
      const services = await Service.find(searchFilter)
        // .skip(skipCount)
        // .limit(limit)
        .exec();

      const totalCount = await Service.countDocuments(searchFilter).exec();
      const totalPages = Math.ceil(totalCount / limit);

      return { services, totalPages };
    } catch (error) {
      console.error("Error retrieving services:", error);
    }
  }

  public async createService({
    name,
    price,
    description,
  }: {
    name: string;
    price: string;
    description: string;
  }) {
    const session = await getSession(this.request.headers.get("Cookie"));

    const existingService = await Service.findOne({ name });

    if (existingService) {
      session.flash("message", {
        title: "Service already exists",
        status: "error",
      });
      return redirect(`/services`, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    const customer = await Service.create({
      name,
      price: Number(price),
      description,
    });

    if (!customer) {
      session.flash("message", {
        title: "Error Adding Service",
        status: "error",
      });
      return redirect(`/services`, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    return customer;
    // session.flash("message", {
    //   title: "Service Added Successful",
    //   status: "success",
    // });
    // return redirect(`/services`, {
    //   headers: {
    //     "Set-Cookie": await commitSession(session),
    //   },
    // });
  }

  public async updateService({
    id,
    name,
    price,
    description,
  }: {
    id: string;
    name: string;
    price: string;
    description: string;
  }) {
    const session = await getSession(this.request.headers.get("Cookie"));

    try {
      const updated = await Service.findByIdAndUpdate(
        id,
        {
          name,
          price: Number(price),
          description,
        },
        {
          new: true,
        }
      );

      return updated;
      // session.flash("message", {
      //   title: "Service Updated Successful",
      //   status: "success",
      // });
      // return redirect(`/services`, {
      //   headers: {
      //     "Set-Cookie": await commitSession(session),
      //   },
      // });
    } catch (error) {
      session.flash("message", {
        title: "Error Updating Service",
        status: "error",
      });
      return redirect(`/services`, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
  }

  public deleteService = async (id: string) => {
    const session = await getSession(this.request.headers.get("Cookie"));

    try {
      await Service.findByIdAndDelete(id);

      return true;
      session.flash("message", {
        title: "Service Deleted Successful",
        status: "success",
      });
      return redirect(`/services`, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    } catch (err) {
      console.log(err);
      session.flash("message", {
        title: "Error Deleting Service",
        status: "error",
      });
      return redirect(`/services`, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
  };
}
