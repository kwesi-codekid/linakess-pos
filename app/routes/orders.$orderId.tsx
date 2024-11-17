/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/prop-types */
import { useActionData, useLoaderData } from "@remix-run/react";
import { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { Table, Button, Form, Input, Select } from "antd";
import { useEffect, useRef, useState } from "react";
import pkg from "react-to-print";
const { useReactToPrint } = pkg;

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
import OrderInvoice from "~/components/printouts/OrderInvoice";
import Receipt from "~/components/printouts/Receipt";
import DeleteItemModal from "~/components/modals/DeleteItemModal";
import { set } from "mongoose";
import EditItemModal from "~/components/modals/EditItemModal";

interface CardProps {
  title: string;
  children: React.ReactNode;
  buttonText?: string;
  openModal?: boolean;
  setOpenModal?: (value: boolean) => void;
  classNames?: string;
  secondaryButton?: boolean;
  secondaryButtonAction?: () => void;
}
export const Card: React.FC<CardProps> = ({
  title,
  children,
  buttonText,
  classNames,
  setOpenModal,
  openModal,
  secondaryButton,
  secondaryButtonAction,
}) => {
  return (
    <div
      className={`bg-white shadow-2xl shadow-black/10 rounded-lg p-4 ${classNames}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold font-sen text-xl mb-2">{title}</h3>

        <div className="flex items-center gap-2">
          {secondaryButton && (
            <Button
              className="flex items-center justify-center font-sen text-blue-500 border-blue-500 hover:!text-white hover:bg-blue-500 bg-blue-500/10 px-4 py-2 rounded-lg"
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
          <Button
            onClick={() => setOpenModal(true)}
            className={`${
              !buttonText && "hidden"
            } rounded-xl font-sen bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-xs`}
            type="primary"
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
  const { user, order, orderId, payments } = useLoaderData<{
    user: AdminInterface;
    order: OrderInterface[];
    orderId: string;
    payments: PaymentInterface[];
  }>();

  const [orderData, setOrderData] = useState(order);
  const [paymentData, setPaymentData] = useState(payments);

  useEffect(() => {
    setOrderData(order);
  }, [order]);

  useEffect(() => {
    setPaymentData(payments);
  }, [payments]);

  const { Item } = Form;
  const { Option } = Select;
  const [createTransactionForm] = Form.useForm();
  const [openModal, setOpenModal] = useState(false);

  const [openStockModal, setOpenStockModal] = useState(false);

  const [openDeleteOrderItemModal, setOpenDeleteOrderItemModal] =
    useState(false);
  const [openDeletePaymentModal, setOpenDeletePaymentModal] = useState(false);
  const [deleteOrderItemForm] = Form.useForm();
  const [deletePaymentForm] = Form.useForm();
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [openEditModal, setEditOpenModal] = useState(false);
  const [openEditPaymentModal, setEditPaymentModal] = useState(false);
  const [editPaymentForm] = Form.useForm();
  const [editOrderItemForm] = Form.useForm();

  const orderPrintoutRef = useRef<HTMLDivElement | null>(null);
  const paymentPrintoutRef = useRef<HTMLDivElement | null>(null);
  const handlePrint = useReactToPrint({
    content: () => orderPrintoutRef.current,
  });

  const handlePaymentPrint = useReactToPrint({
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
      title: "Action",
      key: "action",
      render: (text: string, record: any) => (
        <>
          {user.role === "admin" && (
            <div className="flex items-center gap-2">
              <Button
                className="font-sen"
                onClick={() => {
                  setEditPaymentModal(true);
                  editPaymentForm.setFieldsValue({
                    _id: orderId,
                    paymentId: record._id,
                    amount: record.amount,
                    description: record.description,
                  });
                }}
              >
                Edit
              </Button>
              <Button
                className="rounded-lg hover:bg-red-500 hover:!text-white font-sen"
                danger
                onClick={() => {
                  setOpenDeletePaymentModal(true);
                  deletePaymentForm.setFieldsValue({
                    _id: orderId,
                    paymentId: record._id,
                  });
                }}
              >
                Delete
              </Button>
            </div>
          )}
          ,
        </>
      ),
    },
  ];

  const columns = [
    {
      title: <TableHeader title="Product" />,
      dataIndex: "product",
      key: "product",
      render: (text: string, record: any) => (
        <TableData text={record?.productName} />
      ),
    },
    {
      title: <TableHeader title="Unit Price" />,
      dataIndex: "price",
      key: "price",
      render: (text: string) => (
        <TableData text={"GH₵ " + parseFloat(text).toFixed(2)} />
      ),
    },
    {
      title: <TableHeader title="Quantity" />,
      dataIndex: "quantity",
      key: "quantity",
      render: (text: string) => <TableData text={text} />,
    },
    {
      title: <TableHeader title="Total" />,
      dataIndex: "quantity",
      key: "total",
      render: (text: string, record: any) => (
        <TableData
          text={
            "GH₵ " + (parseFloat(text) * parseFloat(record.price)).toFixed(2)
          }
        />
      ),
    },
    {
      title: <TableHeader title="Description" />,
      dataIndex: "description",
      key: "description",
      render: (text: string) => <TableData text={text} />,
    },
    {
      title: "Action",
      key: "action",
      render: (text: string, record: any) => (
        <>
          {user.role === "admin" && (
            <div className="flex items-center gap-2">
              <Button
                disabled={user.role !== "admin"}
                className="font-sen"
                onClick={() => {
                  setEditOpenModal(true);
                  editOrderItemForm.setFieldsValue({
                    ...record,
                    _id: orderId,
                    itemId: record?._id,
                  });
                }}
              >
                Edit
              </Button>
              <Button
                className="rounded-lg hover:bg-red-500 hover:!text-white font-sen"
                danger
                onClick={() => {
                  setOpenDeleteOrderItemModal(true);
                  deleteOrderItemForm.setFieldsValue({
                    _id: orderId,
                    itemId: record._id,
                  });
                }}
              >
                Delete
              </Button>
            </div>
          )}
        </>
      ),

      // );
    },
  ];

  useEffect(() => {
    setOpenModal(false);
  }, [actionData]);

  // set customer id and order id
  createTransactionForm.setFieldsValue({
    customer: order.customer._id,
    orderId: orderId,
  });

  return (
    <AdminLayout pageTitle="Order Details" user={user}>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-full">
        <div className="flex flex-col gap-4 h-full lg:col-span-3">
          <Card title="Customer Details">
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
                  {order.customer.fullName}
                </h4>
                <p className="font-quicksand text-sm text-slate-600 ">
                  Email: {order.customer.email && order.customer.email}
                </p>
                <p className="font-quicksand text-sm text-slate-600 ">
                  Phone No.: {order.customer.phone && order.customer.phone}
                </p>
              </div>

              <div className="flex-1">
                <p className="font-quicksand text-sm text-slate-700 ">
                  Total Amount: GH₵ {order.totalPrice}
                </p>
                <p className="font-quicksand text-sm text-slate-700 ">
                  Amount Paid: GH₵ {order.amountPaid}
                </p>
                <p className="font-quicksand text-sm text-slate-700 ">
                  Balance: GH₵ {order.totalPrice - order.amountPaid}
                </p>
              </div>

              <Button
                className="flex items-center justify-center font-sen text-blue-500 border-blue-500 hover:!text-white hover:bg-blue-500 bg-blue-500/10 px-4 py-2 rounded-lg"
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
            title="Order Items"
            classNames="flex-1 h-full overflow-y-auto"
            setOpenModal={setOpenStockModal}
            openModal={openStockModal}
          >
            <Table
              columns={columns}
              dataSource={orderData?.items}
              pagination={false}
              rowKey={(record) => record._id}
              className="h-[54vh] overflow-y-auto"
            />
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card
            title="Payment History"
            buttonText="New Payment"
            openModal={openDeleteModal}
            setOpenModal={setOpenModal}
            classNames="h-full ovelflow-y-auto"
            secondaryButton={true}
            secondaryButtonAction={handlePaymentPrint}
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

      {/* Delete Order Item Modal */}
      <DeleteItemModal
        openModal={openDeleteOrderItemModal}
        setOpenModal={setOpenDeleteOrderItemModal}
        title="Delete Order Item"
        formType={deleteOrderItemForm}
        actionType="deleteItem"
      >
        <p>Are you sure to delete this payment?</p>
        <Item className="hidden" name={"_id"} label="ID">
          <Input className="hidden" />
        </Item>
        <Item className="hidden" name={"itemId"} label="ID">
          <Input className="hidden" />
        </Item>
      </DeleteItemModal>

      {/* Delete Order Payment Modal */}
      <DeleteItemModal
        openModal={openDeletePaymentModal}
        setOpenModal={setOpenDeletePaymentModal}
        title="Delete Payment"
        formType={deletePaymentForm}
        actionType="deletePayment"
      >
        <p>Are you sure to delete?</p>
        <Item className="hidden" name={"_id"} label="ID">
          <Input className="hidden" />
        </Item>
        <Item className="hidden" name={"paymentId"} label="ID">
          <Input className="hidden" />
        </Item>
      </DeleteItemModal>

      {/* Edit Order Item Modal */}
      <EditItemModal
        openModal={openEditModal}
        setOpenModal={setEditOpenModal}
        title="Edit Order Item"
        formType={editOrderItemForm}
        actionType="editOrderItem"
      >
        <Item name={"_id"} className="hidden">
          <Input className="hidden" />
        </Item>
        <Item name={"itemId"} className="hidden">
          <Input className="hidden" />
        </Item>
        <Item label="Product Name" name={"productName"}>
          <Input type="text" />
        </Item>

        <Item label="Quantity" name={"quantity"}>
          <Input type="number" />
        </Item>

        <Item label="Price" name={"price"}>
          <Input type="number" />
        </Item>

        <Item label="Description" name={"description"}>
          <Input.TextArea></Input.TextArea>
        </Item>
      </EditItemModal>

      {/* Edit Order Payment */}
      <EditItemModal
        openModal={openEditPaymentModal}
        setOpenModal={setEditPaymentModal}
        title="Edit Payment"
        formType={editPaymentForm}
        actionType="editPayment"
      >
        <Item name={"_id"} className="hidden">
          <Input className="hidden" />
        </Item>
        <Item name={"paymentId"} className="hidden">
          <Input className="hidden" />
        </Item>
        <Item label="Amount" name={"amount"}>
          <Input type="number" />
        </Item>

        <Item label="Description" name={"description"}>
          <Input.TextArea></Input.TextArea>
        </Item>
      </EditItemModal>

      {/* Create Transaction Modal */}
      <CreateModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        title="New Payment"
        formType={createTransactionForm}
      >
        <Item className="hidden" name={"customer"} label="CustomerID">
          <Input className="hidden" />
        </Item>

        <Item className="hidden" name={"orderId"} label="CustomerID">
          <Input className="hidden" />
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

        <Item label={"Description"} name={"description"}>
          <Input.TextArea></Input.TextArea>
        </Item>
      </CreateModal>

      <OrderInvoice
        orderData={order}
        user={user}
        printoutRef={orderPrintoutRef}
      />

      <Receipt
        orderData={order}
        printoutRef={paymentPrintoutRef}
        paymentData={payments}
        user={user}
      />
    </AdminLayout>
  );
};

export default AdminOperators;

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const actionType = formData.get("actionType") as string;

  const id = formData.get("_id") as string;
  const itemId = formData.get("itemId") as string;
  const description = formData.get("description") as string;
  const customer = formData.get("customer") as string;
  const orderId = formData.get("orderId") as string;
  const amount = formData.get("amount") as string;
  const paymentId = formData.get("paymentId") as string;

  const orderController = await new OrderController(request);
  const operatorController = await new OperatorController(request);
  const paymentController = await new PaymentController(request);

  if (actionType == "deleteItem") {
    return await orderController.deleteOrderItem({ itemId, id });
  } else if (actionType === "editOrderItem") {
    const productName = formData.get("productName") as string;
    const quantity = formData.get("quantity") as string;
    const price = formData.get("price") as string;
    const description = formData.get("description") as string;

    return await orderController.editOrderItem({
      itemId,
      id,
      productName,
      quantity,
      price,
      description,
    });
  } else if (actionType === "editPayment") {
    const description = formData.get("description") as string;
    const paymentId = formData.get("paymentId") as string;

    return await paymentController.editCustomerTransaction({
      id,
      paymentId,
      customer,
      amount,
      description,
    });
  } else if (actionType == "deletePayment") {
    return await paymentController.deleteCustomerTransaction({ id, paymentId });
  } else {
    return await paymentController.createCustomerTransaction({
      customer,
      amount,
      transactionType: "payout",
      description,
      orderId,
    });
  }
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { orderId } = params;

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") as string) || 1;
  const search_term = url.searchParams.get("search_term") as string;

  const adminControlle = await new AdminController(request);
  await adminControlle.requireAdminId();
  const user = await adminControlle.getAdmin();

  const paymentController = await new PaymentController(request);
  const payments = await paymentController.getaymentsByOrderId(
    orderId as string
  );

  const orderController = await new OrderController(request);
  const order = await orderController.getOrder({ orderId: orderId as string });

  return {
    user,
    // totalPages,
    orderId,
    payments,
    order,
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
