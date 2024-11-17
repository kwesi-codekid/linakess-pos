import {
  Link,
  Outlet,
  useActionData,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
// import { Table, Button, Form, Input, Select } from "antd";
// import { useEffect, useState } from "react";
import AdminLayout from "~/layouts/adminLayout";
import AdminController from "~/controllers/AdminController.server";
import EmployeeController from "~/controllers/EmployeeController.server";
import { AdminInterface } from "~/types";

const reportLinks = [
  {
    name: "Sales",
    url: "/reports",
  },
  {
    name: "Orders",
    url: "/reports/orders",
  },
  {
    name: "Owings",
    url: "/reports/owings",
  },
  {
    name: "Financial",
    url: "/reports/financial",
  },
  {
    name: "Stock",
    url: "/reports/stock",
  },
  {
    name: "Customers",
    url: "/reports/customers",
  },
  {
    name: "Operator",
    url: "/reports/operator",
  },
];

const AdminReports: React.FC = () => {
  const location = useLocation();
  const actionData = useActionData();
  const { user } = useLoaderData<{
    user: AdminInterface;
  }>();

  return (
    <AdminLayout pageTitle="Reports" user={user}>
      <div className="h-full flex flex-col gap-2">
        <div className="flex items-center gap-1 py-2">
          {reportLinks.map((link) => (
            <Link
              to={link.url}
              key={link.url}
              className={`text-slate-700 text-sm font-sen transition-all duration-300 hover:bg-slate-300/20 px-3 py-1 rounded-lg ${
                location.pathname === link.url
                  ? "!bg-blue-500/90 text-white hover:!bg-blue-500/90 hover:!text-white"
                  : ""
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const id = formData.get("_id") as string;
  const username = formData.get("username") as string;
  const role = formData.get("role") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;

  const actionType = formData.get("actionType") as string;

  const productController = await new EmployeeController(request);
  if (actionType === "edit") {
    return await productController.updateEmployee({
      username,
      role,
      email,
      phone,
      id,
    });
  } else if (actionType === "delete") {
    return await productController.deleteEmployee(id);
  } else {
    return await productController.createEmployee({
      username,
      email,
      password,
      phone,
      role,
    });
  }
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") as string) || 1;
  const search_term = url.searchParams.get("search_term") as string;

  const adminControlle = await new AdminController(request);
  await adminControlle.requireAdminId();
  const user = await adminControlle.getAdmin();

  // const employeeController = await new EmployeeController(request);
  // const { employees, totalPages } = await employeeController.getEmployees({
  //   search_term,
  //   page,
  // });
  return {
    user,
    // employees,
    // totalPages,
  };
};

export const meta: MetaFunction = () => {
  return [
    { title: "Linakess " },
    {
      name: "description",
      content: "The best e-Commerce platform for your business.",
    },
    { name: "og:title", content: "Linakess" },
    { property: "og:type", content: "websites" },
    {
      name: "og:description",
      content: "The best e-Commerce platform for your business.",
    },
    {
      name: "og:image",
      content:
        "https://res.cloudinary.com/app-deity/image/upload/v1700242905/l843bauo5zpierh3noug.png",
    },
    { name: "og:url", content: "https://single-ecommerce.vercel.app" },
  ];
};
