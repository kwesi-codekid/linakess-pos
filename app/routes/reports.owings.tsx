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
  const actionData = useActionData<any>();

  if (actionData) console.log(actionData);

  const onFinish = async () => {
    const data = await customerReportForm.validateFields();

    submit(data, { method: "post" });
  };

  const orderColumns = [
    {
      title: <TableHeader title="Customer Name" />,
      dataIndex: "fullName",
      key: "fullName",
      render: (text: string) => <TableData text={text.toUpperCase()} />,
    },
    {
      title: <TableHeader title="Email" />,
      dataIndex: "email",
      key: "email",
      render: (text: string) => <TableData text={`${text}`} />,
    },
    {
      title: <TableHeader title="Phone" />,
      dataIndex: "phone",
      key: "phone",
      render: (text: string) => <TableData text={`${text}`} />,
    },
    {
      title: <TableHeader title="Amount Owed" />,
      dataIndex: "balance",
      key: "balance",
      render: (text: number) => (
        <TableData text={`GH₵ ${(text * -1).toFixed(2)}`} />
      ),
    },
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
            {/* <Item
              label="Select Order Type"
              name="orderType"
              rules={[{ required: true, message: "Order Type is required" }]}
            >
              <Select>
                <Option value="completed">Completed</Option>
                <Option value="pending">Pending</Option>
              </Select>
            </Item> */}
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6">
            <div className="bg-blue-300/10 rounded-lg px-3 py-2">
              <h3 className="text-slate-500 font-sen text-sm mb-2">
                Total Sales Owings
              </h3>
              <h3 className="font-sen text-slate-800 text-base font-bold">
                GH₵ {actionData?.totalOwingFromSales.toFixed(2)}
              </h3>
            </div>
            <div className="bg-blue-300/10 rounded-lg px-3 py-2">
              <h3 className="text-slate-500 font-sen text-sm mb-2">
                Total Orders Owings
              </h3>
              <h3 className="font-sen text-slate-800 text-base font-bold">
                GH₵ {actionData?.totalOwingFromOrders.toFixed(2) || 0.0}
              </h3>
            </div>
            <div className="bg-blue-300/10 rounded-lg px-3 py-2">
              <h3 className="text-slate-500 font-sen text-sm mb-2">
                Grand Total Owings
              </h3>
              <h3 className="font-sen text-slate-800 text-base font-bold">
                GH₵ {actionData?.grandTotal.toFixed(2)}
              </h3>
            </div>
          </div>

          <Table
            columns={orderColumns}
            className="flex-1 overflow-y-auto"
            dataSource={actionData && actionData.customersOwing}
            rowKey={(record) => record._id}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminOrderReports;

export const action: ActionFunction = async ({ request }) => {
  const reportController = new AnalyticsController(request);
  const reportData = await reportController.getOwingReport();

  return reportData;
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