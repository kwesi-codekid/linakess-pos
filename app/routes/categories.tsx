import { useActionData, useLoaderData } from "@remix-run/react";
import { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { Table, Button, Form, Input } from "antd";
import { useEffect, useState } from "react";

import AdminLayout from "~/layouts/adminLayout";
import ProductController from "~/controllers/ProductController.server";
import AdminController from "~/controllers/AdminController.server";

import CreateModal from "~/components/modals/CreateModal";
import EditModal from "~/components/modals/EditModal";
import DeleteModal from "~/components/modals/DeleteModal";
import { CategoryInterface } from "~/types";

const Categories: React.FC = () => {
  const actionData = useActionData();
  const { categories, user } = useLoaderData<{ categories: [] }>();
  const { Item } = Form;
  const [createCategoryForm] = Form.useForm();
  const [editCategoryForm] = Form.useForm();
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setEditOpenModal] = useState(false);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteCategoryForm] = Form.useForm();

  const [filteredList, setFilteredList] = useState(categories);
  useEffect(() => {
    setFilteredList(categories);
  }, [categories]);

  const columns = [
    {
      title: "Category Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Action",
      key: "action",
      render: (text: string, record: any) => (
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setEditOpenModal(true);
              editCategoryForm.setFieldsValue(record);
            }}
          >
            Edit
          </Button>
          <Button
            className="rounded-lg hover:bg-red-500 hover:text-white"
            danger
            onClick={() => {
              setOpenDeleteModal(true);
              deleteCategoryForm.setFieldsValue(record);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    setOpenModal(false);
  }, [actionData]);

  return (
    <AdminLayout pageTitle="Categories" user={user}>
      <div className="w-full">
        <div className="flex items-center justify-between py-2">
          <Button
            className="bg-blue-600 rounded-xl"
            type="primary"
            onClick={() => setOpenModal(true)}
          >
            Add Category
          </Button>

          <Input
            placeholder="Search for category..."
            className="w-full md:w-1/4"
            onChange={(e) => {
              const searchTerm = e.target.value.toLowerCase();
              if (searchTerm === "") {
                setFilteredList(categories);
              } else {
                const filtered = categories.filter(
                  (category: CategoryInterface) =>
                    category?.name.toLowerCase().includes(searchTerm)
                );
                setFilteredList(filtered);
              }
            }}
          />
        </div>
        <Table
          dataSource={filteredList}
          columns={columns}
          rowKey={(record) => record._id}
        />
      </div>

      {/* Create Modal */}
      <CreateModal
        openModal={openModal}
        setOpenModal={() => setOpenModal(false)}
        title="Add New Category"
        formType={createCategoryForm}
      >
        <Item
          label="Category Name"
          name={"name"}
          hasFeedback
          rules={[{ required: true }]}
        >
          <Input type="text" />
        </Item>

        <Item label="Description" name={"description"}>
          <Input type="text" />
        </Item>
      </CreateModal>

      {/* Edit Modal */}
      <EditModal
        openModal={openEditModal}
        setOpenModal={() => setEditOpenModal(false)}
        title="Edit Category"
        formType={editCategoryForm}
      >
        <Item className="hidden" name={"actionType"}>
          <Input />
        </Item>
        <Item className="hidden" name={"_id"}>
          <Input />
        </Item>
        <Item
          label="Category Name"
          name={"name"}
          hasFeedback
          rules={[{ required: true }]}
        >
          <Input type="text" />
        </Item>

        <Item label="Description" name={"description"}>
          <Input type="text" />
        </Item>
      </EditModal>

      {/* Delete Modal */}
      <DeleteModal
        openModal={openDeleteModal}
        setOpenModal={() => setOpenDeleteModal(false)}
        title="Delete Category"
        formType={deleteCategoryForm}
      >
        <Item name={"_id"} className="hidden">
          <Input />
        </Item>
        <p>Are you sure you want to delete this category?</p>
      </DeleteModal>
    </AdminLayout>
  );
};

export default Categories;

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const id = formData.get("_id") as string;

  const actionType = formData.get("actionType") as string;

  if (actionType === "edit") {
    const productController = await new ProductController(request);
    return await productController.updateCategory({
      name,
      description,
      id,
    });
  } else if (actionType === "delete") {
    const productController = await new ProductController(request);
    return await productController.deleteCategory(id);
  } else {
    const productController = await new ProductController(request);
    return await productController.createCategory({
      name,
      description,
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
  const { categories, totalPages } = await productController.getCategories({
    search_term,
    page,
  });
  return {
    user,
    categories,
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
