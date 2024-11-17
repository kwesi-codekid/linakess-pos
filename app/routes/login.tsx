import {
  ActionFunction,
  LoaderFunction,
  json,
  redirect,
} from "@remix-run/node";
import AdminController from "~/controllers/AdminController.server";
import { validateEmail } from "~/validators.server";

import { Form, Button, Input } from "antd";
import { useSubmit } from "@remix-run/react";

export default function Login() {
  const [loginForm] = Form.useForm();
  const { Item } = Form;

  const submit = useSubmit();

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="w-1/2"></div>

      <div className="flex-1 flex items-center justify-center flex-col gap-3">
        <h2 className="font-sen font-bold text-4xl text-slate-800 text-center">
          Sign in to Your Account
        </h2>

        <Form
          onFinish={() => {
            loginForm
              .validateFields()
              .then((values) => {
                submit(values, { method: "POST" });
              })
              .catch((info) => {
                console.log("Validate Failed:", info);
              });
          }}
          requiredMark={false}
          layout="vertical"
          name="login"
          form={loginForm}
        >
          <Item
            label="Email"
            name={"email"}
            hasFeedback
            rules={[{ required: true }, { type: "email" }]}
          >
            <Input type="email" />
          </Item>

          <Item
            label="Password"
            name={"password"}
            hasFeedback
            rules={[{ required: true }]}
          >
            <Input type="password" />
          </Item>

          <Item>
            <Button type="primary" htmlType="submit" className="bg-blue-600">
              Submit
            </Button>
          </Item>
        </Form>
      </div>
    </div>
  );
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const errors = {
    email: !validateEmail(email) && "Invalid email",
    // password: !validatePassword(password) && "Invalid password",
  };

  if (Object.values(errors).some(Boolean)) {
    return json({ errors }, { status: 400 });
  }
  const adminController = await new AdminController(request);
  return await adminController.loginAdmin({ email, password });
};

export const loader: LoaderFunction = async ({ request }) => {
  const adminController = await new AdminController(request);
  return (await adminController.getAdmin()) ? redirect("/") : null;
};
