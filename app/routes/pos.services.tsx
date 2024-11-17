import { useEffect, useState } from "react";
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { useLoaderData, useSubmit, useOutletContext } from "@remix-run/react";

import { Table, Button, Input } from "antd";
import CartController from "~/controllers/CartController.server";
import OrderController from "~/controllers/OrderController.server";
import { ProductInterface } from "~/types";
import ServiceController from "~/controllers/ServiceController.server";

export default function POSProducts() {
  const { services } = useLoaderData<{
    services: ProductInterface[];
  }>();

  const { searchText } = useOutletContext();

  const [filteredServices, setFilteredServices] = useState(services);

  useEffect(() => {
    if (searchText) {
      const filtered = services.filter((service) => {
        return service.name.toLowerCase().includes(searchText.toLowerCase());
      });
      setFilteredServices(filtered);
    } else {
      setFilteredServices(services);
    }
  }, [searchText]);

  const submit = useSubmit();

  const columns = [
    {
      title: <div style={{ whiteSpace: "nowrap" }}>Service Name</div>,
      dataIndex: "name",
      key: "name",
      render: (text: string) => <p>{text}</p>,
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
            type="primary"
            className="rounded-lg border-blue-500 hover:bg-blue-500 hover:text-white text-blue-500"
            onClick={() => {
              submit(
                { service_id: record._id, actionType: "add_service_to_cart" },
                {
                  method: "POST",
                }
              );
            }}
          >
            Add to Cart
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="h-[92%] overflow-y-auto flex-1">
      <Table
        className="w-[90vw] lg:w-full !overflow-x-auto"
        dataSource={filteredServices}
        columns={columns}
        rowKey={(record) => record._id}
      />
    </div>
  );
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const url = new URL(request.url);

  const cartController = await new CartController(request);
  const orderController = await new OrderController(request);

  const product = formData.get("product_id") as string;
  const service = formData.get("service_id") as string;
  const quantity = formData.get("quantity") as string;
  const stock = formData.get("stock") as string;
  const actionType = formData.get("actionType") as string;

  if (actionType == "add_service_to_cart") {
    return await cartController.addServiceToCart({
      service,
    });
  }
  return true;
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") as string) || 1;
  const search_term = url.searchParams.get("search_term") as string;

  const productController = await new ServiceController(request);
  const { services, totalPages } = await productController.getServices({
    page,
    search_term,
  });

  return {
    services,
    page,
    totalPages,
    search_term,
  };
};

export const meta: MetaFunction = () => {
  return [
    { title: "Sales Point" },
    {
      name: "description",
      content: "The best e-Commerce platform for your business.",
    },
    { name: "og:title", content: "ComClo" },
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
