/* eslint-disable @typescript-eslint/no-explicit-any */
import { useActionData, useSubmit } from "@remix-run/react";
import { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { Table, Button, Select, Form, Input, DatePicker } from "antd";
import AdminController from "~/controllers/AdminController.server";

import AnalyticsController from "~/controllers/AnalyticsController.server";
import { useState } from "react";

export const TableHeader = ({ title }: { title: string }) => {
  return (
    <h3 className="font-bold text-slate-800 font-sen text-sm mb-2">{title}</h3>
  );
};
export const TableData = ({ text }: { text: string }) => {
  return <h3 className="font-sen text-slate-600 text-xs">{text}</h3>;
};

const AdminStockReports: React.FC = () => {
  const [stockReportForm] = Form.useForm();
  const submit = useSubmit();
  const actionData = useActionData<any>();

  if (actionData) console.log(actionData);

  const { Option } = Select;
  const { Item } = Form;

  const onFinish = async () => {
    const data = await stockReportForm.validateFields();

    submit(data, { method: "post" });
  };

  const restockColumns = [
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

  const currentStocksColumns = [
    {
      title: <TableHeader title="Product" />,
      dataIndex: "name",
      key: "name",
      render: (text: string) => <TableData text={text} />,
    },
    {
      title: <TableHeader title="Home Stock" />,
      dataIndex: "stockAtHome",
      key: "stockAtHome",
      render: (text: string) => <TableData text={text} />,
    },
    {
      title: <TableHeader title="Shop Stock" />,
      dataIndex: "stockAtShop",
      key: "stockAtShop",
      render: (text: string) => <TableData text={text} />,
    },
    {
      title: <TableHeader title="Total Stock" />,
      dataIndex: "stockAtShop",
      key: "stockAtShop",
      render: (text: string, record: any) => (
        <TableData
          text={(
            parseInt(record.stockAtHome) + parseInt(record.stockAtShop)
          ).toString()}
        />
      ),
    },
    {
      title: <TableHeader title="Quantity Sold" />,
      dataIndex: "quantitySold",
      key: "quantitySold",
      render: (text: string) => <TableData text={text} />,
    },
    {
      title: <TableHeader title="Cost Price" />,
      dataIndex: "costPrice",
      key: "costPrice",
      render: (text: string) => (
        <TableData text={"GH₵" + parseFloat(text).toFixed(2)} />
      ),
    },
    {
      title: <TableHeader title="Selling Price" />,
      dataIndex: "price",
      key: "price",
      render: (text: string) => (
        <TableData text={"GH₵" + parseFloat(text).toFixed(2)} />
      ),
    },
  ];

  const movingStocksColumns = [
    {
      title: <TableHeader title="Product" />,
      dataIndex: "name",
      key: "name",
      render: (text: string) => <TableData text={text} />,
    },
    {
      title: <TableHeader title="Qty Sold" />,
      dataIndex: "quantitySold",
      key: "quantitySold",
      render: (text: string) => <TableData text={text} />,
    },
    {
      title: <TableHeader title="Cost Price" />,
      dataIndex: "costPrice",
      key: "costPrice",
      render: (text: string) => (
        <TableData text={"GH₵" + parseFloat(text).toFixed(2)} />
      ),
    },
    {
      title: <TableHeader title="Selling Price" />,
      dataIndex: "price",
      key: "price",
      render: (text: string) => (
        <TableData text={"GH₵" + parseFloat(text).toFixed(2)} />
      ),
    },
  ];

  const [showThreshold, setShowThreshold] = useState<boolean>(false);
  const [showDate, setShowDate] = useState<boolean>(false);
  const [showMovingThresholds, setShowMovingThresholds] =
    useState<boolean>(false);

  return (
    <div className="h-full flex gap-3">
      <div className="h-[78vh] rounded-xl bg-slate-300/15 w-1/5 px-4 py-3">
        <Form
          onFinish={onFinish}
          requiredMark={false}
          layout="vertical"
          form={stockReportForm}
          className="flex flex-col justify-between h-full"
        >
          <div className="flex flex-col gap-3">
            <Item
              label="Select Report Type"
              name="reportType"
              rules={[{ required: true, message: "Report Type is required" }]}
            >
              <Select
                onSelect={(value) => {
                  if (value === "belowPoint") {
                    setShowThreshold(true);
                    setShowDate(false);
                    setShowMovingThresholds(false);
                  } else if (value === "restocks") {
                    setShowDate(true);
                    setShowThreshold(false);
                    setShowMovingThresholds(false);
                  } else if (value === "stock-moving-rate") {
                    setShowMovingThresholds(true);
                    setShowThreshold(false);
                    setShowDate(false);
                  } else {
                    setShowThreshold(false);
                    setShowDate(false);
                    setShowMovingThresholds(false);
                  }
                }}
              >
                <Option value="currentStock">Product Stock</Option>
                <Option value="restocks">Restock</Option>
                <Option value="stock-moving-rate">Stock Moving Rate</Option>
                <Option value="belowPoint">Minimum Stock</Option>
              </Select>
            </Item>

            {showThreshold && (
              <Item label="Stock Threshold" name={"reorderPoint"}>
                <Input type="number" />
              </Item>
            )}
            {showDate && (
              <Item label="Date" name={"date"}>
                <DatePicker className="w-full" />
              </Item>
            )}
            {showMovingThresholds && (
              <div className="flex flex-col gap-3">
                <Item
                  label="Fast Moving Threshold"
                  name={"fastMovingThreshold"}
                >
                  <Input type="number" />
                </Item>
                <Item
                  label="Slow Moving Threshold"
                  name={"slowMovingThreshold"}
                >
                  <Input type="number" />
                </Item>
              </div>
            )}
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
        {actionData?.reportType === "restocks" && (
          <Table
            columns={restockColumns}
            className="flex-1 overflow-y-auto"
            dataSource={actionData && actionData.reportData}
            rowKey={(record) => record._id}
          />
        )}
        {actionData?.reportType === "currentStock" && (
          <Table
            columns={currentStocksColumns}
            className="flex-1 overflow-y-auto"
            dataSource={actionData && actionData.reportData}
            rowKey={(record) => record._id}
          />
        )}
        {actionData?.reportType === "belowPoint" && (
          <Table
            columns={currentStocksColumns}
            className="flex-1 overflow-y-auto"
            dataSource={actionData && actionData.reportData}
            rowKey={(record) => record._id}
          />
        )}
        {actionData?.reportType === "stock-moving-rate" && (
          <div className="grid grid-cols-2 gap-8">
            {actionData.reportData && (
              <div>
                <h3 className="font-sen font-semibold text-lg">
                  Fast Moving Stocks
                </h3>
                <Table
                  columns={movingStocksColumns}
                  className="flex-1 overflow-y-auto"
                  dataSource={actionData && actionData.reportData.fastMoving}
                  rowKey={(record) => record._id}
                />
              </div>
            )}

            {actionData.reportData && (
              <div>
                <h3 className="font-sen font-semibold text-lg">
                  Slow Moving Stocks
                </h3>
                <Table
                  columns={movingStocksColumns}
                  className="flex-1 overflow-y-auto"
                  dataSource={actionData && actionData.reportData.slowMoving}
                  rowKey={(record) => record._id}
                />
              </div>
            )}

            {actionData.reportData && (
              <div>
                <h3 className="font-sen font-semibold text-lg">
                  Top High Profit Stocks
                </h3>
                <Table
                  columns={movingStocksColumns}
                  className="flex-1 overflow-y-auto"
                  dataSource={
                    actionData && actionData.reportData.highProfitStocks
                  }
                  rowKey={(record) => record._id}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStockReports;

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const reportType = formData.get("reportType") as string;
  const reorderPoint = formData.get("reorderPoint") as string;
  const date = formData.get("date") as string;
  const fastMovingThreshold = formData.get("fastMovingThreshold") as string;
  const slowMovingThreshold = formData.get("slowMovingThreshold") as string;

  const reportController = new AnalyticsController(request);

  const reportData = await reportController.getStockHistory({
    date: date,
    reorderPoint: parseInt(reorderPoint),
    type: reportType,
    fastMovinngThreshold: parseInt(fastMovingThreshold),
    slowMovinngThreshold: parseInt(slowMovingThreshold),
  });

  if (reportType === "restocks") return { reportType: reportType, reportData };
  if (reportType === "currentStock")
    return { reportType: reportType, reportData };
  if (reportType === "belowPoint")
    return { reportType: reportType, reportData };
  if (reportType === "stock-moving-rate")
    return { reportType: reportType, reportData };

  return null;
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
