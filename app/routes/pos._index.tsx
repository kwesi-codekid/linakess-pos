/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { useLoaderData, useOutletContext, useSubmit } from "@remix-run/react";
import ProductController from "~/controllers/ProductController.server";

import { Table, Button } from "antd";
import CartController from "~/controllers/CartController.server";
import OrderController from "~/controllers/OrderController.server";
import { ProductInterface } from "~/types";
import { useState, useEffect } from "react";

export default function POSProducts() {
  const { searchText }: { searchText: any } = useOutletContext();

  const { products } = useLoaderData<{
    products: ProductInterface[];
  }>();

  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    if (searchText) {
      const filtered = products.filter((product) => {
        return product.name.toLowerCase().includes(searchText.toLowerCase());
      });
      setFilteredProducts(filtered);
    }
  }, [searchText]);

  const submit = useSubmit();

  const columns = [
    {
      title: "Product Name",
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
      title: "Stock At Home",
      dataIndex: "stockAtHome",
      key: "stockAtHome",
    },
    {
      title: "Stock At Shop",
      dataIndex: "stockAtShop",
      key: "stockAtShop",
    },
    {
      title: "Action",
      key: "action",
      render: (text: string, record: any) => (
        <div className="flex items-center gap-3">
          <Button
            disabled={record.stockAtShop < 1}
            type="primary"
            className="rounded-lg border-blue-500 hover:bg-blue-500 hover:text-white text-blue-500 disabled:hover:bg-neutral-100 disabled:hover:text-neutral-400/70"
            onClick={() => {
              submit(
                { product_id: record._id, actionType: "add_to_cart" },
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
        dataSource={filteredProducts}
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
  const quantity = formData.get("quantity") as string;
  const stock = formData.get("stock") as string;
  const actionType = formData.get("actionType") as string;

  if (actionType == "add_to_cart") {
    return await cartController.addToCart({
      product,
    });
  }
  return true;
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") as string) || 1;
  const search_term = url.searchParams.get("search_term") as string;

  const productController = await new ProductController(request);
  const { products, totalPages } = await productController.getProducts({
    page,
    search_term,
    limit: 16,
  });

  return {
    products,
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
