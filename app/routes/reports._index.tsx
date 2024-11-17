/* eslint-disable @typescript-eslint/no-explicit-any */
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { Table, Button, Select, Form, DatePicker } from "antd";
import AdminController from "~/controllers/AdminController.server";

import { AdminInterface } from "~/types";
import AnalyticsController from "~/controllers/AnalyticsController.server";
import EmployeeController from "~/controllers/EmployeeController.server";

export const TableHeader = ({ title }: { title: string }) => {
  return (
    <h3 className="font-bold text-slate-800 font-sen text-sm mb-2">{title}</h3>
  );
};
export const TableData = ({ text }: { text: string }) => {
  return <h3 className="font-sen text-slate-600 text-xs">{text}</h3>;
};

const AdminSalesReports: React.FC = () => {
  const [salesReportForm] = Form.useForm();
  const submit = useSubmit();
  const actionData = useActionData<any>();
  const { employees } = useLoaderData<{
    employees: AdminInterface[];
  }>();

  const { Option } = Select;
  const { Item } = Form;

  const onFinish = async () => {
    const data = await salesReportForm.validateFields();

    submit(data, { method: "post" });
  };

  const orderColumns = [
    {
      title: <TableHeader title="Product Name" />,
      dataIndex: "productName",
      key: "productName",
      render: (text: string) => <TableData text={text} />,
    },
    {
      title: <TableHeader title="Quantity" />,
      dataIndex: "quantity",
      key: "quantity",
      render: (text: string) => <TableData text={text} />,
    },
    {
      title: <TableHeader title="Price" />,
      dataIndex: "price",
      key: "price",
      render: (text: number) => <TableData text={`GH₵ ${text.toFixed(2)}`} />,
    },
    {
      title: <TableHeader title="Subtotal" />,
      dataIndex: "price",
      key: "price",
      render: (text: number, record: any) => (
        <TableData
          text={`GH₵ ${record.price.toFixed(2) * record.quantity.toFixed(2)}`}
        />
      ),
    },
  ];

  const salesColumns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      render: (text: string) => (
        <p>
          {new Date(text)
            .toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
            .replace(/\//g, "-")}
        </p>
      ),
    },
    {
      title: "Invoice Code",
      dataIndex: "orderId",
      key: "orderId",
      render: (text: string) => <p>{text.toUpperCase()}</p>,
    },
    {
      title: "Total Amount",
      dataIndex: "totalPrice",
      key: "total_amount",
      render: (text: string) => <p>GH₵ {text}</p>,
    },
    {
      title: "Discount",
      dataIndex: "discount",
      key: "discount",
      render: (text: string) => <p>GH₵ {text}</p>,
    },
    {
      title: "Cash Balance",
      dataIndex: "balance",
      key: "balance",
    },
  ];

  return (
    <div className="h-full flex gap-3">
      <div className="h-full rounded-xl bg-slate-300/15 w-1/5 px-4 py-3">
        <Form
          onFinish={onFinish}
          requiredMark={false}
          layout="vertical"
          form={salesReportForm}
          className="flex flex-col justify-between h-full"
        >
          <div className="flex flex-col gap-3">
            <Item
              label="Select Employee"
              name="employee"
              rules={[{ required: true, message: "Customer is required" }]}
            >
              <Select>
                {employees?.map((employee) => (
                  <Option key={employee._id} value={employee._id}>
                    {employee.username}
                  </Option>
                ))}
              </Select>
            </Item>

            <Item
              label="Select Report Type"
              name="reportType"
              rules={[{ required: true, message: "Report Type is required" }]}
            >
              <Select>
                <Option value="sale">Sales</Option>
                <Option value="order">Orders</Option>
              </Select>
            </Item>

            <Item
              label="Date"
              name={"date"}
              rules={[{ required: true, message: "Date is required" }]}
            >
              <DatePicker className="w-full" />
            </Item>
          </div>

          <Button
            htmlType="submit"
            type="primary"
            className="bg-blue-600 rounded-xl font-sen"
            size="large"
          >
            Generate Report
          </Button>
        </Form>
      </div>
      <div className="flex-1 h-[78vh] overflow-y-auto">
        <div className="flex flex-col gap-3 h-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {actionData?.totalItems > 0 && (
              <div className="bg-blue-300/10 rounded-lg px-3 py-2">
                <h3 className="font-bold text-slate-800 font-sen text-sm mb-2">
                  Total Sales Items
                </h3>
                <h3 className="font-sen text-slate-600 text-xs">
                  {actionData?.totalItems}
                </h3>
              </div>
            )}
            <div className="bg-blue-300/10 rounded-lg px-3 py-2">
              <h3 className="font-bold text-slate-800 font-sen text-sm mb-2">
                Total Amount
              </h3>
              <h3 className="font-sen text-slate-600 text-xs">
                GH₵{" "}
                {actionData?.totalSalesAmount === null
                  ? actionData?.totalOrdersAmount?.toFixed(2)
                  : actionData?.totalSalesAmount?.toFixed(2)}
              </h3>
            </div>

            <div className="bg-blue-300/10 rounded-lg px-3 py-2">
              <h3 className="font-bold text-slate-800 font-sen text-sm mb-2">
                Total Profit
              </h3>
              <h3 className="font-sen text-slate-600 text-xs">
                GH₵ {actionData?.totalProfit.toFixed(2)}
              </h3>
            </div>

            <div className="bg-blue-300/10 rounded-lg px-3 py-2">
              <h3 className="font-bold text-slate-800 font-sen text-sm mb-2">
                Grand Total
              </h3>
              <h3 className="font-sen text-slate-600 text-xs">
                GH₵ {actionData?.grandTotal.toFixed(2)}
              </h3>
            </div>
          </div>
          {actionData?.items?.length > 0 && (
            <Table
              columns={salesColumns}
              className="flex-1 overflow-y-auto"
              dataSource={actionData?.items}
              rowKey={(record) => record._id}
            />
          )}
          {actionData?.rawOrderItems?.length > 0 && (
            <Table
              columns={orderColumns}
              className="flex-1 overflow-y-auto"
              dataSource={actionData?.rawOrderItems}
              rowKey={(record) => record._id}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSalesReports;

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const employee = formData.get("employee") as string;
  const type = formData.get("reportType") as string;
  const date = formData.get("date") as string;

  const reportController = new AnalyticsController(request);
  const reportData = await reportController.getSalesReport({
    date,
    employee,
    type,
  });

  return reportData;
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") as string) || 1;
  const search_term = url.searchParams.get("search_term") as string;

  const adminControlle = await new AdminController(request);
  await adminControlle.requireAdminId();

  const employeeController = new EmployeeController(request);
  const { employees } = await employeeController.getEmployees({
    page,
    search_term,
  });

  return {
    employees,
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
