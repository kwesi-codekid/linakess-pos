/* eslint-disable @typescript-eslint/no-explicit-any */
import { useActionData, useLoaderData } from "@remix-run/react";
import { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { Table, Button, Form, Input, Drawer } from "antd";
import { useEffect, useState, useRef } from "react";

import pkg from "react-to-print";
const { useReactToPrint } = pkg;

import AdminLayout from "~/layouts/adminLayout";
import AdminController from "~/controllers/AdminController.server";

import CreateModal from "~/components/modals/CreateModal";
import EditModal from "~/components/modals/EditModal";
import DeleteModal from "~/components/modals/DeleteModal";
import RepaymentModal from "~/components/modals/RepaymentModal";

import SalesReceipt from "~/components/printouts/SalesReceipt";

import { OrderInterface } from "~/types";
import OrderController from "~/controllers/OrderController.server";

const DataRow = ({ title, value }: { title: string; value: any }) => {
  return (
    <div className="flex justify-between items-center my-2">
      <p className="font-sen font-semibold text-sm text-slate-700">{title}</p>
      <p className="font-sen text-sm text-slate-800">
        {
          // if is number, format to 2 decimal places
          typeof value === "number"
            ? "GH₵ " + value?.toFixed(2)
            : value?.toUpperCase()
        }
      </p>
    </div>
  );
};

const AdminOrder: React.FC = () => {
  const actionData = useActionData();
  const { orders, user } = useLoaderData<{ orders: OrderInterface[] }>();
  const { Item } = Form;
  const [createCategoryForm] = Form.useForm();
  const [openModal, setOpenModal] = useState(false);

  const [repaymentForm] = Form.useForm();
  const [openRepaymentModal, setOpenRepaymentModal] = useState(false);

  const receiptRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
  });

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteCustomerForm] = Form.useForm();

  const [openEditModal, setEditOpenModal] = useState(false);
  const [editCustomerForm] = Form.useForm();

  const [openViewDrawer, setOpenViewDrawer] = useState(false);
  const [selectedSale, setSelectedSale] = useState<OrderInterface | null>(null);

  const [filteredList, setFilteredList] = useState(orders);
  useEffect(() => {
    setFilteredList(orders);
  }, [orders, openRepaymentModal]);

  const columns = [
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
      key: "invoice_code",
      render: (text: string) => <p>{text.toUpperCase()}</p>,
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
      render: (text: string, record: any) => (
        <p>{record?.customer?.fullName}</p>
      ),
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
    {
      title: "Action",
      key: "action",
      render: (text: string, record: any) => (
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              repaymentForm.setFieldsValue({
                _id: record._id,
              });
              setOpenRepaymentModal(true);
            }}
            type="primary"
            className="rounded-lg hover:!bg-green-500 hover:!text-white border-green-500 text-green-500 font-sen"
          >
            Repayment
          </Button>
          <Button
            onClick={() => {
              setSelectedSale(record);
              setOpenViewDrawer(true);
            }}
          >
            View
          </Button>
          {user.role === "admin" && (
            <Button
              className="rounded-lg hover:bg-red-500 hover:!text-white"
              danger
              onClick={() => {
                setOpenDeleteModal(true);
                deleteCustomerForm.setFieldsValue(record);
              }}
            >
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  useEffect(() => {
    setOpenModal(false);
  }, [actionData]);

  return (
    <AdminLayout pageTitle="Sales" user={user}>
      {/* search bar only */}
      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Search for customer or invoice code"
          className="w-full md:w-1/4"
          onChange={(e) => {
            const searchTerm = e.target.value.toLowerCase();
            if (searchTerm === "") {
              setFilteredList(orders);
            } else {
              const filtered = orders.filter(
                (order) =>
                  order.customer?.fullName.toLowerCase().includes(searchTerm) ||
                  order.orderId.toLowerCase().includes(searchTerm)
              );
              setFilteredList(filtered);
            }
          }}
        />
      </div>

      <div className="flex-1">
        <Table
          dataSource={filteredList}
          columns={columns}
          className="overflow-y-auto lg:h-[80vh]"
          rowKey={(record) => record._id}
        />
      </div>

      {/* Repayment modal */}
      <RepaymentModal
        openModal={openRepaymentModal}
        setOpenModal={() => setOpenRepaymentModal(false)}
        title="Repayment"
        formType={repaymentForm}
      >
        <Item className="hidden" name={"_id"}>
          <Input type="text" />
        </Item>
        <Item
          label="Amount"
          name={"amount"}
          hasFeedback
          rules={[{ required: true }]}
        >
          <Input type="number" />
        </Item>
      </RepaymentModal>

      {/* Create Modal */}
      <CreateModal
        openModal={openModal}
        setOpenModal={() => setOpenModal(false)}
        title="Add New Customer"
        formType={createCategoryForm}
      >
        <Item
          label="Customer Name"
          name={"fullName"}
          hasFeedback
          rules={[{ required: true }]}
        >
          <Input type="text" />
        </Item>

        <Item
          label="Phone Number"
          name={"phone"}
          hasFeedback
          rules={[{ required: true }, { min: 10 }, { max: 10 }]}
        >
          <Input type="text" />
        </Item>

        <Item label="Email" name={"email"}>
          <Input type="email" />
        </Item>
      </CreateModal>

      {/* Edit Modal */}
      <EditModal
        openModal={openEditModal}
        setOpenModal={() => setEditOpenModal(false)}
        title="Edit Customer"
        formType={editCustomerForm}
      >
        <Item className="hidden" name={"_id"}>
          <Input type="text" />
        </Item>
        <Item
          label="Customer Name"
          name={"fullName"}
          hasFeedback
          rules={[{ required: true }]}
        >
          <Input type="text" />
        </Item>

        <Item
          label="Phone Number"
          name={"phone"}
          hasFeedback
          rules={[{ required: true }, { min: 10 }, { max: 10 }]}
        >
          <Input type="text" />
        </Item>

        <Item label="Email" name={"email"}>
          <Input type="email" />
        </Item>
      </EditModal>

      {/* Delete Modal */}
      <DeleteModal
        openModal={openDeleteModal}
        setOpenModal={() => setOpenDeleteModal(!openDeleteModal)}
        title="Delete Product"
        formType={deleteCustomerForm}
      >
        <p className="text-lg font-sen text-slate-800">
          Are you sure to delete?
        </p>
        <Item name={"_id"} className="hidden">
          <Input />
        </Item>
      </DeleteModal>

      {/* View sale drawer */}
      <Drawer
        title="Sale Details"
        placement="right"
        closable={false}
        onClose={() => {
          setSelectedSale(null);
          setOpenViewDrawer(false);
        }}
        open={openViewDrawer}
        key="right"
        footer={
          <div className="flex justify-between">
            <Button onClick={handlePrint}>Print Receipt</Button>
            <Button
              onClick={() => {
                setSelectedSale(null);
                setOpenViewDrawer(false);
              }}
            >
              Close
            </Button>
          </div>
        }
      >
        <DataRow title="Invoice Code" value={selectedSale?.orderId} />
        <DataRow
          title="Date"
          value={new Date(selectedSale?.createdAt)
            .toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
            .replace(/\//g, "-")}
        />
        <DataRow title="Total Amount" value={selectedSale?.totalPrice} />
        <DataRow title="Discount" value={selectedSale?.discount} />
        <DataRow title="Cash Balance" value={selectedSale?.balance} />
        <DataRow title="Cashier" value={selectedSale?.user.username} />

        {/* order items table */}
        <Table
          rowKey={(record) => record._id}
          dataSource={selectedSale?.orderItems}
          columns={[
            {
              title: "Product",
              dataIndex: "name",
              key: "product",
              render: (text: string, record: any) => (
                <p>{record.product.name}</p>
              ),
            },
            {
              title: "Quantity",
              dataIndex: "quantity",
              key: "quantity",
            },
            {
              title: "Unit Price",
              dataIndex: "sellingPrice",
              key: "sellingPrice",
            },
            {
              title: "Subtotal",
              render: (text: string, record: any) => (
                <p>{record.sellingPrice * record.quantity}</p>
              ),
              key: "sellingPrice",
            },
          ]}
        />

        {/* service items table */}
        <Table
          rowKey={(record) => record._id}
          dataSource={selectedSale?.orderServiceItems}
          columns={[
            {
              title: "Service",
              dataIndex: "name",
              key: "service",
              render: (text: string, record: any) => (
                <p>{record.service.name}</p>
              ),
            },
            {
              title: "Quantity",
              dataIndex: "quantity",
              key: "quantity",
            },
            {
              title: "Price",
              dataIndex: "sellingPrice",
              key: "sellingPrice",
            },
            {
              title: "Subtotal",
              render: (text: string, record: any) => (
                <p>{record.sellingPrice * record.quantity}</p>
              ),
              key: "sellingPrice",
            },
          ]}
        />
      </Drawer>

      {/* print receipt */}
      <SalesReceipt receiptRef={receiptRef} saleItem={selectedSale} />
    </AdminLayout>
  );
};

export default AdminOrder;

export const action: ActionFunction = async ({ request }) => {
  const url = new URL(request.url);
  const path = url.pathname + url.search;

  const formData = await request.formData();
  const id = formData.get("_id") as string;
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const amount = formData.get("amount") as string;

  const actionType = formData.get("actionType") as string;

  const orderController = await new OrderController(request);
  if (actionType === "edit") {
    return true;

    return await orderController.updateCustomer({
      fullName,
      email,
      phone,
      id,
    });
  } else if (actionType === "repayment") {
    return await orderController.makeRepayment({ orderId: id, amount });
  } else if (actionType === "delete") {
    return await orderController.undoCheckout({ id, path });
  } else {
    return true;
    return await orderController.createCustomer({
      fullName,
      email,
      phone,
    });
  }
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") as string) || 1;
  const search_term = url.searchParams.get("search_term") as string;
  const from = url.searchParams.get("from") as string;
  const to = url.searchParams.get("to") as string;

  const adminControlle = await new AdminController(request);
  await adminControlle.requireAdminId();
  const user = await adminControlle.getAdmin();

  const orderController = await new OrderController(request);
  const { orders, totalPages } = await orderController.getSales({
    search_term,
    page,
    from,
    to,
  });
  return {
    user,
    orders,
    totalPages,
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
