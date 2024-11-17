import { Link, useActionData, useLoaderData } from "@remix-run/react";
import { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { Table, Button, Form, Input } from "antd";
import { useEffect, useState } from "react";

import AdminLayout from "~/layouts/adminLayout";
import AdminController from "~/controllers/AdminController.server";

import CreateModal from "~/components/modals/CreateModal";
import EditModal from "~/components/modals/EditModal";
import DeleteModal from "~/components/modals/DeleteModal";

import OperatorController from "~/controllers/OperatorController.server";
import { OperatorInterface } from "~/types";

const AdminOperators: React.FC = () => {
  const actionData = useActionData();
  const { operators, user } = useLoaderData<{
    operators: OperatorInterface[];
  }>();
  const { Item } = Form;
  const [createCategoryForm] = Form.useForm();
  const [openModal, setOpenModal] = useState(false);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteOperatorForm] = Form.useForm();

  const [openEditModal, setEditOpenModal] = useState(false);
  const [editOperatorForm] = Form.useForm();

  const [filteredList, setFilteredList] =
    useState<OperatorInterface[]>(operators);

  useEffect(() => {
    setFilteredList(operators);
  }, [openModal, openEditModal, openDeleteModal, operators]);

  const columns = [
    {
      title: "Operator Name",
      dataIndex: "fullName",
      key: "fullName",
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: "Phone Number",
      dataIndex: "phone",
      key: "phone",
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: "Cash Balance",
      dataIndex: "balance",
      key: "balance",
      render: (text: string) => <p>GH₵ {text}</p>,
    },
    {
      title: "Action",
      key: "action",
      render: (text: string, record: any) => (
        <div className="flex items-center gap-3">
          <Link to={`/operators/${record?._id}`}>View</Link>

          {user.role === "admin" && (
            <Button
              onClick={() => {
                setEditOpenModal(true);
                editOperatorForm.setFieldsValue(record);
              }}
            >
              Edit
            </Button>
          )}

          {user.role === "admin" && (
            <Button
              className="rounded-lg hover:bg-red-500 hover:text-white"
              danger
              onClick={() => {
                setOpenDeleteModal(true);
                deleteOperatorForm.setFieldsValue(record);
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
    <AdminLayout pageTitle="Operators" user={user}>
      <div className="flex-1">
        <div className="flex items-center justify-between py-2">
          <Button
            className="bg-blue-600 rounded-xl"
            type="primary"
            onClick={() => setOpenModal(true)}
          >
            Add Operator
          </Button>

          <div className="flex gap-3">
            <Input
              placeholder="Search Operator"
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  setFilteredList(operators);
                } else {
                  const filtered = operators.filter(
                    (operator) =>
                      operator.fullName
                        .toLowerCase()
                        .includes(value.toLowerCase()) ||
                      operator.phone.toLowerCase().includes(value.toLowerCase())
                  );
                  setFilteredList(filtered);
                }
              }}
            />
          </div>
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
        title="Add New Operator"
        formType={createCategoryForm}
      >
        <Item
          label="Operator Name"
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
        title="Edit Operator"
        formType={editOperatorForm}
      >
        <Item className="hidden" name={"_id"}>
          <Input type="text" />
        </Item>
        <Item
          label="Operator Name"
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
        formType={deleteOperatorForm}
      >
        <p className="text-lg font-sen text-slate-800">
          Are you sure to delete?
        </p>
        <Item name={"_id"} className="hidden">
          <Input />
        </Item>
      </DeleteModal>
    </AdminLayout>
  );
};

export default AdminOperators;

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const id = formData.get("_id") as string;
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;

  const actionType = formData.get("actionType") as string;

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
  } else {
    return await operatorController.createOperator({
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

  const adminControlle = await new AdminController(request);
  await adminControlle.requireAdminId();
  const user = await adminControlle.getAdmin();

  const operatorController = await new OperatorController(request);
  const { operators, totalPages } = await operatorController.getOperators({
    search_term,
    page,
  });
  return {
    user,
    operators,
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
