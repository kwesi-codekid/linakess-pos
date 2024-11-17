/* eslint-disable @typescript-eslint/no-explicit-any */
import { Drawer, Button } from "antd";
import { ReactNode, useState } from "react";
import { NavLink, useSubmit } from "@remix-run/react";

import ConfirmModal from "~/components/modals/ConfirmModal";

const AdminLayout = ({
  children,
  pageTitle,
  user,
  hasWrapper = true,
}: {
  user: any;
  children: ReactNode | any;
  pageTitle: string;
  hasWrapper?: boolean;
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const submit = useSubmit();

  const handleLogout = () => {
    submit(
      {},
      {
        action: "/logout",
        method: "POST",
      }
    );
  };

  const navLinks = [
    {
      label: "Dashboard",
      url: "/",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M13 21V11H21V21H13ZM3 13V3H11V13H3ZM9 11V5H5V11H9ZM3 21V15H11V21H3ZM5 19H9V17H5V19ZM15 19H19V13H15V19ZM13 3H21V9H13V3ZM15 5V7H19V5H15Z"></path>
        </svg>
      ),
      access: ["admin", "employee"],
    },
    {
      label: "Categories",
      url: "/categories",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M20.0834 15.1999L21.2855 15.9212C21.5223 16.0633 21.599 16.3704 21.457 16.6072C21.4147 16.6776 21.3559 16.7365 21.2855 16.7787L12.5145 22.0412C12.1979 22.2313 11.8022 22.2313 11.4856 22.0412L2.71463 16.7787C2.47784 16.6366 2.40106 16.3295 2.54313 16.0927C2.58536 16.0223 2.64425 15.9634 2.71463 15.9212L3.91672 15.1999L12.0001 20.0499L20.0834 15.1999ZM20.0834 10.4999L21.2855 11.2212C21.5223 11.3633 21.599 11.6704 21.457 11.9072C21.4147 11.9776 21.3559 12.0365 21.2855 12.0787L12.0001 17.6499L2.71463 12.0787C2.47784 11.9366 2.40106 11.6295 2.54313 11.3927C2.58536 11.3223 2.64425 11.2634 2.71463 11.2212L3.91672 10.4999L12.0001 15.3499L20.0834 10.4999ZM12.5145 1.30864L21.2855 6.5712C21.5223 6.71327 21.599 7.0204 21.457 7.25719C21.4147 7.32757 21.3559 7.38647 21.2855 7.42869L12.0001 12.9999L2.71463 7.42869C2.47784 7.28662 2.40106 6.97949 2.54313 6.7427C2.58536 6.67232 2.64425 6.61343 2.71463 6.5712L11.4856 1.30864C11.8022 1.11864 12.1979 1.11864 12.5145 1.30864ZM12.0001 3.33233L5.88735 6.99995L12.0001 10.6676L18.1128 6.99995L12.0001 3.33233Z"></path>
        </svg>
      ),
      access: ["admin"],
    },
    {
      label: "Products",
      url: "/products",
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
      access: ["admin"],
    },
    {
      label: "Services",
      url: "/services",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M5.32943 3.27152C6.56252 2.83314 7.9923 3.10743 8.97927 4.0944C9.96652 5.08165 10.2407 6.51196 9.80178 7.74529L20.6465 18.5901L18.5252 20.7114L7.67936 9.86703C6.44627 10.3054 5.01649 10.0311 4.02952 9.04415C3.04227 8.0569 2.7681 6.62659 3.20701 5.39326L5.44373 7.62994C6.02952 8.21572 6.97927 8.21572 7.56505 7.62994C8.15084 7.04415 8.15084 6.0944 7.56505 5.50862L5.32943 3.27152ZM15.6968 5.15506L18.8788 3.38729L20.293 4.80151L18.5252 7.98349L16.7574 8.33704L14.6361 10.4584L13.2219 9.04415L15.3432 6.92283L15.6968 5.15506ZM8.62572 12.9332L10.747 15.0546L5.79729 20.0043C5.2115 20.5901 4.26175 20.5901 3.67597 20.0043C3.12464 19.453 3.09221 18.5792 3.57867 17.99L3.67597 17.883L8.62572 12.9332Z"></path>
        </svg>
      ),
      access: ["admin"],
    },
    {
      label: "Sales Point",
      url: "/pos",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M17 2C17.5523 2 18 2.44772 18 3V7H21C21.5523 7 22 7.44772 22 8V18C22 18.5523 21.5523 19 21 19H18V21C18 21.5523 17.5523 22 17 22H7C6.44772 22 6 21.5523 6 21V19H3C2.44772 19 2 18.5523 2 18V8C2 7.44772 2.44772 7 3 7H6V3C6 2.44772 6.44772 2 7 2H17ZM16 17H8V20H16V17ZM20 9H4V17H6V16C6 15.4477 6.44772 15 7 15H17C17.5523 15 18 15.4477 18 16V17H20V9ZM8 10V12H5V10H8ZM16 4H8V7H16V4Z"></path>
        </svg>
      ),
      access: ["admin", "employee"],
    },
    {
      label: "Sales",
      url: "/sales",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M17.0047 16.0027H19.0047V4.00275H9.00468V6.00275H17.0047V16.0027ZM17.0047 18.0027V21.0019C17.0047 21.5546 16.5547 22.0027 15.9978 22.0027H4.01154C3.45548 22.0027 3.00488 21.5581 3.00488 21.0019L3.00748 7.00362C3.00759 6.45085 3.45752 6.00275 4.0143 6.00275H7.00468V3.00275C7.00468 2.45046 7.4524 2.00275 8.00468 2.00275H20.0047C20.557 2.00275 21.0047 2.45046 21.0047 3.00275V17.0027C21.0047 17.555 20.557 18.0027 20.0047 18.0027H17.0047ZM5.0073 8.00275L5.00507 20.0027H15.0047V8.00275H5.0073ZM7.00468 16.0027H11.5047C11.7808 16.0027 12.0047 15.7789 12.0047 15.5027C12.0047 15.2266 11.7808 15.0027 11.5047 15.0027H8.50468C7.12397 15.0027 6.00468 13.8835 6.00468 12.5027C6.00468 11.122 7.12397 10.0027 8.50468 10.0027H9.00468V9.00275H11.0047V10.0027H13.0047V12.0027H8.50468C8.22854 12.0027 8.00468 12.2266 8.00468 12.5027C8.00468 12.7789 8.22854 13.0027 8.50468 13.0027H11.5047C12.8854 13.0027 14.0047 14.122 14.0047 15.5027C14.0047 16.8835 12.8854 18.0027 11.5047 18.0027H11.0047V19.0027H9.00468V18.0027H7.00468V16.0027Z"></path>
        </svg>
      ),
      access: ["admin", "employee"],
    },
    {
      label: "Orders",
      url: "/orders",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M11.8611 2.39057C12.8495 1.73163 14.1336 1.71797 15.1358 2.35573L19.291 4.99994H20.9998C21.5521 4.99994 21.9998 5.44766 21.9998 5.99994V14.9999C21.9998 15.5522 21.5521 15.9999 20.9998 15.9999H19.4801C19.5396 16.9472 19.0933 17.9102 18.1955 18.4489L13.1021 21.505C12.4591 21.8907 11.6609 21.8817 11.0314 21.4974C10.3311 22.1167 9.2531 22.1849 8.47104 21.5704L3.33028 17.5312C2.56387 16.9291 2.37006 15.9003 2.76579 15.0847C2.28248 14.7057 2 14.1254 2 13.5109V6C2 5.44772 2.44772 5 3 5H7.94693L11.8611 2.39057ZM4.17264 13.6452L4.86467 13.0397C6.09488 11.9632 7.96042 12.0698 9.06001 13.2794L11.7622 16.2518C12.6317 17.2083 12.7903 18.6135 12.1579 19.739L17.1665 16.7339C17.4479 16.5651 17.5497 16.2276 17.4448 15.9433L13.0177 9.74551C12.769 9.39736 12.3264 9.24598 11.9166 9.36892L9.43135 10.1145C8.37425 10.4316 7.22838 10.1427 6.44799 9.36235L6.15522 9.06958C5.58721 8.50157 5.44032 7.69318 5.67935 7H4V13.5109L4.17264 13.6452ZM14.0621 4.04306C13.728 3.83047 13.3 3.83502 12.9705 4.05467L7.56943 7.65537L7.8622 7.94814C8.12233 8.20827 8.50429 8.30456 8.85666 8.19885L11.3419 7.45327C12.5713 7.08445 13.8992 7.53859 14.6452 8.58303L18.5144 13.9999H19.9998V6.99994H19.291C18.9106 6.99994 18.5381 6.89148 18.2172 6.68727L14.0621 4.04306ZM6.18168 14.5448L4.56593 15.9586L9.70669 19.9978L10.4106 18.7659C10.6256 18.3897 10.5738 17.9178 10.2823 17.5971L7.58013 14.6247C7.2136 14.2215 6.59175 14.186 6.18168 14.5448Z"></path>
        </svg>
      ),
      access: ["admin", "employee"],
    },
    {
      label: "Customers",
      url: "/customers",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M2 22C2 17.5817 5.58172 14 10 14C14.4183 14 18 17.5817 18 22H16C16 18.6863 13.3137 16 10 16C6.68629 16 4 18.6863 4 22H2ZM10 13C6.685 13 4 10.315 4 7C4 3.685 6.685 1 10 1C13.315 1 16 3.685 16 7C16 10.315 13.315 13 10 13ZM10 11C12.21 11 14 9.21 14 7C14 4.79 12.21 3 10 3C7.79 3 6 4.79 6 7C6 9.21 7.79 11 10 11ZM18.2837 14.7028C21.0644 15.9561 23 18.752 23 22H21C21 19.564 19.5483 17.4671 17.4628 16.5271L18.2837 14.7028ZM17.5962 3.41321C19.5944 4.23703 21 6.20361 21 8.5C21 11.3702 18.8042 13.7252 16 13.9776V11.9646C17.6967 11.7222 19 10.264 19 8.5C19 7.11935 18.2016 5.92603 17.041 5.35635L17.5962 3.41321Z"></path>
        </svg>
      ),
      access: ["admin", "employee"],
    },
    {
      label: "Operators",
      url: "/operators",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M2 22C2 17.5817 5.58172 14 10 14C14.4183 14 18 17.5817 18 22H16C16 18.6863 13.3137 16 10 16C6.68629 16 4 18.6863 4 22H2ZM10 13C6.685 13 4 10.315 4 7C4 3.685 6.685 1 10 1C13.315 1 16 3.685 16 7C16 10.315 13.315 13 10 13ZM10 11C12.21 11 14 9.21 14 7C14 4.79 12.21 3 10 3C7.79 3 6 4.79 6 7C6 9.21 7.79 11 10 11ZM18.2837 14.7028C21.0644 15.9561 23 18.752 23 22H21C21 19.564 19.5483 17.4671 17.4628 16.5271L18.2837 14.7028ZM17.5962 3.41321C19.5944 4.23703 21 6.20361 21 8.5C21 11.3702 18.8042 13.7252 16 13.9776V11.9646C17.6967 11.7222 19 10.264 19 8.5C19 7.11935 18.2016 5.92603 17.041 5.35635L17.5962 3.41321Z"></path>
        </svg>
      ),
      access: ["admin", "employee"],
    },
    {
      label: "Employees",
      url: "/employees",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H18C18 18.6863 15.3137 16 12 16C8.68629 16 6 18.6863 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z"></path>
        </svg>
      ),
      access: ["admin"],
    },
    {
      label: "Report",
      url: "/reports",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H18C18 18.6863 15.3137 16 12 16C8.68629 16 6 18.6863 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z"></path>
        </svg>
      ),
      children: [
        {
          label: "General",
          url: "",
          end: true,
        },
      ],
      access: ["admin"],
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-0 lg:gap-3 h-screen bg-slate-300/50 lg:pl-0">
      {/* Sidebar */}
      <aside className="w-[17%] bg-blue-700 h-full flex-col pt-3 gap-3 hidden lg:flex">
        {/* app name */}
        <div className="px-3">
          <div className="rounded-2xl px-3 py-5 bg-blue-800/50">
            <div className="flex items-center gap-2 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-8 text-white"
                fill="currentColor"
              >
                <path d="M21 13V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V13H2V11L3 6H21L22 11V13H21ZM5 13V19H19V13H5ZM6 14H14V17H6V14ZM3 3H21V5H3V3Z"></path>
              </svg>
              <h2 className="font-sen font-bold text-white text-2xl">
                Nova Shop Pro
              </h2>
            </div>
            <p className="font-quicksand text-center text-xs text-white">
              LINAKESS CNC WOODWORKS
            </p>
          </div>
        </div>

        {/* nav links */}
        <div className="flex flex-col px-5 mt-4 flex-1 gap-1">
          {navLinks.map((link: any, index: number) => {
            if (link.access.includes(user.role)) {
              return (
                <NavLink
                  className={({ isActive }) =>
                    isActive
                      ? "text-white bg-blue-500/50 rounded-xl px-3 py-2 font-sen hover:bg-blue-500/50 transition-all duration-300 flex items-center gap-2"
                      : "text-white rounded-xl px-3 py-2 font-sen hover:bg-blue-500/50 transition-all duration-300 flex items-center gap-2"
                  }
                  to={link.url}
                  key={index}
                >
                  {link.icon}
                  {link.label}
                </NavLink>
              );
            }
          })}
        </div>

        {/* logout button */}
        <div className="flex flex-col items-center gap-2 px-5 py-2">
          <div className="">
            <p className="text-white">{user?.username}</p>
          </div>
          <Button
            danger
            className="bg-red-500/70 hover:!bg-red-500 flex items-center justify-start rounded-lg font-sen !text-white"
            onClick={() => setOpenConfirmModal(true)}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-4"
                fill="currentColor"
              >
                <path d="M6.26489 3.80698L7.41191 5.44558C5.34875 6.89247 4 9.28873 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 9.28873 18.6512 6.89247 16.5881 5.44558L17.7351 3.80698C20.3141 5.61559 22 8.61091 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 8.61091 3.68594 5.61559 6.26489 3.80698ZM11 12V2H13V12H11Z"></path>
              </svg>
            }
          >
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="h-full flex-1 flex flex-col gap-3 lg:gap-5 px-3 py-2">
        <header className="flex items-center justify-between bg-white rounded-xl px-4 py-2">
          <h3 className="text-2xl font-bold font-sen text-slate-800">
            {pageTitle}
          </h3>

          <Button
            type="text"
            onClick={() => setMenuVisible(true)}
            className="px-1 lg:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-6 h-6 text-slate-800"
              fill="currentColor"
            >
              <path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z"></path>
            </svg>
          </Button>
        </header>

        <section
          className={`flex-1 ${
            hasWrapper && "bg-white"
          } rounded-xl p-4 h-full overflow-y-hidden`}
        >
          {children}
        </section>
      </main>

      {/* Mobile Nav */}
      <Drawer open={menuVisible} onClose={() => setMenuVisible(false)}>
        <div className="h-full flex flex-col items-center justify-center gap-1">
          {navLinks.map((link: any, index: number) => (
            <NavLink
              className={({ isActive }) =>
                isActive
                  ? "text-white bg-blue-500 rounded-xl px-3 py-2 font-sen hover:bg-blue-500 transition-all duration-300 flex items-center gap-2"
                  : "text-slate-700 rounded-xl px-3 py-2 font-sen hover:bg-blue-500 hover:text-white transition-all duration-300 flex items-center gap-2"
              }
              to={link.url}
              key={index}
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </div>
      </Drawer>

      {/* Confirm logout */}
      <ConfirmModal
        title="Confirm logout"
        text="Are you sure to sign out?"
        handleOk={handleLogout}
        openModal={openConfirmModal}
        setOpenModal={setOpenConfirmModal}
      />
    </div>
  );
};

export default AdminLayout;
