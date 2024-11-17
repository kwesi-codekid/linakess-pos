/* eslint-disable @typescript-eslint/no-explicit-any */

import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import AdminController from "~/controllers/AdminController.server";
import AnalyticsController from "~/controllers/AnalyticsController.server";
import AdminLayout from "~/layouts/adminLayout";
import { AdminInterface, OrderInterface } from "~/types";

import Calendar from "react-calendar";
type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];
import "react-calendar/dist/Calendar.css";

import WelcomeCard from "~/components/cards/WelcomeCard";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { ReactNode, useState, useEffect } from "react";
import OrderController from "~/controllers/OrderController.server";
import { Button } from "antd";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const MiniCard = ({
  icon,
  primaryColor,
  secondaryColor,
  title,
  description,
}: {
  icon: ReactNode;
  primaryColor: string;
  secondaryColor: string;
  title: string;
  description: string;
}) => {
  return (
    <div className="rounded-xl bg-white px-4 py-2 flex items-center gap-3">
      <div
        className={`rounded-full size-10 flex items-center justify-center ${secondaryColor}`}
      >
        <p className={primaryColor}>{icon}</p>
      </div>
      <div className="flex flex-col">
        <p className="text-slate-400 text-xs font-quicksand font-medium">
          {title}
        </p>
        <h4 className="text-slate-700 text-lg font-sen font-bold">
          {description}
        </h4>
      </div>
    </div>
  );
};

export default function Index() {
  const { user, dashboardData, overviewData, todaySales } = useLoaderData<{
    user: AdminInterface;
    dashboardData: any;
    overviewData: any;
    payments: any;
    todaySales: OrderInterface[];
  }>();
  const navigate = useNavigate();

  const miniCardData = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M4 5H20V3H4V5ZM20 9H4V7H20V9ZM3 11H10V13H14V11H21V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V11ZM16 13V15H8V13H5V19H19V13H16Z"></path>
        </svg>
      ),
      title: "Total Products",
      description: overviewData.totalProducts,
      primaryColor: "text-green-400",
      secondaryColor: "bg-green-400/10",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-5"
        >
          <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
        </svg>
      ),
      title: "Total Customers",
      description: overviewData.totalCustomers,
      primaryColor: "text-green-400",
      secondaryColor: "bg-green-400/10",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-5"
        >
          <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
        </svg>
      ),
      title: "Total Operators",
      description: overviewData.totalOperators,
      primaryColor: "text-green-400",
      secondaryColor: "bg-green-400/10",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-5"
        >
          <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
        </svg>
      ),
      title: "Monthly Revenue",
      description: `GHc ${234.5}`,
      primaryColor: "text-green-400",
      secondaryColor: "bg-green-400/10",
    },
  ];

  const [value, onChange] = useState<Value>();
  useEffect(() => {
    if (value) navigate(`/sales?from=${value}&to=${value}`);
  }, [value]);

  return (
    <AdminLayout pageTitle="Dashboard" user={user} hasWrapper={false}>
      <div className="grid grid-cols-3 gap-5 h-full">
        {/* right-sided cards */}
        <div className="col-span-2 flex flex-col gap-5">
          {/* welcome */}
          <WelcomeCard user={user} />

          {/* overview */}
          <div className="grid grid-cols-4 gap-3">
            {miniCardData.map((item: any, index: number) => (
              <MiniCard
                key={index}
                icon={item.icon}
                title={item.title}
                description={item.description}
                primaryColor={item.primaryColor}
                secondaryColor={item.secondaryColor}
              />
            ))}
          </div>

          {/* chart */}
          <div className="rounded-2xl flex-1 p-4 bg-white">
            <h2 className="text-lg font-semibold font-sen">Analytics Chart</h2>
            <Line
              data={{
                labels: dashboardData.months,
                datasets: [
                  {
                    label: "Sales",
                    data: dashboardData.sales,
                    fill: true,
                    borderColor: "rgb(67,56,202)",
                    backgroundColor: "rgba(67,56,202, 0.1)",
                    tension: 0.3,
                  },
                  {
                    label: "Payments",
                    data: dashboardData.payments,
                    fill: true,
                    borderColor: "rgb(22, 163, 74)",
                    backgroundColor: "rgba(22, 163, 74, 0.1)",
                    tension: 0.3,
                  },
                ],
              }}
              height={250}
              width={600}
              options={{
                maintainAspectRatio: true,
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },

                plugins: {
                  legend: {
                    display: true,
                    position: "bottom",
                  },
                },
              }}
            />
          </div>
        </div>

        {/* left-sided cards */}
        <div className="flex flex-col h-full gap-5">
          {/* calendar */}
          <div className="bg-white rounded-2xl p-4 h-1/2">
            <Calendar onChange={onChange} value={value} />
          </div>

          {/* today's sales */}
          <div className="bg-white rounded-2xl p-4 flex-1 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="font-sen text-slate-800 font-bold text-lg">
                Recent Sales
              </h3>
              <Button
                className="hover:!bg-blue-400/10 !text-blue-500 font-sen text-sm !rounded-lg"
                type="text"
                onClick={() =>
                  navigate(
                    `/sales?from=${new Date().toISOString()}&to=${new Date().toISOString()}`
                  )
                }
              >
                View all
              </Button>
            </div>

            <div className="flex flex-col gap-2 flex-1 overflow-hidden">
              {todaySales.length > 0 &&
                todaySales.map((sale: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 py-2 px-2 even:bg-blue-300/10 rounded-lg"
                  >
                    <div className="w-18%">
                      <p className="text-xs font-medium font-quicksand">
                        {new Date(sale.createdAt).toLocaleTimeString("en-GB", {
                          timeStyle: "short",
                          hour12: true,
                        })}
                      </p>
                    </div>
                    <div className="flex items-center flex-1 text-slate-700">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-6 text-blue-400"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="font-medium font-sen text-sm">
                        {sale.customer.fullName}
                      </p>
                    </div>

                    <div className="w-[30%]">
                      {sale.balance < 0 ? (
                        <div className="bg-red-500/10 rounded-lg px-2 py-1">
                          <p className="text-red-500 font-semibold font-quicksand text-xs">
                            Owing: GH {sale.balance * -1}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-green-400/10 rounded-lg px-2 py-1">
                          <p className="text-green-400 font-semibold font-quicksand text-xs">
                            Paid: GH {sale.amountPaid}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export const loader: LoaderFunction = async ({ request }) => {
  const adminControlle = await new AdminController(request);
  await adminControlle.requireAdminId();
  const user = await adminControlle.getAdmin();

  // const orderController = await new OrderController(request);

  const analyticsController = await new AnalyticsController(request);
  const dashboardData = await analyticsController.getMonthlySalesData();
  const overviewData = await analyticsController.getDashboardData();

  // get today's sales
  const orderController = new OrderController(request);
  const today = new Date();
  const from = new Date(today.setHours(0, 0, 0, 0));
  const to = new Date(today.setHours(23, 59, 59, 999));

  const { orders } = await orderController.getSales({
    from: from.toISOString(),
    to: to.toISOString(),
    page: 1,
  });

  return {
    user,
    dashboardData,
    overviewData,
    todaySales: orders,
  };
};

export const meta: MetaFunction = () => {
  return [
    { title: "Admin Dashboard | Linakess" },
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
