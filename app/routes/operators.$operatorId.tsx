/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/prop-types */
import { useActionData, useLoaderData } from "@remix-run/react";
import { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { Table, Button, Form, Input, Select, DatePicker } from "antd";
import { useEffect, useRef, useState } from "react";
import pkg from "react-to-print";
const { useReactToPrint } = pkg;
import axios from "axios";

import AdminLayout from "~/layouts/adminLayout";
import AdminController from "~/controllers/AdminController.server";

import CreateModal from "~/components/modals/CreateModal";
import StockInvoice from "~/components/printouts/StockInvoice";
import OperatorReceipt from "~/components/printouts/OperatorReceipt";

import OperatorController from "~/controllers/OperatorController.server";
import {
  AdminInterface,
  OperatorInterface,
  PaymentInterface,
  ProductInterface,
} from "~/types";
import ProductController from "~/controllers/ProductController.server";
import PaymentController from "~/controllers/PaymentController";
import DeleteItemModal from "~/components/modals/DeleteItemModal";
import EditItemModal from "~/components/modals/EditItemModal";

interface CardProps {
  title: string;
  children: React.ReactNode;
  buttonText?: string;
  openModal?: boolean;
  setOpenModal?: (value: boolean) => void;
  classNames?: string;
  hasDatePicker?: boolean;
  onDateChange?: (date: any, dateString: any) => void;
  secondaryButton?: boolean;
  secondaryButtonAction?: () => void;
}
export const Card: React.FC<CardProps> = ({
  title,
  children,
  buttonText,
  classNames,
  setOpenModal,
  hasDatePicker,
  onDateChange,
  secondaryButton,
  secondaryButtonAction,
}) => {
  const { RangePicker } = DatePicker;
  return (
    <div
      className={`bg-white shadow-2xl shadow-black/10 rounded-lg p-4 ${classNames}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold font-sen text-xl mb-2">{title}</h3>

        <div className="flex flex-col-reverse items-end gap-1">
          <div className="flex items-center gap-2">
            {hasDatePicker && (
              <RangePicker
                className="rounded-lg"
                onChange={onDateChange}
                format="YYYY-MM-DD"
              />
            )}

            {secondaryButton && (
              <Button
                className="flex items-center justify-center font-sen text-blue-500 border-blue-500 hover:!text-white hover:!bg-blue-500 bg-blue-500/10 px-4 py-2 rounded-lg"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.875 1.5C6.839 1.5 6 2.34 6 3.375v2.99c-.426.053-.851.11-1.274.174-1.454.218-2.476 1.483-2.476 2.917v6.294a3 3 0 0 0 3 3h.27l-.155 1.705A1.875 1.875 0 0 0 7.232 22.5h9.536a1.875 1.875 0 0 0 1.867-2.045l-.155-1.705h.27a3 3 0 0 0 3-3V9.456c0-1.434-1.022-2.7-2.476-2.917A48.716 48.716 0 0 0 18 6.366V3.375c0-1.036-.84-1.875-1.875-1.875h-8.25ZM16.5 6.205v-2.83A.375.375 0 0 0 16.125 3h-8.25a.375.375 0 0 0-.375.375v2.83a49.353 49.353 0 0 1 9 0Zm-.217 8.265c.178.018.317.16.333.337l.526 5.784a.375.375 0 0 1-.374.409H7.232a.375.375 0 0 1-.374-.409l.526-5.784a.373.373 0 0 1 .333-.337 41.741 41.741 0 0 1 8.566 0Zm.967-3.97a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H18a.75.75 0 0 1-.75-.75V10.5ZM15 9.75a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75V10.5a.75.75 0 0 0-.75-.75H15Z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
                onClick={secondaryButtonAction}
              >
                Receipt
              </Button>
            )}
          </div>

          <Button
            onClick={() => setOpenModal(true)}
            className={`${
              !buttonText && "hidden"
            } rounded-xl w-max font-sen hover:!bg-blue-500 hover:!text-white`}
          >
            {buttonText}
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
};

export const TableHeader = ({ title }: { title: string }) => {
  return (
    <h3 className="font-bold text-slate-800 font-sen text-sm mb-2">{title}</h3>
  );
};
export const TableData = ({ text }: { text: string }) => {
  return <h3 className="font-sen text-slate-600 text-xs">{text}</h3>;
};

const AdminOperators: React.FC = () => {
  const actionData = useActionData();
  const { operator, user, products, operatorId, payments, stockHistory } =
    useLoaderData<{
      operator: OperatorInterface;
      user: AdminInterface;
      products: ProductInterface[];
      operatorId: string;
      payments: PaymentInterface[];
      stockHistory: any[];
    }>();

  const [stockHistoryData, setSetstockHistoryData] = useState(stockHistory);
  useEffect(() => {
    setSetstockHistoryData(stockHistory);
  }, [stockHistory]);

  const [paymentData, setPaymentData] = useState(payments);
  useEffect(() => {
    setPaymentData(payments);
  }, [payments]);

  const { Item } = Form;
  const { Option } = Select;
  const [createTransactionForm] = Form.useForm();
  const [openModal, setOpenModal] = useState(false);

  const [createStockForm] = Form.useForm();
  const [openStockModal, setOpenStockModal] = useState(false);

  // deletes
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openDeleteStockModal, setOpenDeleteStockModal] = useState(false);
  const [deleteOperatorStockForm] = Form.useForm();
  const [openDeleteTransaction, setOpenDeleteTransaction] = useState(false);
  const [deleteOperatorTransactionForm] = Form.useForm();

  // edits
  const [openEditStockModal, setOpenEditStockModal] = useState(false);
  const [editOperatorStockForm] = Form.useForm();
  const [openEditTransactionModal, setOpenEditTransactionModal] =
    useState(false);
  const [editTransactionForm] = Form.useForm();

  const [openEditModal, setEditOpenModal] = useState(false);
  const [editOperatorForm] = Form.useForm();

  const stockPrintoutRef = useRef<HTMLDivElement | null>(null);
  const paymentPrintoutRef = useRef<HTMLDivElement | null>(null);
  const handlePrint = useReactToPrint({
    content: () => stockPrintoutRef.current,
  });
  const handlePrintPayment = useReactToPrint({
    content: () => paymentPrintoutRef.current,
  });

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
    {
      title: <TableHeader title="Action" />,
      dataIndex: "action",
      key: "action",
      render: (text: string, record: any) => (
        <>
          {user.role === "admin" && (
            <div className="flex items-center gap-1">
              <Button
                type="text"
                className="flex items-center justify-center rounded-lg  px-2"
                onClick={() => {
                  setOpenEditTransactionModal(true);
                  editTransactionForm.setFieldsValue({
                    _id: record._id,
                    operatorId: operatorId,
                    transactionType: record.transactionType,
                    amount: record.amount,
                    description: record.description,
                  });
                }}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                    />
                  </svg>
                }
              />
              <Button
                type="text"
                className="flex items-center justify-center rounded-lg  px-2"
                danger
                onClick={() => {
                  setOpenDeleteTransaction(true);
                  deleteOperatorTransactionForm.setFieldsValue({
                    _id: record._id,
                    operatorId: operatorId,
                  });
                }}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                }
              />
            </div>
          )}
        </>
      ),
    },
  ];

  const columns = [
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
    {
      title: "Action",
      key: "action",
      render: (text: string, record: any) => (
        <>
          {user.role === "admin" && (
            <div className="flex items-center gap-1">
              <Button
                type="text"
                className="flex items-center justify-center rounded-lg  px-2"
                onClick={() => {
                  setOpenEditStockModal(true);
                  editOperatorStockForm.setFieldsValue({
                    _id: record._id,
                    operatorId: operatorId,
                    productId: record.product._id,
                    totalQuantity: record.totalQuantity,
                    commission: record.commission,
                    unitPrice: record.unitPrice,
                  });
                }}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                    />
                  </svg>
                }
              />
              <Button
                type="text"
                className="flex items-center justify-center rounded-lg  px-2"
                danger
                onClick={() => {
                  setOpenDeleteStockModal(true);
                  deleteOperatorStockForm.setFieldsValue({
                    _id: record._id,
                    operatorId: operatorId,
                  });
                }}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                }
              />
            </div>
          )}
        </>
      ),
    },
  ];

  useEffect(() => {
    setOpenModal(false);
  }, [actionData]);

  useEffect(() => {
    createTransactionForm.setFieldValue("operator", operatorId);
    createStockForm.setFieldValue("operator", operatorId);
    createStockForm.setFieldValue("actionType", "create_stock");
  }, []);

  return (
    <AdminLayout pageTitle="Operators Details" user={user}>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-full">
        <div className="flex flex-col gap-4 h-full lg:col-span-3">
          <Card title="Operator Details">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center bg-slate-300/30 rounded-full w-12 h-12">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-8 h-8 text-blue-500"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              <div className="flex flex-col flex-1">
                <h4 className="font-poppins text-slate-700 text-lg">
                  {operator?.fullName}
                </h4>
                <p className="font-quicksand text-sm text-slate-600 ">
                  Email: {operator.email && operator.email}
                </p>
                <p className="font-quicksand text-sm text-slate-600 ">
                  Phone No.: {operator.phone && operator.phone}
                </p>
              </div>
              <div className="flex-1">
                <p className="font-quicksand text-sm text-slate-700 ">
                  Balance: GH₵ {operator?.balance}
                </p>
              </div>
              <Button
                className="flex items-center justify-center font-sen text-blue-500 border-blue-500 hover:!text-white hover:!bg-blue-500 bg-blue-500/10 px-4 py-2 rounded-lg"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.875 1.5C6.839 1.5 6 2.34 6 3.375v2.99c-.426.053-.851.11-1.274.174-1.454.218-2.476 1.483-2.476 2.917v6.294a3 3 0 0 0 3 3h.27l-.155 1.705A1.875 1.875 0 0 0 7.232 22.5h9.536a1.875 1.875 0 0 0 1.867-2.045l-.155-1.705h.27a3 3 0 0 0 3-3V9.456c0-1.434-1.022-2.7-2.476-2.917A48.716 48.716 0 0 0 18 6.366V3.375c0-1.036-.84-1.875-1.875-1.875h-8.25ZM16.5 6.205v-2.83A.375.375 0 0 0 16.125 3h-8.25a.375.375 0 0 0-.375.375v2.83a49.353 49.353 0 0 1 9 0Zm-.217 8.265c.178.018.317.16.333.337l.526 5.784a.375.375 0 0 1-.374.409H7.232a.375.375 0 0 1-.374-.409l.526-5.784a.373.373 0 0 1 .333-.337 41.741 41.741 0 0 1 8.566 0Zm.967-3.97a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H18a.75.75 0 0 1-.75-.75V10.5ZM15 9.75a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75V10.5a.75.75 0 0 0-.75-.75H15Z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
                onClick={handlePrint}
              >
                Invoice
              </Button>
            </div>
          </Card>

          <Card
            title="Stock History"
            buttonText="New Stock"
            classNames="flex-1 h-full overflow-y-auto"
            setOpenModal={setOpenStockModal}
            openModal={openStockModal}
            hasDatePicker={true}
            onDateChange={async (date, dateString) => {
              try {
                const from = dateString[0];
                const to = dateString[1];

                const response = await axios.get(
                  `/api/stock/operator?operatorId=${operatorId}&from=${from}&to=${to}`
                );
                if (from && to) {
                  setSetstockHistoryData(response.data);
                } else {
                  setSetstockHistoryData(stockHistory);
                }
              } catch (e: any) {
                console.log(e.message);
              }
            }}
          >
            <Table
              columns={columns}
              dataSource={stockHistoryData}
              pagination={false}
              rowKey={(record) => record._id}
              className="h-[54vh] overflow-y-auto"
            />
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card
            title="Financial History"
            buttonText="New Transaction"
            openModal={openDeleteModal}
            setOpenModal={setOpenModal}
            classNames="h-full ovelflow-y-auto"
            hasDatePicker={true}
            onDateChange={async (date, dateString) => {
              try {
                const from = dateString[0];
                const to = dateString[1];

                const response = await axios.get(
                  `/api/payment/operator?operatorId=${operatorId}&from=${from}&to=${to}`
                );
                if (from && to) {
                  setPaymentData(response.data);
                } else {
                  setPaymentData(payments);
                }
              } catch (e: any) {
                console.log(e.message);
              }
            }}
            secondaryButton={true}
            secondaryButtonAction={handlePrintPayment}
          >
            <Table
              columns={paymentColumns}
              dataSource={paymentData}
              pagination={false}
              rowKey={(record) => record._id}
              className="h-[76vh] overflow-y-auto"
            />
          </Card>
        </div>
      </div>

      {/* Create Transaction Modal */}
      <CreateModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        title="New Transaction"
        formType={createTransactionForm}
      >
        <Item className="hidden" name={"operator"} label="OperatorID">
          <Input className="hidden" value={operatorId} />
        </Item>

        <Item
          label={"Transaction type"}
          name={"transactionType"}
          rules={[
            {
              required: true,
              message: (
                <p className="font-quicksand text-red-500 text-sm">
                  Transaction type is required
                </p>
              ),
            },
          ]}
        >
          <Select>
            <Option value="payout">Payout</Option>
            <Option value="loan">Loan</Option>
          </Select>
        </Item>

        <Item
          label={"Amount"}
          name={"amount"}
          rules={[
            {
              required: true,
              message: (
                <p className="font-quicksand text-red-500 text-sm">
                  Amount is required
                </p>
              ),
            },
          ]}
        >
          <Input type="number" />
        </Item>

        <Item
          label={"Description"}
          name={"description"}
          rules={[
            {
              required: true,
              message: (
                <p className="font-quicksand text-red-500 text-sm">
                  Description is required
                </p>
              ),
            },
          ]}
        >
          <Input.TextArea></Input.TextArea>
        </Item>
      </CreateModal>

      {/* Create Stock Modal */}
      <CreateModal
        openModal={openStockModal}
        setOpenModal={setOpenStockModal}
        title="New Stock"
        formType={createStockForm}
      >
        <Item className="hidden" name={"operator"} label="OperatorID">
          <Input className="hidden" />
        </Item>
        <Item className="hidden" name={"actionType"} label="actionType">
          <Input className="hidden" />
        </Item>

        <Item name={"productId"} label="Product Name">
          <Select
            allowClear
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
            }
            placeholder="Search products"
            options={products.map((product) => ({
              label: product.name,
              value: product._id,
            }))}
            onChange={(value) => console.log(value)}
          />
        </Item>

        <Item name={"totalQuantity"} label={"Total Quantity"}>
          <Input
            type="number"
            onChange={(e: any) => {
              createStockForm.setFieldValue(
                "quantityPayable",
                e.target.value - createStockForm.getFieldValue("commission")
              );
              createStockForm.setFieldValue(
                "amountPayable",
                createStockForm.getFieldValue("unitPrice") *
                  (e.target.value - createStockForm.getFieldValue("commission"))
              );
            }}
          />
        </Item>

        <Item name={"commission"} label={"Commission"}>
          <Input
            type="number"
            onChange={(e: any) =>
              createStockForm.setFieldValue(
                "quantityPayable",
                createStockForm.getFieldValue("totalQuantity") - e.target.value
              )
            }
          />
        </Item>
        <Item name={"unitPrice"} label={"Unit Price"}>
          <Input
            type="number"
            onChange={(e: any) =>
              createStockForm.setFieldValue(
                "amountPayable",
                e.target.value *
                  createStockForm.getFieldValue("quantityPayable")
              )
            }
          />
        </Item>
        <Item name={"quantityPayable"} label={"Quantity Payable"}>
          <Input type="number" disabled />
        </Item>
        <Item name={"amountPayable"} label={"Amount Payable"}>
          <Input type="number" disabled />
        </Item>
      </CreateModal>

      {/* Edit Stock Modal */}
      <EditItemModal
        openModal={openEditStockModal}
        setOpenModal={setOpenEditStockModal}
        title="Edit Stock"
        formType={editOperatorStockForm}
        actionType="editStock"
      >
        <Item className="hidden" name={"_id"} label="ID">
          <Input className="hidden" />
        </Item>

        <Item className="hidden" name={"operatorId"} label="Operator ID">
          <Input className="hidden" />
        </Item>

        <Item name={"productId"} label="Product Name">
          <Select
            allowClear
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
            }
            placeholder="Search products"
            options={products.map((product) => ({
              label: product.name,
              value: product._id,
            }))}
            onChange={(value) => console.log(value)}
          />
        </Item>

        <Item name={"totalQuantity"} label={"Total Quantity"}>
          <Input type="number" />
        </Item>

        <Item name={"commission"} label={"Commission"}>
          <Input type="number" />
        </Item>
        <Item name={"unitPrice"} label={"Unit Price"}>
          <Input type="number" />
        </Item>
      </EditItemModal>

      {/* Edit Transaction Modal */}
      <EditItemModal
        openModal={openEditTransactionModal}
        setOpenModal={setOpenEditTransactionModal}
        title="Edit Transaction"
        formType={editTransactionForm}
        actionType="editTransaction"
      >
        <Item className="hidden" name={"_id"} label="ID">
          <Input className="hidden" />
        </Item>

        <Item className="hidden" name={"operatorId"} label="Operator ID">
          <Input className="hidden" />
        </Item>

        <Item
          label={"Transaction type"}
          name={"transactionType"}
          rules={[
            {
              required: true,
              message: (
                <p className="font-quicksand text-red-500 text-sm">
                  Transaction type is required
                </p>
              ),
            },
          ]}
        >
          <Select>
            <Option value="payout">Payout</Option>
            <Option value="loan">Loan</Option>
          </Select>
        </Item>

        <Item
          label={"Amount"}
          name={"amount"}
          rules={[
            {
              required: true,
              message: (
                <p className="font-quicksand text-red-500 text-sm">
                  Amount is required
                </p>
              ),
            },
          ]}
        >
          <Input type="number" />
        </Item>

        <Item
          label={"Description"}
          name={"description"}
          rules={[
            {
              required: true,
              message: (
                <p className="font-quicksand text-red-500 text-sm">
                  Description is required
                </p>
              ),
            },
          ]}
        >
          <Input.TextArea></Input.TextArea>
        </Item>
      </EditItemModal>

      {/* Delete Stock Modal */}
      <DeleteItemModal
        openModal={openDeleteStockModal}
        setOpenModal={setOpenDeleteStockModal}
        title="Delete Stock"
        formType={deleteOperatorStockForm}
        actionType="deleteStock"
      >
        <Item className="hidden" name={"_id"} label="ID">
          <Input className="hidden" />
        </Item>

        <Item className="hidden" name={"operatorId"} label="Operator ID">
          <Input className="hidden" />
        </Item>

        <p className="font-sen text-lg text-slate-800">
          Are you sure to delete this payment?
        </p>
      </DeleteItemModal>

      {/* Delete Transaction Modal */}
      <DeleteItemModal
        openModal={openDeleteTransaction}
        setOpenModal={setOpenDeleteTransaction}
        title="Delete Transaction"
        formType={deleteOperatorTransactionForm}
        actionType="deleteTransaction"
      >
        <Item className="hidden" name={"_id"} label="ID">
          <Input className="hidden" />
        </Item>

        <Item className="hidden" name={"operatorId"} label="Operator ID">
          <Input className="hidden" />
        </Item>

        <p className="font-sen text-lg text-slate-800">
          Are you sure to delete this transaction?
        </p>
      </DeleteItemModal>

      <StockInvoice
        stockItems={stockHistoryData}
        user={user}
        printoutRef={stockPrintoutRef}
        operatorName={operator.fullName}
      />

      <OperatorReceipt
        printoutRef={paymentPrintoutRef}
        stockData={stockHistoryData}
        paymentData={paymentData}
        user={user}
        operatorName={operator.fullName}
      />
    </AdminLayout>
  );
};

export default AdminOperators;

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const actionType = formData.get("actionType") as string;

  const id = formData.get("_id") as string;

  const description = formData.get("description") as string;
  const transactionType = formData.get("transactionType") as string;
  const paymentMethod = formData.get("paymentMethod") as string;

  const operator = formData.get("operator") as string;
  const productId = formData.get("productId") as string;
  const totalQuantity = formData.get("totalQuantity") as string;
  const commission = formData.get("commission") as string;
  const unitPrice = formData.get("unitPrice") as string;
  const quantityPayable = formData.get("quantityPayable") as string;
  const amountPayable = formData.get("amountPayable") as string;
  const paymentId = formData.get("paymentId") as string;

  const amount = formData.get("amount") as string;

  const paymentController = await new PaymentController(request);
  const operatorController = await new OperatorController(request);
  if (actionType == "editStock") {
    return await operatorController.editStock({
      id,
      productId,
      totalQuantity,
      commission,
      unitPrice,
      quantityPayable,
      amountPayable,
    });
  } else if (actionType == "deleteStock") {
    return await operatorController.deleteStock(id);
  } else if (actionType === "create_stock") {
    return await operatorController.createStock({
      operator,
      productId,
      totalQuantity,
      commission,
      unitPrice,
      amountPayable,
    });
  } else if (actionType == "deleteTransaction") {
    return await paymentController.deleteOperatorTransaction(id);
  } else if (actionType == "editTransaction") {
    return await paymentController.editOperatorTransaction({
      id,
      amount,
      transactionType,
      description,
    });
  } else {
    return await paymentController.createOperatorTransaction({
      operator,
      amount,
      transactionType,
      description,
    });
  }
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { operatorId } = params;

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") as string) || 1;
  const search_term = url.searchParams.get("search_term") as string;
  const from = url.searchParams.get("from") as string;
  const to = url.searchParams.get("to") as string;

  const adminControlle = await new AdminController(request);
  await adminControlle.requireAdminId();
  const user = await adminControlle.getAdmin();

  const operatorController = await new OperatorController(request);
  const operator = await operatorController.getOperator(operatorId as string);

  const productController = await new ProductController(request);
  const { products, totalPages } = await productController.getProducts({
    search_term,
    page,
  });

  const paymentController = await new PaymentController(request);
  const payments = await paymentController.getOperatorPayments({
    operatorId: operatorId as string,
    from,
    to,
  });
  const stockHistory = await operatorController.getOperatorStocks({
    operatorId: operatorId as string,
    from,
    to,
  });

  return {
    user,
    operator,
    products,
    totalPages,
    operatorId,
    payments,
    stockHistory,
  };
};

export const meta: MetaFunction = () => {
  return [
    { title: "Operator Details | Linakess" },
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
