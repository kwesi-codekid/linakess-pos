/* eslint-disable @typescript-eslint/no-explicit-any */
import { useActionData, useSubmit } from "@remix-run/react";
import { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { Table, Button, Select, Form } from "antd";
import AdminController from "~/controllers/AdminController.server";

import { OrderInterface } from "~/types";
import AnalyticsController from "~/controllers/AnalyticsController.server";

export const TableHeader = ({ title }: { title: string }) => {
  return (
    <h3 className="font-bold text-slate-800 font-sen text-sm mb-2">{title}</h3>
  );
};
export const TableData = ({ text }: { text: string }) => {
  return <h3 className="font-sen text-slate-600 text-xs">{text}</h3>;
};

const AdminOrderReports: React.FC = () => {
  const [customerReportForm] = Form.useForm();
  const submit = useSubmit();
  const actionData = useActionData<OrderInterface[]>();

  if (actionData) console.log(actionData);

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
      render: (text: string) => <TableData text={"ORD" + text.toUpperCase()} />,
    },
    {
      title: <TableHeader title="Customer" />,
      dataIndex: "customer",
      key: "customer",
      render: (text: string, record: any) => (
        <TableData text={record.customer.fullName.toUpperCase()} />
      ),
    },
    {
      title: <TableHeader title="Products" />,
      dataIndex: "items",
      key: "items",
      render: (text: string, record: any) => {
        return record.items.map((orderItem: any) => (
          <div
            className="flex justify-between items-center"
            key={orderItem._id}
          >
            <h3 className="font-sen text-slate-600 text-xs">
              {orderItem.productName}
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
    // {
    //   title: <TableHeader title="Unit Price" />,
    //   dataIndex: "unitPrice",
    //   key: "unitPrice",
    //   render: (text: string) => (
    //     <TableData text={"GH₵" + parseFloat(text).toFixed(2)} />
    //   ),
    // },
    // {
    //   title: <TableHeader title="Amt Payable" />,
    //   dataIndex: "amountPayable",
    //   key: "amountPayable",
    //   render: (text: string) => (
    //     <TableData text={"GH₵" + parseFloat(text).toFixed(2)} />
    //   ),
    // },
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
              label="Select Order Type"
              name="orderType"
              rules={[{ required: true, message: "Order Type is required" }]}
            >
              <Select>
                <Option value="completed">Completed</Option>
                <Option value="pending">Pending</Option>
              </Select>
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
        <Table
          columns={orderColumns}
          className="flex-1 overflow-y-auto"
          dataSource={actionData && actionData}
          rowKey={(record) => record._id}
        />
      </div>
    </div>
  );
};

export default AdminOrderReports;

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const orderType = formData.get("orderType") as string;

  const reportController = new AnalyticsController(request);
  let orders = [];

  if (orderType === "completed") {
    orders = await reportController.getCompletedOrders({
      search_term: "",
      status: "",
      from: "",
      to: "",
    });
  } else {
    orders = await reportController.getPendingOrders({
      search_term: "",
      status: "",
      from: "",
      to: "",
    });
  }

  return orders;
};

export const loader: LoaderFunction = async ({ request }) => {
  const adminControlle = await new AdminController(request);
  await adminControlle.requireAdminId();

  return true;
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
