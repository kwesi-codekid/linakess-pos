/* eslint-disable @typescript-eslint/no-explicit-any */
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { Table, Button, Select, Form } from "antd";
import AdminController from "~/controllers/AdminController.server";

import { OperatorInterface, OrderInterface } from "~/types";

import AnalyticsController from "~/controllers/AnalyticsController.server";
import CustomerController from "~/controllers/CustomerController.server";

export const TableHeader = ({ title }: { title: string }) => {
  return (
    <h3 className="font-bold text-slate-800 font-sen text-sm mb-2">{title}</h3>
  );
};
export const TableData = ({ text }: { text: string }) => {
  return <h3 className="font-sen text-slate-600 text-xs">{text}</h3>;
};

const AdminReports: React.FC = () => {
  const [customerReportForm] = Form.useForm();
  const submit = useSubmit();
  const actionData = useActionData<OrderInterface[]>();
  const { customers } = useLoaderData<{
    customers: OperatorInterface[];
  }>();

  const { Option } = Select;
  const { Item } = Form;

  const onFinish = async () => {
    const data = await customerReportForm.validateFields();

    submit(data, { method: "post" });
  };

  const orderColumns = [
    {
      title: <TableHeader title="Date" />,
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => (
        <TableData
          text={new Date(text)
            .toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
            .replace(/\//g, "-")}
        />
      ),
    },
    {
      title: <TableHeader title="Invoice Code" />,
      dataIndex: "orderId",
      key: "orderId",
      render: (text: string) => <TableData text={text} />,
    },
    {
      title: <TableHeader title="Type" />,
      dataIndex: "orderType",
      key: "orderType",
      render: (text: string) => <TableData text={text} />,
    },
    {
      title: <TableHeader title="Products" />,
      dataIndex: "orderItems",
      key: "orderItems",
      render: (text: string, record: any) => {
        return record.orderItems.map((orderItem: any) => (
          <div
            className="flex justify-between items-center"
            key={orderItem._id}
          >
            <h3 className="font-sen text-slate-600 text-xs">
              {orderItem.product.name}
            </h3>
            <h3 className="font-sen text-slate-600 text-xs">
              Qty: {orderItem.quantity}
            </h3>
          </div>
        ));
      },
    },
    {
      title: <TableHeader title="Services" />,
      dataIndex: "orderServiceItems",
      key: "orderServiceItems",
      render: (text: string, record: any) => {
        return record.orderServiceItems.map((orderItem: any) => (
          <div
            className="flex justify-between items-center"
            key={orderItem._id}
          >
            <h3 className="font-sen text-slate-600 text-xs">
              {orderItem.service.name}
            </h3>
            <h3 className="font-sen text-slate-600 text-xs">
              Qty: {orderItem.quantity}
            </h3>
          </div>
        ));
      },
    },
    {
      title: <TableHeader title="Total Amt." />,
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (text: string) => <TableData text={`GH₵ ${text}`} />,
    },
    {
      title: <TableHeader title="Paid" />,
      dataIndex: "amountPaid",
      key: "amountPaid",
      render: (text: string) => <TableData text={`GH₵ ${text}`} />,
    },
    {
      title: <TableHeader title="Balance" />,
      dataIndex: "balance",
      key: "balance",
      render: (text: string) => <TableData text={`GH₵ ${text}`} />,
    },
  ];

  const topCustomersColumns = [
    {
      title: <TableHeader title="Customer Name" />,
      dataIndex: "fullName",
      key: "fullName",
      render: (text: string) => <TableData text={text} />,
    },
    {
      title: <TableHeader title="Email" />,
      dataIndex: "email",
      key: "email",
      render: (text: string) => <TableData text={text} />,
    },
    {
      title: <TableHeader title="Phone" />,
      dataIndex: "phone",
      key: "phone",
      render: (text: string) => <TableData text={text} />,
    },
    {
      title: <TableHeader title="Amount Spent" />,
      dataIndex: "totalSpent",
      key: "totalSpent",
      render: (text: string) => <TableData text={`GH₵ ${text}`} />,
    },
  ];

  const filterOption = (
    input: string,
    option?: { label: string; value: string }
  ) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());
  const customersData = customers.map((customer: any) => ({
    value: customer._id,
    label: customer.fullName,
  }));

  const customersSelectData = [
    { value: "all-customers", label: "All Customers" },
    ...customersData,
  ];

  return (
    <div className="h-full flex gap-3">
      <div className="h-full rounded-xl bg-slate-300/15 w-1/5 px-4 py-3">
        <Form
          onFinish={onFinish}
          requiredMark={false}
          layout="vertical"
          form={customerReportForm}
          className="flex flex-col justify-between h-full"
        >
          <div className="flex flex-col gap-3">
            <Item
              label="Select Report Type"
              name="reportType"
              rules={[{ required: true, message: "Report Type is required" }]}
            >
              <Select>
                <Option value="sales">Sales</Option>
                <Option value="orders">Orders</Option>
                <Option value="overall">Overall</Option>
                <Option value="top-customers">Top Customers</Option>
              </Select>
            </Item>
            <Item label="Select Customer" name="customer">
              <Select
                showSearch
                allowClear
                filterOption={filterOption}
                options={customersSelectData}
              />
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
        {actionData?.reportType !== "top-customers" && (
          <div className="flex flex-col gap-3 h-full">
            <Table
              columns={orderColumns}
              className="flex-1 overflow-y-auto"
              dataSource={actionData}
              rowKey={(record) => record._id}
            />
          </div>
        )}
        {actionData?.reportType === "top-customers" && (
          <div className="flex flex-col gap-3 h-full">
            <Table
              columns={topCustomersColumns}
              className="flex-1 overflow-y-auto"
              dataSource={actionData?.data}
              rowKey={(record) => record._id}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const customer = formData.get("customer") as string;
  const reportType = formData.get("reportType") as string;

  const reportController = new AnalyticsController(request);

  if (reportType === "top-customers") {
    const topCustomers = await reportController.getTopCustomers();
    console.log(topCustomers);
    return {
      data: topCustomers,
      reportType,
    };
  } else {
    const reportData = await reportController.getCustomerReport({
      customer,
      reportType,
    });

    return reportData;
  }
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") as string) || 1;
  const search_term = url.searchParams.get("search_term") as string;

  const adminControlle = await new AdminController(request);
  await adminControlle.requireAdminId();
  const user = await adminControlle.getAdmin();

  const customerController = new CustomerController(request);
  const customers = await customerController.getCustomersx();

  return {
    customers,
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
