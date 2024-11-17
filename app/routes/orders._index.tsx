/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, useActionData, useLoaderData } from "@remix-run/react";
import { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import pkg from "react-to-print";
const { useReactToPrint } = pkg;
import { Table, Button, Form, Input, Select } from "antd";
import { useEffect, useState, useRef } from "react";

import AdminLayout from "~/layouts/adminLayout";
import AdminController from "~/controllers/AdminController.server";

import CreateModal from "~/components/modals/CreateModal";
import EditModal from "~/components/modals/EditModal";
import DeleteModal from "~/components/modals/DeleteModal";

import OrderInvoice from "~/components/printouts/OrderInvoice";

import { AdminInterface, CustomerInterface, OrderInterface } from "~/types";
import OrderController from "~/controllers/OrderController.server";
import CustomerController from "~/controllers/CustomerController.server";

const AdminOrder: React.FC = () => {
  const actionData = useActionData();
  const { orders, user, customers } = useLoaderData<{
    orders: OrderInterface[];
    user: AdminInterface;
    customers: CustomerInterface[];
  }>();

  const { Item } = Form;
  const { Option } = Select;
  const [createOrderForm] = Form.useForm();
  const [openModal, setOpenModal] = useState(false);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteCustomerForm] = Form.useForm();

  const [openEditModal, setEditOpenModal] = useState(false);
  const [editCustomerForm] = Form.useForm();

  const [filteredList, setFilteredList] = useState(orders);

  const orderPrintoutRef = useRef<HTMLDivElement | null>(null);
  const handlePrint = useReactToPrint({
    content: () => orderPrintoutRef.current,
  });

  useEffect(() => {
    if (actionData) {
      handlePrint();
    }
  }, [actionData]);

  // update the filtered list when the orders changes
  useEffect(() => {
    setFilteredList(orders);
  }, [orders, openModal, openEditModal, openDeleteModal]);

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
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
      title: "Customer Name",
      dataIndex: "customer",
      key: "customer",
      render: (text: string, record: any) => (
        <p>{record?.customer?.fullName}</p>
      ),
    },
    {
      title: "Phone Number",
      dataIndex: "phone",
      key: "phone",
      render: (text: string, record: any) => <p>{record?.customer?.phone}</p>,
    },
    {
      title: "Order Status",
      dataIndex: "status",
      key: "status",
      render: (text: string) => <p>{text}</p>,
    },
    {
      title: "Payment Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (text: string, record: OrderInterface) => (
        <p
          className={`font-quicksand font-semibold
            ${record.totalPrice - record.amountPaid === 0 && "text-green-400"}
            ${record.totalPrice - record.amountPaid < 0 && "text-red-400"}
            ${record.totalPrice - record.amountPaid > 0 && "text-blue-400"}
              
          }`}
        >
          {record.totalPrice - record.amountPaid === 0 && "paid"}
          {record.totalPrice - record.amountPaid < 0 && "owing"}
          {record.totalPrice - record.amountPaid > 0 && "debit"}
        </p>
      ),
    },
    {
      title: "Cash Balance",
      dataIndex: "balance",
      key: "balance",
      render: (text: string, record: any) => (
        <p>GH₵ {record.totalPrice - record.amountPaid}</p>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (text: string, record: any) => (
        <div className="flex items-center gap-3">
          <Link to={`/orders/${record?._id}`}>View</Link>

          {user.role === "admin" && (
            <>
              <Button
                onClick={() => {
                  setEditOpenModal(true);
                  editCustomerForm.setFieldsValue(record);
                }}
              >
                Edit
              </Button>
              <Button
                className="rounded-lg hover:bg-red-500 hover:text-white"
                danger
                onClick={() => {
                  setOpenDeleteModal(true);
                  deleteCustomerForm.setFieldsValue(record);
                }}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const customersOptions = customers.map((customer) => (
    <Option key={customer._id} value={customer._id}>
      {customer.fullName}
    </Option>
  ));

  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    setOpenModal(false);
  }, [actionData]);

  return (
    <AdminLayout pageTitle="Customer Orders" user={user}>
      <div className="flex-1">
        <div className="flex items-center justify-between py-2">
          <Button
            className="bg-blue-600 rounded-xl"
            type="primary"
            onClick={() => setOpenModal(true)}
          >
            New Order
          </Button>

          <Input
            placeholder="Search order..."
            onChange={(e) => {
              const search_term = e.target.value;
              const filteredData = orders.filter((service: any) => {
                return (
                  (service.customer &&
                    service?.customer?.fullName
                      .toLowerCase()
                      .includes(search_term.toLowerCase())) ||
                  service?.customer?.phone
                    .toLowerCase()
                    .includes(search_term.toLowerCase())
                );
              });
              setFilteredList(filteredData);
            }}
            style={{ width: "300px" }}
            className="rounded-lg"
          />
        </div>
        <Table
          dataSource={filteredList}
          columns={columns}
          rowKey={(record) => record._id}
          className="overflow-y-auto lg:h-[80vh]"
        />
      </div>

      {/* Create Modal */}
      <CreateModal
        openModal={openModal}
        setOpenModal={() => setOpenModal(false)}
        title="New Customer Order"
        formType={createOrderForm}
        additionalData={orderItems}
      >
        <Item className="hidden" label="actionType" name={"actionType"}>
          <Input className="hidden" value={"placeOrder"} type="text" />
        </Item>
        <Item
          label="Select Customer"
          name={"customer"}
          rules={[{ required: true }]}
          hasFeedback
        >
          <Select
            showSearch
            style={{ width: "100%" }}
            placeholder="Select a customer"
            optionFilterProp="children"
            filterOption={(input, option: any) =>
              option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {customersOptions}
          </Select>
        </Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
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

            <Button
              onClick={() => {
                const values = createOrderForm.getFieldsValue();
                setOrderItems([...orderItems, values]);
                createOrderForm.setFieldsValue({
                  productName: "",
                  quantity: "",
                  price: "",
                  description: "",
                });
              }}
            >
              Add Item
            </Button>
          </div>

          {/* added items list with remove buttons */}
          <div>
            {orderItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <p>{item.productName}</p>
                <Button
                  onClick={() => {
                    const newItems = orderItems.filter(
                      (orderItem) => orderItem !== item
                    );
                    setOrderItems(newItems);
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
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

      <OrderInvoice
        orderData={actionData}
        user={user}
        printoutRef={orderPrintoutRef}
      />
    </AdminLayout>
  );
};

export default AdminOrder;

export const action: ActionFunction = async ({ request }) => {
  const url = new URL(request.url);
  const path = url.pathname + url.search;

  const formData = await request.formData();
  const id = formData.get("_id") as string;

  const additionalData = formData.get("additionalData") as string;
  const customer = formData.get("customer") as string;

  const actionType = formData.get("actionType") as string;

  const orderController = await new OrderController(request);
  if (actionType === "delete") {
    return await orderController.undoCheckout({ id, path });
  } else {
    return await orderController.placeOrder({
      orderId: "asfsgdsgsd",
      customer,
      // amountPaid: "10",
      items: JSON.parse(additionalData),
    });
  }
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") as string) || 1;
  const search_term = url.searchParams.get("search_term") as string;

  const adminControlle = await new AdminController(request);
  await adminControlle.requireAdminId();
  const user = await adminControlle.getAdmin();

  const orderController = await new OrderController(request);
  const { orders, totalPages } = await orderController.getOrders({
    search_term,
    page,
  });

  const customerController = await new CustomerController(request);
  const customers = await customerController.getCustomersx();

  return {
    user,
    orders,
    totalPages,
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
