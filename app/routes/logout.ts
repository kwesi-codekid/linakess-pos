import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import AdminController from "~/controllers/AdminController.server";

export const action: ActionFunction = async ({ request }) => {
  const adminAuthControlle = await new AdminController(request);
  return await adminAuthControlle.logout();
};

export const loader = async () => redirect("/");
