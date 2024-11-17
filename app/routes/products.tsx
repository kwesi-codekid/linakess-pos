import { useActionData, useLoaderData } from "@remix-run/react";
import { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { Table, Button, Form, Input, Select, message } from "antd";
import { useEffect, useState } from "react";

import AdminLayout from "~/layouts/adminLayout";
import ProductController from "~/controllers/ProductController.server";
import AdminController from "~/controllers/AdminController.server";

import CreateModal from "~/components/modals/CreateModal";
import EditModal from "~/components/modals/EditModal";
import DeleteModal from "~/components/modals/DeleteModal";
import MoveProductModal from "~/components/modals/MoveProductModal";
import { ProductInterface } from "~/types";

const Products: React.FC = () => {
  const actionData = useActionData();
  const { products, user } = useLoaderData<{ products: ProductInterface[] }>();

  const { Item } = Form;
  const [createProductForm] = Form.useForm();
  const [editProductForm] = Form.useForm();
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setEditOpenModal] = useState(false);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteProductForm] = Form.useForm();

  const [openMoveModal, setOpenMoveModal] = useState(false);
  const [moveProductForm] = Form.useForm();
  // clear the form after the modal is closed
  useEffect(() => {
    if (!openMoveModal) {
      moveProductForm.resetFields();
    }
  }, [openMoveModal]);

  const [filteredList, setFilteredList] = useState(products);

  // update the list of products when the products changes
  useEffect(() => {
    setFilteredList(products);
  }, [products, openModal, openEditModal, openDeleteModal]);

  const columns = [
    {
      title: <div style={{ whiteSpace: "nowrap" }}>Product Name</div>,
      dataIndex: "name",
      key: "name",
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: <div style={{ whiteSpace: "nowrap" }}>Unit Price</div>,
      dataIndex: "price",
      key: "price",
      render: (text: string) => <p>GH₵ {text}</p>,
    },
    {
      title: <div style={{ whiteSpace: "nowrap" }}>Cost Price</div>,
      dataIndex: "costPrice",
      key: "costPrice",
      render: (text: string) => <p>GH₵ {text}</p>,
    },
    {
      title: <div style={{ whiteSpace: "nowrap" }}>Stock at Home</div>,
      dataIndex: "stockAtHome",
      key: "stockAtHome",
    },
    {
      title: <div style={{ whiteSpace: "nowrap" }}>Stock at Shop</div>,
      dataIndex: "stockAtShop",
      key: "stockAtShop",
    },
    {
      title: "Action",
      key: "action",
      render: (text: string, record: any) => (
        <div className="flex items-center gap-3">
          <Button
            type="default"
            onClick={() => {
              setOpenMoveModal(true);
              moveProductForm.setFieldsValue(record);
            }}
            className="flex items-center rounded-xl text-slate-500"
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
                  d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                />
              </svg>
            }
          >
            Move
          </Button>

          <Button
            type="primary"
            onClick={() => {
              setEditOpenModal(true);
              editProductForm.setFieldsValue(record);
            }}
            className="hover:bg-blue-600 hover:text-white border-blue-500 text-blue-500 flex items-center rounded-xl"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M5 18.89H6.41421L15.7279 9.57627L14.3137 8.16206L5 17.4758V18.89ZM21 20.89H3V16.6473L16.435 3.21231C16.8256 2.82179 17.4587 2.82179 17.8492 3.21231L20.6777 6.04074C21.0682 6.43126 21.0682 7.06443 20.6777 7.45495L9.24264 18.89H21V20.89ZM15.7279 6.74785L17.1421 8.16206L18.5563 6.74785L17.1421 5.33363L15.7279 6.74785Z"></path>
              </svg>
            }
          >
            Edit
          </Button>
          <Button
            danger
            className="flex items-center hover:bg-red-500 hover:!text-white rounded-xl"
            onClick={() => {
              setOpenDeleteModal(true);
              deleteProductForm.setFieldsValue(record);
            }}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM13.4142 13.9997L15.182 15.7675L13.7678 17.1817L12 15.4139L10.2322 17.1817L8.81802 15.7675L10.5858 13.9997L8.81802 12.232L10.2322 10.8178L12 12.5855L13.7678 10.8178L15.182 12.232L13.4142 13.9997ZM9 4V6H15V4H9Z"></path>
              </svg>
            }
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    setOpenModal(false);
    setEditOpenModal(false);

    // message.success("Product is updated successfully", 2)
  }, [actionData]);

  return (
    <AdminLayout pageTitle="Products" user={user}>
      <div className="flex flex-col gap-2 h-full">
        <div className="flex-1 flex items-center justify-between">
          <Button
            className="bg-blue-600 rounded-xl"
            type="primary"
            onClick={() => setOpenModal(true)}
          >
            Add New Product
          </Button>

          <Input
            placeholder="Search Product"
            className="w-[300px] rounded-lg"
            onChange={(e) => {
              const search_term = e.target.value;
              if (search_term) {
                const filtered = products.filter((product) =>
                  product.name.toLowerCase().includes(search_term.toLowerCase())
                );
                setFilteredList(filtered);
              } else {
                setFilteredList(products);
              }
            }}
          />
        </div>

        <div className="h-full overflow-y-auto">
          <Table
            className="w-[90vw] lg:w-full !overflow-x-auto"
            dataSource={filteredList}
            columns={columns}
            rowKey={(record) => record._id}
          />
        </div>
      </div>

      {/* Create Modal */}
      <CreateModal
        openModal={openModal}
        setOpenModal={() => setOpenModal(false)}
        title="Create Product"
        formType={createProductForm}
      >
        <Item
          label="Product Name"
          name={"name"}
          hasFeedback
          rules={[{ required: true }]}
        >
          <Input type="text" />
        </Item>

        <Item
          label="Price"
          name={"price"}
          hasFeedback
          rules={[{ required: true }]}
        >
          <Input type="number" />
        </Item>

        <Item
          label="Cost Price"
          name={"costPrice"}
          hasFeedback
          rules={[{ required: true }]}
        >
          <Input type="number" />
        </Item>

        <Item
          label="Stock At Home"
          name={"stockAtHome"}
          hasFeedback
          rules={[{ required: true }]}
        >
          <Input type="number" />
        </Item>

        <Item
          label="Stock At Shop"
          name={"stockAtShop"}
          hasFeedback
          rules={[{ required: true }]}
        >
          <Input type="number" />
        </Item>
      </CreateModal>

      {/* Edit Modal */}
      <EditModal
        openModal={openEditModal}
        setOpenModal={() => setEditOpenModal(!openEditModal)}
        title="Edit Product"
        formType={editProductForm}
      >
        <Item className="hidden" name={"_id"}>
          <Input className="hidden" />
        </Item>

        <Item
          label="Product Name"
          name={"name"}
          hasFeedback
          rules={[{ required: true }]}
        >
          <Input type="text" />
        </Item>

        <Item
          label="Price"
          name={"price"}
          hasFeedback
          rules={[{ required: true }]}
        >
          <Input type="number" />
        </Item>

        <Item
          label="Cost Price"
          name={"costPrice"}
          hasFeedback
          rules={[{ required: true }]}
        >
          <Input type="number" />
        </Item>

        <Item
          label="Stock At Home"
          name={"stockAtHome"}
          hasFeedback
          rules={[{ required: true }]}
        >
          <Input type="number" />
        </Item>

        <Item
          label="Stock At Shop"
          name={"stockAtShop"}
          hasFeedback
          rules={[{ required: true }]}
        >
          <Input type="number" />
        </Item>
      </EditModal>

      {/* Delete Modal */}
      <DeleteModal
        openModal={openDeleteModal}
        setOpenModal={() => setOpenDeleteModal(!openDeleteModal)}
        title="Delete Product"
        formType={deleteProductForm}
      >
        <p className="text-lg font-sen text-slate-800">
          Are you sure to delete?
        </p>
        <Item name={"_id"} className="hidden">
          <Input />
        </Item>
      </DeleteModal>

      {/* Move Product Modal */}
      <MoveProductModal
        openModal={openMoveModal}
        setOpenModal={setOpenMoveModal}
        title="Move Products"
        formType={moveProductForm}
      >
        <Item className="hidden" name={"_id"}>
          <Input className="hidden" />
        </Item>

        <Item
          label="Product Name"
          name={"name"}
          hasFeedback
          rules={[{ required: true }]}
        >
          <Input type="text" disabled />
        </Item>

        <div className="grid grid-cols-2 gap-4">
          <Item
            label="Stock At Home"
            name={"stockAtHome"}
            hasFeedback
            rules={[{ required: true }]}
          >
            <Input type="number" disabled />
          </Item>

          <Item
            label="Stock At Shop"
            name={"stockAtShop"}
            hasFeedback
            rules={[{ required: true }]}
          >
            <Input type="number" disabled />
          </Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Item
            label="Direction"
            name={"direction"}
            hasFeedback
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="shop">To Shop</Select.Option>
              <Select.Option value="home">To Home</Select.Option>
            </Select>
          </Item>

          <Item
            label="Quantity"
            name={"quantity"}
            hasFeedback
            rules={[{ required: true }]}
          >
            <Input
              type="number"
              onChange={(e) => {
                const quantity = e.target.value;
                //check which direction the product is moving
                const direction = moveProductForm.getFieldValue("direction");
                //check if quantity is greater than stock and show error message
                if (
                  direction == "shop" &&
                  quantity > moveProductForm.getFieldValue("stockAtHome")
                ) {
                  message.error(
                    "Quantity cannot be greater than stock at home",
                    2
                  );
                } else if (
                  direction == "home" &&
                  quantity > moveProductForm.getFieldValue("stockAtShop")
                ) {
                  message.error(
                    "Quantity cannot be greater than stock at shop",
                    2
                  );
                }
              }}
            />
          </Item>
        </div>
      </MoveProductModal>
    </AdminLayout>
  );
};

export default Products;

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const id = formData.get("_id") as string;
  const name = formData.get("name") as string;
  const price = formData.get("price") as string;
  const costPrice = formData.get("costPrice") as string;
  const stockAtHome = formData.get("stockAtHome") as string;
  const stockAtShop = formData.get("stockAtShop") as string;
  const direction = formData.get("direction") as string;
  const quantity = formData.get("quantity") as string;

  const actionType = formData.get("actionType") as string;

  if (actionType == "edit") {
    const productController = await new ProductController(request);
    return await productController.updateProduct({
      id,
      name,
      price,
      costPrice: costPrice,
      stockAtHome,
      stockAtShop,
    });
  } else if (actionType == "delete") {
    const productController = await new ProductController(request);
    return await productController.deleteProduct(id);
  } else if (actionType == "moveProduct") {
    const productController = await new ProductController(request);
    return await productController.moveProduct({
      id,
      direction,
      quantity,
    });
  } else {
    const productController = await new ProductController(request);
    return await productController.createProduct({
      name,
      price,
      costPrice: costPrice,
      stockAtHome,
      stockAtShop,
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

  const productController = await new ProductController(request);
  const { products, totalPages } = await productController.getProducts({
    search_term,
    page,
  });
  return {
    user,
    products,
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
