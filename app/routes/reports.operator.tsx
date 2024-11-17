import {
  Link,
  Outlet,
  useActionData,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";
import { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { Table, Button, Input, Select, Form } from "antd";
import { useEffect, useState } from "react";
import AdminLayout from "~/layouts/adminLayout";
import AdminController from "~/controllers/AdminController.server";
import EmployeeController from "~/controllers/EmployeeController.server";
import { OperatorInterface } from "~/types";
import OperatorController from "~/controllers/OperatorController.server";
import AnalyticsController from "~/controllers/AnalyticsController.server";

export const TableHeader = ({ title }: { title: string }) => {
  return (
    <h3 className="font-bold text-slate-800 font-sen text-sm mb-2">{title}</h3>
  );
};
export const TableData = ({ text }: { text: string }) => {
  return <h3 className="font-sen text-slate-600 text-xs">{text}</h3>;
};

const AdminReports: React.FC = () => {
  const [operatorReportForm] = Form.useForm();
  const submit = useSubmit();
  const actionData = useActionData();
  const { operators } = useLoaderData<{
    operators: OperatorInterface[];
  }>();

  const { Option } = Select;
  const { Item } = Form;

  const onFinish = async () => {
    const data = await operatorReportForm.validateFields();

    submit(data, { method: "post" });
  };

  const stockColumns = [
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
      title: <TableHeader title="Product" />,
      dataIndex: "product",
      key: "product",
      render: (text: string, record: any) => (
        <TableData text={record?.product?.name} />
      ),
    },
    {
      title: <TableHeader title="Total Qty" />,
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      render: (text: string) => <TableData text={text} />,
    },
    {
      title: <TableHeader title="Commission" />,
      dataIndex: "commission",
      key: "commission",
      render: (text: string) => <TableData text={text} />,
    },
    {
      title: <TableHeader title="Unit Price" />,
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (text: string) => (
        <TableData text={"GH₵" + parseFloat(text).toFixed(2)} />
      ),
    },
    {
      title: <TableHeader title="Amt Payable" />,
      dataIndex: "amountPayable",
      key: "amountPayable",
      render: (text: string) => (
        <TableData text={"GH₵" + parseFloat(text).toFixed(2)} />
      ),
    },
  ];

  const paymentColumns = [
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
      title: <TableHeader title="Type" />,
      dataIndex: "transactionType",
      key: "transactionType",
      render: (text: string) => (
        <div
          className={`rounded-full py-1 px-2 text-xs flex items-center justify-center ${
            text === "loan" ? "bg-red-400/10" : "bg-green-400/10"
          }`}
        >
          <p
            className={`${
              text === "payout" ? "text-green-500" : "text-red-500"
            } text-[10.5px] font-sen capitalize`}
          >
            {text}
          </p>
        </div>
      ),
    },
    {
      title: <TableHeader title="Amount" />,
      dataIndex: "amount",
      key: "amount",
      render: (text: string) => (
        <TableData text={"GH₵ " + parseFloat(text).toFixed(2)} />
      ),
    },
    {
      title: <TableHeader title="Description" />,
      dataIndex: "description",
      key: "description",
      render: (text: string) => <TableData text={text} />,
    },
  ];

  return (
    <div className="h-full flex gap-3">
      <div className="h-full rounded-xl bg-slate-300/15 w-1/4 px-4 py-3">
        <Form
          onFinish={onFinish}
          requiredMark={false}
          layout="vertical"
          form={operatorReportForm}
          className="flex flex-col justify-between h-full"
        >
          <div className="flex flex-col gap-3">
            <Item
              label="Select Operator"
              name="operatorId"
              rules={[{ required: true, message: "Operator is required" }]}
            >
              <Select>
                {operators.map((operator) => (
                  <Option key={operator._id} value={operator._id}>
                    {operator.fullName}
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
                <Option value="stock">Stock</Option>
                <Option value="finance">Financial</Option>
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
        {actionData && actionData.reportType === "stock" ? (
          <div className="flex flex-col gap-3 h-full">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              <div className="bg-blue-300/10 rounded-lg px-3 py-2">
                <h3 className="font-bold text-slate-800 font-sen text-sm mb-2">
                  Total Products
                </h3>
                <h3 className="font-sen text-slate-600 text-xs">
                  {actionData.totalProducts}
                </h3>
              </div>
              <div className="bg-blue-300/10 rounded-lg px-3 py-2">
                <h3 className="font-bold text-slate-800 font-sen text-sm mb-2">
                  Total Commissions
                </h3>
                <h3 className="font-sen text-slate-600 text-xs">
                  {actionData.totalCommission}
                </h3>
              </div>
              <div className="bg-blue-300/10 rounded-lg px-3 py-2">
                <h3 className="font-bold text-slate-800 font-sen text-sm mb-2">
                  Total Payable
                </h3>
                <h3 className="font-sen text-slate-600 text-xs">
                  {actionData.totalProductsPayable}
                </h3>
              </div>
              <div className="bg-blue-300/10 rounded-lg px-3 py-2">
                <h3 className="font-bold text-slate-800 font-sen text-sm mb-2">
                  Total Amount Payable
                </h3>
                <h3 className="font-sen text-slate-600 text-xs">
                  GH₵ {actionData.totalAmountPayable.toFixed(2)}
                </h3>
              </div>
            </div>
            <Table
              columns={stockColumns}
              className="flex-1 overflow-y-auto"
              dataSource={actionData.data}
              rowKey={(record) => record._id}
            />
          </div>
        ) : (
          ""
        )}

        {actionData && actionData.reportType === "finance" ? (
          <div className="flex flex-col gap-3 h-full">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              <div className="bg-blue-300/10 rounded-lg px-3 py-2">
                <h3 className="font-bold text-slate-800 font-sen text-sm mb-2">
                  Total Amount Payable
                </h3>
                <h3 className="font-sen text-slate-600 text-xs">
                  GH₵ {actionData.totalAmountPayable.toFixed(2)}
                </h3>
              </div>
              <div className="bg-blue-300/10 rounded-lg px-3 py-2">
                <h3 className="font-bold text-slate-800 font-sen text-sm mb-2">
                  Total Payouts
                </h3>
                <h3 className="font-sen text-slate-600 text-xs">
                  GH₵ {actionData.payouts.toFixed(2)}
                </h3>
              </div>
              <div className="bg-blue-300/10 rounded-lg px-3 py-2">
                <h3 className="font-bold text-slate-800 font-sen text-sm mb-2">
                  Total Loans
                </h3>
                <h3 className="font-sen text-slate-600 text-xs">
                  GH₵ {actionData.loans.toFixed(2)}
                </h3>
              </div>
              <div className="bg-blue-300/10 rounded-lg px-3 py-2">
                <h3 className="font-bold text-slate-800 font-sen text-sm mb-2">
                  Total Balance
                </h3>
                <h3 className="font-sen text-slate-600 text-xs">
                  GH₵ {actionData.totalBalance.toFixed(2)}
                </h3>
              </div>
            </div>
            <Table
              columns={paymentColumns}
              dataSource={actionData.data}
              className="flex-1 overflow-y-auto"
              rowKey={(record) => record._id}
            />
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default AdminReports;

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const operatorId = formData.get("operatorId") as string;
  const reportType = formData.get("reportType") as string;

  const reportController = new AnalyticsController(request);
  const reportData = await reportController.getOperatorReport({
    operatorId,
    reportType,
  });
  return reportData;
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") as string) || 1;
  const search_term = url.searchParams.get("search_term") as string;

  const adminControlle = await new AdminController(request);
  await adminControlle.requireAdminId();
  const user = await adminControlle.getAdmin();

  const operatorController = new OperatorController(request);
  const { operators } = await operatorController.getOperators({
    search_term,
    page,
  });
  return {
    user,
    operators,
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
