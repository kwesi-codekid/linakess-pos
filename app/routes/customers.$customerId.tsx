/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/prop-types */
import { useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { Table, Button, Form, Input, Select, DatePicker } from "antd";
import { useEffect, useRef, useState } from "react";
import pkg from "react-to-print";
const { useReactToPrint } = pkg;
import axios from "axios";

import AdminLayout from "~/layouts/adminLayout";
import AdminController from "~/controllers/AdminController.server";

import CreateModal from "~/components/modals/CreateModal";
import EditModal from "~/components/modals/EditModal";
import DeleteModal from "~/components/modals/DeleteModal";

import OperatorController from "~/controllers/OperatorController.server";
import {
  AdminInterface,
  CustomerInterface,
  OperatorInterface,
  OrderInterface,
  PaymentInterface,
  ProductInterface,
} from "~/types";
import ProductController from "~/controllers/ProductController.server";
import PaymentController from "~/controllers/PaymentController";
import CustomerController from "~/controllers/CustomerController.server";
import OrderController from "~/controllers/OrderController.server";

interface CardProps {
  title: string;
  children: React.ReactNode;
  hideButton?: boolean;
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
  hideButton,
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
  const { user, customer, payments, orders } = useLoaderData<{
    user: AdminInterface;
    customer: CustomerInterface[];
    payments: PaymentInterface[];
    orders: OrderInterface[];
  }>();

  const navigate = useNavigate();

  const { Item } = Form;
  const { Option } = Select;
  const [createTransactionForm] = Form.useForm();
  const [openModal, setOpenModal] = useState(false);

  const [createStockForm] = Form.useForm();
  const [openStockModal, setOpenStockModal] = useState(false);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteOperatorForm] = Form.useForm();

  const [openEditModal, setEditOpenModal] = useState(false);
  const [editOperatorForm] = Form.useForm();

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
      title: <TableHeader title="Amount" />,
      dataIndex: "amount",
      key: "amount",
      render: (text: string) => (
        <TableData text={"GH₵ " + parseFloat(text).toFixed(2)} />
      ),
    },
    {
      title: <TableHeader title="For Invoice" />,
      dataIndex: "order",
      key: "order",
      render: (text: string, record: any) => (
        <TableData text={record.order.orderId} />
      ),
    },
    {
      title: <TableHeader title="Cashier" />,
      dataIndex: "user",
      key: "user",
      render: (text: string, record: AdminInterface) => (
        <TableData text={record.user.username} />
      ),
    },
  ];

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
      title: <TableHeader title="Invoice#" />,
      dataIndex: "orderId",
      key: "orderId",
      render: (text: string) => <TableData text={text} />,
    },

    {
      title: <TableHeader title="Total Amt" />,
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (text: string) => (
        <TableData text={"GH₵ " + parseFloat(text).toFixed(2)} />
      ),
    },
    {
      title: <TableHeader title="Amt Paid" />,
      dataIndex: "amountPaid",
      key: "amountPaid",
      render: (text: string) => (
        <TableData text={"GH₵ " + parseFloat(text).toFixed(2)} />
      ),
    },
    {
      title: <TableHeader title="Balance" />,
      dataIndex: "balance",
      key: "balance",
      render: (text: string) => (
        <TableData text={"GH₵ " + parseFloat(text).toFixed(2)} />
      ),
    },
    {
      title: <TableHeader title="Action" />,
      dataIndex: "action",
      key: "action",
      render: (text: string, record: OrderInterface) => (
        <Button
          size="small"
          className="flex items-center justify-center font-sen text-blue-500 border-blue-500 hover:!text-white hover:!bg-blue-500 bg-blue-500/10 px-4 py-2 rounded-lg"
          onClick={() => navigate(`/orders/${record._id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  useEffect(() => {
    setOpenModal(false);
  }, [actionData]);

  useEffect(() => {
    // createTransactionForm.setFieldValue("operator", operatorId);
    // createStockForm.setFieldValue("operator", operatorId);
    createStockForm.setFieldValue("actionType", "create_stock");
  }, []);

  return (
    <AdminLayout pageTitle="Customer Details" user={user}>
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
                  {customer?.fullName}
                </h4>
                <p className="font-quicksand text-sm text-slate-600 ">
                  Email: {customer.email && customer.email}
                </p>
                <p className="font-quicksand text-sm text-slate-600 ">
                  Phone No.: {customer.phone && customer.phone}
                </p>
              </div>
              <div className="flex-1">
                <p className="font-quicksand text-sm text-slate-700 ">
                  Balance: GH₵ {customer?.balance}
                </p>
              </div>
              {/* <Button
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
                // onClick={handlePrint}
              >
                Invoice
              </Button> */}
            </div>
          </Card>

          <Card
            title="Order History"
            buttonText=""
            openModal={openModal}
            setOpenModal={setOpenModal}
            classNames="h-full overflow-y-auto"
          >
            <Table
              columns={orderColumns}
              dataSource={orders}
              pagination={false}
              rowKey={(record) => record._id}
              className="h-[76vh] overflow-y-auto"
            />
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card
            title="Payment History"
            buttonText=""
            openModal={openDeleteModal}
            setOpenModal={setOpenModal}
            classNames="h-full ovelflow-y-auto"
            hasDatePicker={false}
            secondaryButton={false}
            // secondaryButtonAction={handlePrintPayment}
          >
            <Table
              columns={paymentColumns}
              dataSource={payments}
              pagination={false}
              rowKey={(record) => record._id}
              className="h-[76vh] overflow-y-auto"
            />
          </Card>
        </div>
      </div>
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

  const amount = formData.get("amount") as string;

  const operatorController = await new OperatorController(request);
  if (actionType === "edit") {
    return await operatorController.updateOperator({
      fullName,
      email,
      phone,
      id,
    });
  } else if (actionType === "delete") {
    return await operatorController.deleteOperator(id);
  } else if (actionType === "create_stock") {
    return await operatorController.createStock({
      operator,
      productId,
      totalQuantity,
      commission,
      unitPrice,
      quantityPayable,
      amountPayable,
    });
  } else {
    const paymentController = await new PaymentController(request);
    return await paymentController.createOperatorTransaction({
      operator,
      amount,
      transactionType,
      description,
    });
  }
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { customerId } = params;

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") as string) || 1;
  const search_term = url.searchParams.get("search_term") as string;

  const adminControlle = await new AdminController(request);
  await adminControlle.requireAdminId();
  const user = await adminControlle.getAdmin();

  const paymentController = await new PaymentController(request);
  const payments = await paymentController.getCustomerPayments({
    customerId: customerId as string,
  });

  const orderController = await new OrderController(request);
  const orders = await orderController.getCustomerOrders({
    customerId: customerId as string,
  });

  const customerController = await new CustomerController(request);
  const customer = await customerController.getCustomer(customerId as string);

  return {
    user,
    customer,
    customerId,
    payments,
    orders,
  };
};

export const meta: MetaFunction = () => {
  return [
    { title: "Customer Details | Linakess" },
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
