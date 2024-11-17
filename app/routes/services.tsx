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
import ServiceController from "~/controllers/ServiceController.server";

const Categories: React.FC = () => {
  const actionData = useActionData();
  const { services, user } = useLoaderData<{ services: [] }>();
  const { Item } = Form;
  const [createCategoryForm] = Form.useForm();
  const [editCategoryForm] = Form.useForm();
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setEditOpenModal] = useState(false);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteCategoryForm] = Form.useForm();

  const [filteredList, setFilteredList] = useState(services);

  const columns = [
    {
      title: "Service Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (text: string) => <p>GH₵ {text}</p>,
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
    <AdminLayout pageTitle="Services" user={user}>
      <div className="flex-1">
        <div className="flex items-center justify-between py-2">
          <Button
            className="bg-blue-600 rounded-xl"
            type="primary"
            onClick={() => setOpenModal(true)}
          >
            Add Service
          </Button>

          <Input
            placeholder="Search Service"
            onChange={(e) => {
              const search_term = e.target.value;
              const filteredData = services.filter((service: any) => {
                return service.name
                  .toLowerCase()
                  .includes(search_term.toLowerCase());
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
          className="overflow-y-auto lg:h-[80vh]"
          rowKey={(record) => record._id}
        />
      </div>

      {/* Create Modal */}
      <CreateModal
        openModal={openModal}
        setOpenModal={() => setOpenModal(false)}
        title="Add New Service"
        formType={createCategoryForm}
      >
        <Item
          label="Service Name"
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
        <Item name={"actionType"}>
          <Input type="hidden" />
        </Item>
        <Item name={"_id"}>
          <Input type="hidden" />
        </Item>
        <Item
          label="Category Name"
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
          rules={[{ required: true, type: "number" }]}
        >
          <Input type="number" />
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
        <p>Are you sure you want to delete this service?</p>
      </DeleteModal>
    </AdminLayout>
  );
};

export default Categories;

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const price = formData.get("price") as string;
  const description = formData.get("description") as string;
  const id = formData.get("_id") as string;

  const actionType = formData.get("actionType") as string;

  const serviceController = await new ServiceController(request);
  if (actionType === "edit") {
    return await serviceController.updateService({
      name,
      price,
      description,
      id,
    });
  } else if (actionType === "delete") {
    return await serviceController.deleteService(id);
  } else {
    return await serviceController.createService({
      name,
      description,
      price,
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

  const serviceController = await new ServiceController(request);
  const { services, totalPages } = await serviceController.getServices({
    search_term,
    page,
  });
  return {
    user,
    services,
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
