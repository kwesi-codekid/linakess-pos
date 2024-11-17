import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { Table, Button, Form, Input, Select } from "antd";
import { useEffect, useState } from "react";
import AdminLayout from "~/layouts/adminLayout";
import AdminController from "~/controllers/AdminController.server";
import CreateModal from "~/components/modals/CreateModal";
import EditModal from "~/components/modals/EditModal";
import DeleteModal from "~/components/modals/DeleteModal";
import EmployeeController from "~/controllers/EmployeeController.server";
import { AdminInterface, EmployeeInterface } from "~/types";

const AdminEmployees: React.FC = () => {
  const submit = useSubmit();
  const actionData = useActionData();
  const { employees, user } = useLoaderData<{
    employees: EmployeeInterface[];
    user: AdminInterface;
  }>();
  const { Item } = Form;
  const [createCategoryForm] = Form.useForm();
  const [openModal, setOpenModal] = useState(false);

  // edit
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editCategoryForm] = Form.useForm();

  // delete
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteCategoryForm] = Form.useForm();

  const columns = [
    {
      title: "Employee Name",
      dataIndex: "username",
      key: "username",
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (text: string) => {
        return text === "admin" ? (
          <div className="flex items-center justify-center w-max rounded-full px-4 py-1 bg-green-400/5 text-green-500 text-sm font-sen">
            Admin
          </div>
        ) : (
          <div className="flex items-center justify-center w-max rounded-full px-4 py-1 bg-blue-400/5 text-blue-500 text-sm font-sen">
            Staff
          </div>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (text: string, record: any) => (
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setOpenEditModal(true);
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
    <AdminLayout pageTitle="Employees" user={user}>
      <div className="flex-1">
        <div className="flex items-center justify-between py-2">
          <Button
            className="bg-blue-600 rounded-xl"
            type="primary"
            onClick={() => setOpenModal(true)}
          >
            Add Employee
          </Button>
        </div>
        <Table
          dataSource={employees}
          columns={columns}
          rowKey={(record) => record._id}
        />
      </div>

      {/* Create Modal */}
      <CreateModal
        openModal={openModal}
        setOpenModal={() => setOpenModal(false)}
        title="Add New Employee"
        formType={createCategoryForm}
      >
        <Item
          label="Employee Name"
          name={"username"}
          hasFeedback
          rules={[{ required: true }]}
        >
          <Input type="text" />
        </Item>
        <Item
          label="Email"
          name={"email"}
          hasFeedback
          rules={[{ required: true }]}
        >
          <Input type="email" />
        </Item>
        <Item
          label="Phone"
          name={"phone"}
          hasFeedback
          rules={[{ required: true }]}
        >
          <Input type="tel" />
        </Item>

        <div className="flex items-center justify-stretch gap-4">
          <Form.Item
            name={"password"}
            label="Password"
            rules={[{ required: true, message: "Please input your password!" }]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name={"confirm_password"}
            label="Confirm Password"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value)
                    return Promise.resolve();
                  return Promise.reject(
                    new Error(
                      "The two passwords that you entered do not match!"
                    )
                  );
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </div>
        <Form.Item
          name={"role"}
          label="User Role"
          rules={[{ required: true, message: "Please select user's role!" }]}
          hasFeedback
        >
          <Select>
            <Select.Option value="admin">Admin</Select.Option>
            <Select.Option value="employee">Employee</Select.Option>
          </Select>
        </Form.Item>
      </CreateModal>

      {/* Edit Modal */}
      <EditModal
        openModal={openEditModal}
        setOpenModal={() => setOpenEditModal(false)}
        title="Edit Employee"
        formType={editCategoryForm}
      >
        <Item className="hidden" name={"_id"}>
          <Input className="hidden" />
        </Item>
        <Item
          label="Employee Name"
          name={"username"}
          hasFeedback
          rules={[{ required: true }]}
        >
          <Input type="text" />
        </Item>
        <Item
          label="Email"
          name={"email"}
          hasFeedback
          rules={[{ required: true }]}
        >
          <Input type="email" />
        </Item>
        <Item
          label="Phone"
          name={"phone"}
          hasFeedback
          rules={[{ required: true }]}
        >
          <Input type="tel" />
        </Item>

        <Form.Item
          name={"role"}
          label="User Role"
          rules={[{ required: true, message: "Please select user's role!" }]}
          hasFeedback
        >
          <Select>
            <Select.Option value="admin">Admin</Select.Option>
            <Select.Option value="employee">Employee</Select.Option>
          </Select>
        </Form.Item>
      </EditModal>

      {/* Delete Modal */}
      <DeleteModal
        openModal={openDeleteModal}
        setOpenModal={setOpenDeleteModal}
        title="Delete Employee"
        formType={deleteCategoryForm}
      >
        <Item name={"_id"} className="hidden">
          <Input className="hidden" />
        </Item>

        <p>Are you sure you want to delete this user?</p>
      </DeleteModal>
    </AdminLayout>
  );
};

export default AdminEmployees;

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const id = formData.get("_id") as string;
  const username = formData.get("username") as string;
  const role = formData.get("role") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;

  const actionType = formData.get("actionType") as string;

  const productController = await new EmployeeController(request);
  if (actionType === "edit") {
    return await productController.updateEmployee({
      username,
      role,
      email,
      phone,
      id,
    });
  } else if (actionType === "delete") {
    return await productController.deleteEmployee(id);
  } else {
    return await productController.createEmployee({
      username,
      email,
      password,
      phone,
      role,
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

  const employeeController = await new EmployeeController(request);
  const { employees, totalPages } = await employeeController.getEmployees({
    search_term,
    page,
  });
  return {
    user,
    employees,
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
