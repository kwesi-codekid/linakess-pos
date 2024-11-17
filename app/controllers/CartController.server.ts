import {
  createCookieSessionStorage,
  json,
  redirect,
  type SessionStorage,
} from "@remix-run/node";
import { commitSession, getSession } from "~/session";
import { Cart } from "../models/Cart";
import AdminController from "./AdminController.server";
import { ServiceCart } from "~/models/ServiceCart";

export default class CartController {
  private request: Request;

  /**
   * Initialize a CartController instance
   * @param request This Fetch API interface represents a resource request.
   * @returns this
   */
  constructor(request: Request) {
    this.request = request;
  }

  public addToCart = async ({ product }: { product: string }) => {
    const session = await getSession(this.request.headers.get("Cookie"));
    const employeeAuth = await new AdminController(this.request);
    const adminId = await employeeAuth.getAdminId();

    const existingCart = await Cart.findOne({
      user: adminId,
      product,
    });

    if (existingCart) {
      Cart.findByIdAndUpdate(existingCart._id, {
        $inc: { quantity: 1 },
      }).exec();
    } else {
      const cart = await Cart.create({
        user: adminId,
        product,
        quantity: 1,
      });

      if (!cart) {
        session.flash("message", {
          title: "Error adding product to cart",
          status: "error",
        });
        return redirect("/pos", {
          headers: {
            "Set-Cookie": await commitSession(session),
          },
        });
      }
    }

    session.flash("message", {
      title: "Product Added to Cart",
      status: "success",
    });
    return redirect("/pos", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  };

  public getUserCart = async ({ user }: { user: string }) => {
    try {
      const cartItems = await Cart.find({ user })
        .populate({
          path: "product",
          populate: [
            // { path: "images", model: "images" },
            { path: "category", model: "categories" },
            // { path: "stockHistory", model: "stocks" },
          ],
        })
        .exec();

      const serviceItems = await ServiceCart.find({ user })
        .populate({
          path: "service",
          // populate: [
          // { path: "images", model: "images" },
          // { path: "category", model: "categories" },
          // { path: "stockHistory", model: "stocks" },
          // ],
        })
        .exec();

      return { cartItems, serviceItems };
    } catch (error) {
      console.error("Error retrieving carts:", error);
    }
  };

  public changeQuantity = async ({
    product,
    quantity,
  }: {
    product: string;
    quantity: string;
  }) => {
    const adminAuth = await new AdminController(this.request);
    const adminId = await adminAuth.getAdminId();

    try {
      await Cart.findOneAndUpdate(
        { product, user: adminId },
        {
          quantity,
        }
      ).exec();
      return true;
      return redirect("/pos");
    } catch (error) {
      console.error("Error decreasing item:", error);
      return json(
        {
          error: "Error creating cart",
          fields: {},
        },
        { status: 400 }
      );
    }
  };

  public changeServiceQuantity = async ({
    service,
    quantity,
  }: {
    service: string;
    quantity: string;
  }) => {
    const adminAuth = await new AdminController(this.request);
    const adminId = await adminAuth.getAdminId();

    try {
      await ServiceCart.findOneAndUpdate(
        { service, user: adminId },
        {
          quantity,
        }
      ).exec();

      return true;
      // return redirect("/pos/services");
    } catch (error) {
      console.error("Error decreasing item:", error);
      return json(
        {
          error: "Error creating cart",
          fields: {},
        },
        { status: 400 }
      );
    }
  };

  public increaseItem = async ({ product }: { product: string }) => {
    const adminAuth = await new AdminController(this.request);
    const adminId = await adminAuth.getAdminId();

    try {
      await Cart.findOneAndUpdate(
        { product, user: adminId },
        {
          $inc: { quantity: 1 }, // Increase the quantity by 1
        }
      ).exec();

      return true;
      return redirect("/pos");
    } catch (error) {
      console.error("Error decreasing item:", error);
      return json(
        {
          error: "Error creating cart",
          fields: {},
        },
        { status: 400 }
      );
    }
  };

  public increaseServiceItem = async ({ service }: { service: string }) => {
    const adminAuth = await new AdminController(this.request);
    const adminId = await adminAuth.getAdminId();

    try {
      await ServiceCart.findOneAndUpdate(
        { service, user: adminId },
        {
          $inc: { quantity: 1 }, // Increase the quantity by 1
        }
      ).exec();

      // return true;
      return true;
    } catch (error) {
      console.error("Error decreasing item:", error);
      return json(
        {
          error: "Error creating cart",
          fields: {},
        },
        { status: 400 }
      );
    }
  };

  public setStock = async ({
    product,
    stock,
  }: {
    product: string;
    stock: string;
  }) => {
    const employeeAuth = await new EmployeeAuthController(this.request);
    const cashier = await employeeAuth.getEmployeeId();

    try {
      await Cart.findOneAndUpdate(
        { product, employee: cashier },
        {
          stock,
        }
      ).exec();

      return redirect(`/pos`, 200);
    } catch (error) {
      console.error("Error decreasing item:", error);
      return json(
        {
          error: "Error creating cart",
          fields: {},
        },
        { status: 400 }
      );
    }
  };

  /**
   * Delete a record from the cart
   * @param param0 id
   * @returns null
   */
  public decreaseItem = async ({ product }: { product: string }) => {
    const adminAuth = await new AdminController(this.request);
    const adminId = await adminAuth.getAdminId();

    try {
      await Cart.findOneAndUpdate(
        { product, user: adminId },
        {
          $inc: { quantity: -1 }, // Decrease the quantity by 1
        }
      ).exec();
      return true;

      return redirect("/pos");
    } catch (error) {
      console.error("Error decreasing item:", error);
      // Handle the error appropriately
    }
  };

  public decreaseServiceItem = async ({ service }: { service: string }) => {
    const adminAuth = await new AdminController(this.request);
    const adminId = await adminAuth.getAdminId();

    try {
      await ServiceCart.findOneAndUpdate(
        { service, user: adminId },
        {
          $inc: { quantity: -1 }, // Decrease the quantity by 1
        }
      ).exec();
      return true;

      return redirect("/pos");
    } catch (error) {
      console.error("Error decreasing item:", error);
      // Handle the error appropriately
    }
  };

  /**
   * Delete an item from the cart
   * @param id String
   * @returns null
   */
  public removeFromCart = async ({ product }: { product: string }) => {
    const session = await getSession(this.request.headers.get("Cookie"));
    const employeeAuth = await new AdminController(this.request);
    const adminId = await employeeAuth.getAdminId();

    try {
      await Cart.findOneAndDelete({ user: adminId, product });
      session.flash("message", {
        title: "Product removed from cart",
        status: "success",
      });
      return redirect("/pos", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    } catch (err) {
      console.log(err);
      session.flash("message", {
        title: "Error deleting product from cart",
        status: "error",
      });
      return redirect("/pos", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
  };

  public removServiceFromCart = async ({ service }: { service: string }) => {
    const session = await getSession(this.request.headers.get("Cookie"));
    const employeeAuth = await new AdminController(this.request);
    const adminId = await employeeAuth.getAdminId();

    try {
      await ServiceCart.findOneAndDelete({ user: adminId, service });

      return true;
      // session.flash("message", {
      //   title: "Product removed from cart",
      //   status: "success",
      // });
      // return redirect("/pos", {
      //   headers: {
      //     "Set-Cookie": await commitSession(session),
      //   },
      // });
    } catch (err) {
      console.log(err);
      session.flash("message", {
        title: "Error deleting service from cart",
        status: "error",
      });
      return redirect("/pos", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
  };

  public clearCart = async () => {
    const session = await getSession(this.request.headers.get("Cookie"));
    const employeeAuth = await new AdminController(this.request);
    const adminId = await employeeAuth.getAdminId();
    try {
      await Cart.deleteMany({ user: adminId });
      session.flash("message", {
        title: "Products removed from cart",
        status: "success",
      });
      return redirect("/pos", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    } catch (err) {
      console.log(err);
      session.flash("message", {
        title: "Error deleting product from cart",
        status: "error",
      });
      return redirect("/pos", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
  };

  public addInscription = async ({
    inscription,
    id,
  }: {
    inscription: string;
    id: string;
  }) => {
    try {
      await Cart.findByIdAndUpdate(id, {
        inscription,
      }).exec();

      return redirect(`/cart`, 200);
    } catch (error) {
      console.error("Error decreasing item:", error);
      return json(
        {
          error: "Error creating cart",
          fields: {},
        },
        { status: 400 }
      );
    }
  };

  // -----------------------------------
  public addServiceToCart = async ({ service }: { service: string }) => {
    const session = await getSession(this.request.headers.get("Cookie"));
    const employeeAuth = await new AdminController(this.request);
    const adminId = await employeeAuth.getAdminId();

    const existingCart = await ServiceCart.findOne({
      user: adminId,
      service,
    });

    if (existingCart) {
      ServiceCart.findByIdAndUpdate(existingCart._id, {
        $inc: { quantity: 1 },
      }).exec();
    } else {
      const cart = await ServiceCart.create({
        user: adminId,
        service,
        quantity: 1,
      });

      if (!cart) {
        session.flash("message", {
          title: "Error adding service to cart",
          status: "error",
        });
        return redirect("/pos/services", {
          headers: {
            "Set-Cookie": await commitSession(session),
          },
        });
      }
    }

    session.flash("message", {
      title: "service Added to Cart",
      status: "success",
    });
    return redirect("/pos/services", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  };

  public clearServiceCart = async () => {
    const session = await getSession(this.request.headers.get("Cookie"));
    const employeeAuth = await new AdminController(this.request);
    const adminId = await employeeAuth.getAdminId();
    try {
      await ServiceCart.deleteMany({ user: adminId });

      return true;
      session.flash("message", {
        title: "service removed from cart",
        status: "success",
      });
      return redirect("/pos", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    } catch (err) {
      console.log(err);
      session.flash("message", {
        title: "Error deleting product from cart",
        status: "error",
      });
      return redirect("/pos", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
  };
}
