import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import styles from "./tailwind.css";
import { useEffect } from "react";
import { message } from "antd";
import { getSession } from "./session";
export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export default function App() {
  const { flashMessage } = useLoaderData<{
    flashMessage: { title: string; description?: string; status: string };
  }>();

  useEffect(() => {
    if (flashMessage) {
      flashMessage.status == "error"
        ? message.error(flashMessage.title, 2)
        : message.success(flashMessage.title, 2);
    }
  }, [flashMessage]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const flashMessage = session.get("message") || null;

  return { flashMessage };
};
