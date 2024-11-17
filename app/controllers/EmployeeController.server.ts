import { json, redirect } from "@remix-run/node";
import bcrypt from "bcryptjs";
import { Admin } from "~/models/Admin";
import { commitSession, getSession } from "~/session";

export default class EmployeeController {
  private request: Request;

  constructor(request: Request) {
    this.request = request;
  }

  public getEmployees = async ({
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
      const employees = await Admin.find(searchFilter)
        // .skip(skipCount)
        // .limit(limit)
        .exec();

      return { employees, totalPages };
    } catch (error) {
      console.error("Error retrieving employees:", error);
    }
  };

  /**
   * create an employee
   * @param param0 firstNmae
   *
   * @returns
   */
  public createEmployee = async ({
    email,
    username,
    password,
    phone,
    role,
    gender,
  }: {
    email: string;
    username?: string;
    password: string;
    role?: string;
    gender?: string;
    phone?: string;
  }) => {
    const session = await getSession(this.request.headers.get("Cookie"));
    const existingEmployee = await Admin.findOne({ username });

    if (existingEmployee) {
      return json(
        {
          errors: { name: "Admin already exists" },
          fields: { username, email },
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const employee = await Admin.create({
      username,
      email,
      password: hashedPassword,
      role,
      phone,
    });

    if (!employee) {
      session.flash("message", {
        title: "Error creating employee",
        status: "error",
      });
      return redirect(`/employees`, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    return employee;
    // session.flash("message", {
    //   title: "Admin created successfully",
    //   status: "success",
    // });
    // return redirect(`/employees`, {
    //   headers: {
    //     "Set-Cookie": await commitSession(session),
    //   },
    // });
  };

  /**
   * get a single employee
   * @param param0
   * @returns
   */
  public getEmployee = async (id: string) => {
    try {
      const employee = await Admin.findById(id);
      return employee;
    } catch (err) {
      console.log(err);
    }
  };

  /**
   * Update employee
   * @param param0
   */
  public updateEmployee = async ({
    email,
    username,
    role,
    phone,
    id,
  }: {
    email: string;
    username?: string;
    role?: string;
    phone: string;
    id: string;
  }) => {
    const session = await getSession(this.request.headers.get("Cookie"));
    const employee = await Admin.findByIdAndUpdate(
      id,
      {
        email,
        username,
        phone,
        role,
      },
      {
        new: true,
      }
    );

    return employee;
    session.flash("message", {
      title: "Admin deleted successfully",
      status: "success",
    });
    return redirect(`/console/employees`, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  };

  public deleteEmployee = async (id: string) => {
    try {
      await Admin.findByIdAndDelete(id);
      return json({ message: "Admin deleted successfully" }, { status: 200 });
    } catch (err) {
      console.log(err);
    }
  };

  public getSalesPerson = async () => {
    try {
      const employees = await Admin.find({
        role: "sales person",
      }).exec();

      return employees;
    } catch (error) {
      console.error("Error retrieving employees:", error);
    }
  };
}
