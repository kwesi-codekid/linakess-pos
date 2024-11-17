import {
  json,
  createCookieSessionStorage,
  redirect,
  type SessionStorage,
} from "@remix-run/node";
import bcrypt from "bcryptjs";
import { Admin } from "../models/Admin";
import { commitSession, getSession } from "~/session";

export default class AdminController {
  private request: Request;
  private storage: SessionStorage;

  /**
   * Initialize a AdminController instance
   * @param request This Fetch API interface represents a resource request.
   * @returns this
   */
  constructor(request: Request) {
    this.request = request;

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

  private async createAdminSession(adminId: string, redirectTo: string) {
    const session = await this.storage.getSession();
    session.set("adminId", adminId);

    return redirect(redirectTo, {
      headers: {
        "Set-Cookie": await this.storage.commitSession(session),
      },
    });
  }

  private async getAdminSession() {
    return this.storage.getSession(this.request.headers.get("Cookie"));
  }

  /**
   * Get the current logged in user's Id
   * @returns admin_id :string
   */
  public async getAdminId() {
    const session = await this.getAdminSession();
    const adminId = session.get("adminId");
    if (!adminId || typeof adminId !== "string") {
      return null;
    }
    return adminId;
  }

  public async getAdmin() {
    const adminId = await this.getAdminId();
    if (typeof adminId !== "string") {
      return null;
    }

    try {
      const admin = await Admin.findById(adminId).select("-password");
      return admin;
    } catch {
      throw this.logout();
    }
  }

  public async loginAdmin({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    const session = await getSession(this.request.headers.get("Cookie"));

    const admin = await Admin.findOne({ email });

    // const hashedPassword = await bcrypt.hash(password, 10);
    // console.log(hashedPassword);

    if (!admin) {
      session.flash("message", {
        title: "Invalid Credentials",
        status: "error",
      });
      return redirect(`/login`, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      session.flash("message", {
        title: "Invalid Credentials",
        status: "error",
      });
      return redirect(`/login`, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    return this.createAdminSession(admin._id, "/");
  }

  public async logout() {
    const session = await this.getAdminSession();

    return redirect("/login", {
      headers: {
        "Set-Cookie": await this.storage.destroySession(session),
      },
    });
  }

  public async requireAdminId(
    redirectTo: string = new URL(this.request.url).pathname
  ) {
    const session = await this.getAdminSession();

    const adminId = session.get("adminId");
    if (!adminId || typeof adminId !== "string") {
      const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
      throw redirect(`/login?${searchParams}`);
    }

    return adminId;
  }

  public getAdmins = async ({
    page,
    search_term,
  }: {
    page: number;
    search_term: string;
  }) => {
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

    const totalEmployeeCount = await Admin.countDocuments({}).exec();
    const totalPages = Math.ceil(totalEmployeeCount / limit);

    try {
      const admins = await Admin.find(searchFilter)
        .skip(skipCount)
        .limit(limit)
        .exec();

      return { admins, totalPages };
    } catch (error) {
      console.error("Error retrieving admins:", error);
    }
  };
}

// export const changePassword = async (
//   adminId: string,
//   password: string,
//   request: Request
// ) => {
//   let domain = (request.headers.get("host") as string).split(":")[0];

//   const Admin = clientDb.model("admins", AdminSchema);

//   const hashedPassword = await bcrypt.hash(password, 10);

//   let admin = await Admin.updateOne(
//     { _id: adminId },
//     { password: hashedPassword },
//     { new: true }
//   );

//   return admin;
// };

// export const requirePermission = async ({
//   request,
//   action,
// }: {
//   request: Request;
//   action: string;
// }) => {
//   let domain = (request.headers.get("host") as string).split(":")[0];
//   const Admin = clientDb.model("admins", AdminSchema);

//   const adminId = await requireAdminId(request);

//   if (typeof adminId !== "string") {
//     return null;
//   }

//   try {
//     const admin: AdminInterface = await Admin.findById(adminId).select(
//       "id email username role permissions"
//     );

//     // filter permissions to check if there is any match for the action
//     const hasPermission = admin.permissions.filter((permission) => {
//       return permission.action === action;
//     });

//     if (hasPermission.length === 0) {
//       return json(
//         {
//           message: `Unauthorized: You can not perform ${action}`,
//           type: "error",
//         },
//         { status: 401 }
//       );
//     }

//     return admin;
//   } catch {
//     throw logout(request);
//   }
// };
