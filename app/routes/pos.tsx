/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState, useEffect } from "react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import {
  Link,
  Outlet,
  useActionData,
  useLoaderData,
  useLocation,
  useOutletContext,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import ProductController from "~/controllers/ProductController.server";
import AdminLayout from "~/layouts/adminLayout";
import pkg from "react-to-print";
const { useReactToPrint } = pkg;

import { Button, Input, Modal, Form, Select, Drawer } from "antd";
import CartController from "~/controllers/CartController.server";
import OrderController from "~/controllers/OrderController.server";
import { AdminInterface, ProductInterface } from "~/types";
import AdminController from "~/controllers/AdminController.server";
import CustomerController from "~/controllers/CustomerController.server";

import ConfirmCheckout from "~/components/modals/ConfirmCheckout";
import CreateModal from "~/components/modals/CreateModal";
import companyLogo from "~/assets/logo.png";
import { set } from "mongoose";

export default function POS() {
  const actionData = useActionData();
  const submit = useSubmit();
  const { pathname } = useLocation();
  const { cartItems, serviceItems, customers, user } = useLoaderData<{
    cartItems: ProductInterface[];
    products: ProductInterface[];
    serviceItems: ProductInterface[];
    user: AdminInterface;
  }>();
  const [openCheckoutModal, setOpenCheckoutModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  const [checkoutForm] = Form.useForm();
  const [invoiceCode, setInvoiceCode] = useState("");
  const { Item } = Form;

  const calculateTotal = () => {
    // calculate grand total of cart items and services
    const grandTotal = cartItems.reduce(
      (acc: number, item: any) => acc + item.product.price * item.quantity,
      0
    );

    const serviceTotal = serviceItems.reduce(
      (acc: number, item: any) => acc + item.service.price * item.quantity,
      0
    );

    // calculate total amount
    const totalAmount = grandTotal + serviceTotal;
    return totalAmount;
  };

  const receiptRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
  });

  function generateInvoiceCode() {
    const prefix = "INV";
    const randomPart = Math.floor(Math.random() * 9000000) + 1000000; // Generates a random 7-character alphanumeric string
    return prefix + randomPart;
  }
  useEffect(() => {
    setInvoiceCode(generateInvoiceCode());
  }, []);

  useEffect(() => {
    if (actionData) {
      generateInvoiceCode();
      handlePrint();
    }
  }, [actionData]);

  const [searchText, setSearchText] = useState("");

  // action data
  const handleCheckout = () => {
    try {
      checkoutForm.validateFields().then((values) => {
        submit(
          { actionType: "complete", ...values, invoiceCode },
          {
            method: "POST",
          }
        );
      });
    } catch (error) {
      console.log(error);
    } finally {
      setOpenCheckoutModal(false);
    }
  };

  const [selectedCustomer, setSelectedCustomer] = useState("");
  const customersSelectData = customers.map((customer: any) => ({
    value: customer._id,
    label: customer.fullName,
  }));

  const changeSelectedCustomer = (value: any) => {
    setSelectedCustomer(
      customers.find((customer: any) => customer._id == value)?.fullName
    );
  };

  const [amountPaid, setAmountPaid] = useState(0);
  const [cashBalance, setCashBalance] = useState(calculateTotal());
  const [discounted, setDiscounted] = useState(0);

  const [openCart, setOpenCart] = useState(false);

  useEffect(() => {
    if (openCheckoutModal) {
      setCashBalance(345);
    }
  }, [openCheckoutModal]);

  useEffect(() => {
    const totalAmount = calculateTotal();
    const balance =
      amountPaid -
      (totalAmount - parseFloat(checkoutForm.getFieldValue("discount")));
    const updatedBalance = isNaN(balance) ? 0 : balance; // Check if balance is NaN

    checkoutForm.setFieldsValue({ balance: updatedBalance });
    setCashBalance(updatedBalance);
  }, [amountPaid, discounted, cashBalance]);

  const filterOption = (
    input: string,
    option?: { label: string; value: string }
  ) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const [createCustomerForm] = Form.useForm();
  const [openCustomerModal, setOpenCustomerModal] = useState(false);

  return (
    <AdminLayout pageTitle="Sales Point" user={user}>
      <div className="flex flex-col h-full">
        {/* top bar - tabs, search input */}
        <div className="flex items-center justify-between gap-4 mb-5 h-max">
          <div className="flex items-center gap-4 text-xs lg:text-base">
            <Link
              className={`${pathname === "/pos" ? "text-blue-600" : ""}`}
              to="/pos"
            >
              Products
            </Link>
            <Link
              className={`${
                pathname === "/pos/services" ? "text-blue-600" : ""
              }`}
              to="/pos/services"
            >
              Services
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Input
              placeholder="Search products"
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        {/* mobile view cart button */}
        <div className="flex items-center justify-end gap-4 lg:hidden">
          <Button
            className="text-sm flex items-center justify-center gap-2"
            onClick={() => setOpenCart(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M6.00488 9H19.9433L20.4433 7H8.00488V5H21.7241C22.2764 5 22.7241 5.44772 22.7241 6C22.7241 6.08176 22.7141 6.16322 22.6942 6.24254L20.1942 16.2425C20.083 16.6877 19.683 17 19.2241 17H5.00488C4.4526 17 4.00488 16.5523 4.00488 16V4H2.00488V2H5.00488C5.55717 2 6.00488 2.44772 6.00488 3V9ZM6.00488 23C4.90031 23 4.00488 22.1046 4.00488 21C4.00488 19.8954 4.90031 19 6.00488 19C7.10945 19 8.00488 19.8954 8.00488 21C8.00488 22.1046 7.10945 23 6.00488 23ZM18.0049 23C16.9003 23 16.0049 22.1046 16.0049 21C16.0049 19.8954 16.9003 19 18.0049 19C19.1095 19 20.0049 19.8954 20.0049 21C20.0049 22.1046 19.1095 23 18.0049 23Z"></path>
            </svg>
            View Cart
          </Button>
        </div>

        {/* data table and cart */}
        <div className="flex-1 flex gap-4 h-full">
          <Outlet context={{ searchText }} />

          {/* Cart section */}
          <div className="w-[25%] bg-slate-200/30 rounded-xl p-4 pb-2 h-[92%] hidden lg:flex flex-col justify-between  gap-2">
            {/* product cart items */}
            <div className="h-[45%] flex flex-col gap-1 overflow-hidden">
              <div className="flex items-center justify-between h-max">
                <h3 className="text-xl font-bold font-poppins">Cart</h3>
                <Button
                  onClick={() => {
                    submit(
                      { actionType: "clear_cart" },
                      {
                        method: "POST",
                      }
                    );
                  }}
                  className={`${
                    cartItems.length === 0 ? "hidden" : "flex"
                  } items-center font-sen rounded-lg hover:!text-white hover:bg-red-500`}
                  danger
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="w-4 h-4"
                      fill="currentColor"
                    >
                      <path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 11H11V17H9V11ZM13 11H15V17H13V11ZM9 4V6H15V4H9Z"></path>
                    </svg>
                  }
                >
                  Clear
                </Button>
              </div>

              {/* cart items */}
              <div className="max-h-[85%] flex flex-col gap-1 overflow-y-auto">
                {cartItems.map((item: any, index: number) => (
                  <div
                    className="flex flex-col rounded-xl bg-white px-3 py-2"
                    key={index}
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-sen text-slate-700 text-sm">
                        {item.product.name}
                      </h4>
                      <p className="text-slate-700 font-sen text-sm">
                        {item.quantity * item.product.price}
                      </p>
                    </div>

                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          type="text"
                          className="px-2"
                          onClick={() => {
                            submit(
                              {
                                product_id: item.product._id,
                                actionType: "decrease",
                              },
                              {
                                method: "POST",
                              }
                            );
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="w-4 h-4"
                            fill="currentColor"
                          >
                            <path d="M19 11H5V13H19V11Z"></path>
                          </svg>
                        </Button>
                        <Input
                          type="number"
                          className="w-20 text-center"
                          defaultValue={item.quantity}
                          value={item.quantity}
                          onChange={(e) => {
                            submit(
                              {
                                product_id: item.product._id,
                                actionType: "change_quantity",
                                quantity: e.target.value,
                              },
                              {
                                method: "POST",
                              }
                            );
                          }}
                        />
                        <Button
                          type="text"
                          className="px-2"
                          onClick={() => {
                            submit(
                              {
                                product_id: item.product._id,
                                actionType: "increase",
                              },
                              {
                                method: "POST",
                              }
                            );
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="w-4 h-4"
                            fill="currentColor"
                          >
                            <path d="M11 115JKNpoXuiCdkxEBwi4j2fw83LP3K8T6H11Z"></path>
                          </svg>
                        </Button>
                      </div>
                      <Button type="text" className="px-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="w-4 h-4"
                          fill="currentColor"
                          onClick={() => {
                            submit(
                              {
                                product_id: item.product._id,
                                actionType: "remove_from_cart",
                              },
                              {
                                method: "POST",
                              }
                            );
                          }}
                        >
                          <path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path>
                        </svg>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* service cart items */}
            <div className="h-[45%] flex flex-col gap-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold font-poppins">Services</h3>
                <Button
                  onClick={() => {
                    submit(
                      { actionType: "clear_service_cart" },
                      {
                        method: "POST",
                      }
                    );
                  }}
                  className={`${
                    serviceItems.length === 0 ? "hidden" : "flex"
                  } items-center font-sen rounded-lg hover:!text-white hover:bg-red-500`}
                  danger
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="w-4 h-4"
                      fill="currentColor"
                    >
                      <path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 11H11V17H9V11ZM13 11H15V17H13V11ZM9 4V6H15V4H9Z"></path>
                    </svg>
                  }
                >
                  Clear
                </Button>
              </div>

              {/* items list */}
              <div className="max-h-[85%] flex flex-col gap-1 overflow-y-auto">
                {serviceItems.map((item: any, index: number) => (
                  <div
                    className="flex flex-col rounded-xl bg-white px-3 py-2"
                    key={index}
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-sen text-slate-700 text-sm">
                        {item.service.name}
                      </h4>
                      <p className="text-slate-700 font-sen text-sm">
                        {item.quantity * item.service.price}
                      </p>
                    </div>

                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          type="text"
                          className="px-2"
                          onClick={() => {
                            submit(
                              {
                                service_id: item.service._id,
                                actionType: "decrease_service",
                              },
                              {
                                method: "POST",
                              }
                            );
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="w-4 h-4"
                            fill="currentColor"
                          >
                            <path d="M19 11H5V13H19V11Z"></path>
                          </svg>
                        </Button>
                        <Input
                          type="number"
                          className="w-16 text-center"
                          defaultValue={item.quantity}
                          value={item.quantity}
                          onChange={(e) => {
                            submit(
                              {
                                service_id: item.service._id,
                                actionType: "change_service_quantity",
                                quantity: e.target.value,
                              },
                              {
                                method: "POST",
                              }
                            );
                          }}
                        />
                        <Button
                          type="text"
                          className="px-2"
                          onClick={() => {
                            submit(
                              {
                                service_id: item.service._id,
                                actionType: "increase_service",
                              },
                              {
                                method: "POST",
                              }
                            );
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="w-4 h-4"
                            fill="currentColor"
                          >
                            <path d="M11 115JKNpoXuiCdkxEBwi4j2fw83LP3K8T6H11Z"></path>
                          </svg>
                        </Button>
                      </div>
                      <Button type="text" className="px-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="w-4 h-4"
                          fill="currentColor"
                          onClick={() => {
                            submit(
                              {
                                service_id: item.service._id,
                                actionType: "remove_service_from_cart",
                              },
                              {
                                method: "POST",
                              }
                            );
                          }}
                        >
                          <path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path>
                        </svg>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* checkout button */}
            <Button
              size="large"
              type="primary"
              onClick={() => setOpenConfirmModal(true)}
              className={`${
                cartItems.length === 0 && serviceItems.length === 0
                  ? "hidden"
                  : "flex"
              } items-center justify-center rounded-xl bg-blue-500 !text-center w-full h-[6%] font-sen`}
            >
              Confirm Checkout
            </Button>
          </div>
        </div>
      </div>

      <Modal
        centered
        open={openConfirmModal}
        onCancel={() => setOpenConfirmModal(false)}
        onOk={() => {
          setOpenCheckoutModal(true);
          setOpenConfirmModal(!openConfirmModal);
        }}
        okButtonProps={{
          className: "!text-white !bg-blue-600 hover:!bg-blue-500 font-sen",
        }}
      >
        <h4 className="font-sen text-slate-700">Are you sure to checkout?</h4>
      </Modal>

      {/* checkout modal */}
      <ConfirmCheckout
        openModal={openCheckoutModal}
        setOpenModal={() => setOpenCheckoutModal(false)}
        title="Confirm checkout"
        handleCheckout={handleCheckout}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Form layout="vertical" requiredMark={false} form={checkoutForm}>
              <Item
                label="Select Customer"
                name={"customer"}
                rules={[{ required: true }]}
              >
                <Select
                  allowClear
                  showSearch
                  filterOption={filterOption}
                  options={customersSelectData}
                  onChange={changeSelectedCustomer}
                />
              </Item>

              <Item
                label="Total Amount"
                name={"total_amount"}
                initialValue={calculateTotal()}
              >
                <Input type="number" disabled />
              </Item>

              <Item
                label="Cash tendered"
                name={"amount_paid"}
                hasFeedback
                rules={[{ required: true }]}
              >
                <Input
                  type="number"
                  onChange={(e: any) => {
                    setAmountPaid(parseFloat(e.target.value));
                    if (e.target.value === 0) {
                      setCashBalance(calculateTotal());
                    }
                    if (e.target.value === "") setAmountPaid(0);
                  }}
                />
              </Item>

              {/* discount */}
              <Item label="Discount" name={"discount"} initialValue={0.0}>
                <Input
                  type="number"
                  onChange={(e) => setDiscounted(parseFloat(e.target.value))}
                />
              </Item>

              <Item label="Balance" name={"balance"} initialValue={0.0}>
                <Input type="text" disabled />
              </Item>
            </Form>
          </div>

          {/* receipt */}
          <div className="px-5">
            <div
              className="bg-white flex flex-col gap-2 border p-2"
              ref={receiptRef}
            >
              <div className="flex items-center gap-3">
                <img src={companyLogo} alt="" className="w-10 h-10" />
                <div>
                  <h3 className="font-sen text-sm font-bold">
                    LinaKess CNC Woodworks
                  </h3>
                  <p className="font-poppins text-black text-[11px]">
                    Tel: +233549585775 / 0303963181
                  </p>
                  <p className="font-poppins text-black text-[11px]">
                    TIN No.: P0022062653
                  </p>
                </div>
              </div>
              {/* bill to */}
              <div className="flex-1">
                <h3 className="font-poppins text-[12px]">
                  Bill To: <span className="font-bold">{selectedCustomer}</span>
                </h3>
              </div>
              {/* bill to */}
              <div className="flex-1">
                <h3 className="font-poppins text-[12px]">
                  Cashier: <span className="font-bold">{user?.username}</span>
                </h3>
              </div>

              {/* title, date and invoice code */}
              <div>
                <h4 className="font-poppins font-bold text-sm text-black text-center">
                  Sales Receipt
                </h4>
                <div className="flex items-center justify-between">
                  <p className="font-poppins text-[12px]">
                    Date:{" "}
                    {new Date().toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}{" "}
                  </p>
                  <p className="font-poppins text-[11px] uppercase">
                    Invoice #: {invoiceCode}
                  </p>
                </div>
              </div>

              {/* table */}
              <table className="w-full">
                <thead>
                  <tr className="text-left font-bold border-black border-b">
                    <th className="font-poppins text-[11px]">Item</th>
                    <th className="font-poppins text-[11px]">Qty</th>
                    <th className="font-poppins text-[11px]">Price</th>
                    <th className="font-poppins text-[11px]">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      className="font-poppins text-[11px] font-bold"
                      colSpan={4}
                    >
                      Products
                    </td>
                  </tr>
                  {cartItems.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="font-poppins text-[11px]">
                        {item.product.name}
                      </td>
                      <td className="font-poppins text-[11px]">
                        {item.quantity}
                      </td>
                      <td className="font-poppins text-[11px]">
                        {item.product.price}
                      </td>
                      <td className="font-poppins text-[11px] text-right">
                        {item.quantity * item.product.price}
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tbody>
                  <tr>
                    <td
                      className="font-poppins text-[11px] font-bold"
                      colSpan={4}
                    >
                      Services
                    </td>
                  </tr>
                  {serviceItems.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="font-poppins text-[11px]">
                        {item.service.name}
                      </td>
                      <td className="font-poppins text-[11px]">
                        {item.quantity}
                      </td>
                      <td className="font-poppins text-[11px]">
                        {item.service.price}
                      </td>
                      <td className="font-poppins text-[11px] text-right">
                        {item.quantity * item.service.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* total */}
              <div className="flex items-center justify-between font-bold mt-4 border-black border-t">
                <p className="font-poppins text-[11px]">Total</p>
                <p className="font-poppins text-[11px]">{calculateTotal()}</p>
              </div>

              {/* discount */}
              <div className="flex items-center justify-between font-bold">
                <p className="font-poppins text-[11px]">Discount</p>
                <p className="font-poppins text-[11px]">{discounted}</p>
              </div>

              {/* amount paid */}
              <div className="flex items-center justify-between font-bold">
                <p className="font-poppins text-[11px]">Amount Paid</p>
                <p className="font-poppins text-[11px]">{amountPaid}</p>
              </div>

              {/* balance */}
              <div className="flex items-center justify-between font-bold">
                <p className="font-poppins text-[11px]">Balance</p>
                <p className="font-poppins text-[11px]">
                  {`${cashBalance < 0 ? "Owing" : "Change"}: ${cashBalance}`}
                </p>
              </div>

              {/* footer */}
              <div className="flex items-center justify-center mt-4 border-t border-black pt-2">
                <p className="font-poppins text-[10px] italic text-center">
                  Thank you for your patronage
                </p>
              </div>
            </div>
          </div>
        </div>
      </ConfirmCheckout>

      {/* view cart drawer */}
      <Drawer
        title="Cart"
        placement="right"
        closable={true}
        onClose={() => setOpenCart(false)}
        open={openCart}
      >
        <div className="bg-slate-200/30 rounded-xl p-4 pb-2 min-h-full flex flex-col justify-between">
          {/* product cart items */}
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center justify-between h-max">
              <h3 className="text-xl font-bold font-poppins">Cart</h3>
              <Button
                onClick={() => {
                  submit(
                    { actionType: "clear_cart" },
                    {
                      method: "POST",
                    }
                  );
                }}
                className={`${
                  cartItems.length === 0 ? "hidden" : "flex"
                } items-center font-sen rounded-lg hover:!text-white hover:bg-red-500`}
                danger
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    fill="currentColor"
                  >
                    <path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 11H11V17H9V11ZM13 11H15V17H13V11ZM9 4V6H15V4H9Z"></path>
                  </svg>
                }
              >
                Clear
              </Button>
            </div>

            {/* cart items */}
            <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
              {cartItems.map((item: any, index: number) => (
                <div
                  className="flex flex-col rounded-xl bg-white px-3 py-2"
                  key={index}
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-sen text-slate-700 text-sm">
                      {item.product.name}
                    </h4>
                    <p className="text-slate-700 font-sen text-sm">
                      {item.quantity * item.product.price}
                    </p>
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        type="text"
                        className="px-2"
                        onClick={() => {
                          submit(
                            {
                              product_id: item.product._id,
                              actionType: "decrease",
                            },
                            {
                              method: "POST",
                            }
                          );
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="w-4 h-4"
                          fill="currentColor"
                        >
                          <path d="M19 11H5V13H19V11Z"></path>
                        </svg>
                      </Button>
                      <Input
                        type="number"
                        className="w-20 text-center"
                        defaultValue={item.quantity}
                        value={item.quantity}
                        onChange={(e) => {
                          submit(
                            {
                              product_id: item.product._id,
                              actionType: "change_quantity",
                              quantity: e.target.value,
                            },
                            {
                              method: "POST",
                            }
                          );
                        }}
                      />
                      <Button
                        type="text"
                        className="px-2"
                        onClick={() => {
                          submit(
                            {
                              product_id: item.product._id,
                              actionType: "increase",
                            },
                            {
                              method: "POST",
                            }
                          );
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="w-4 h-4"
                          fill="currentColor"
                        >
                          <path d="M11 115JKNpoXuiCdkxEBwi4j2fw83LP3K8T6H11Z"></path>
                        </svg>
                      </Button>
                    </div>
                    <Button type="text" className="px-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
                        fill="currentColor"
                        onClick={() => {
                          submit(
                            {
                              product_id: item.product._id,
                              actionType: "remove_from_cart",
                            },
                            {
                              method: "POST",
                            }
                          );
                        }}
                      >
                        <path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path>
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* service cart items */}
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold font-poppins">Services</h3>
              <Button
                onClick={() => {
                  submit(
                    { actionType: "clear_service_cart" },
                    {
                      method: "POST",
                    }
                  );
                }}
                className={`${
                  serviceItems.length === 0 ? "hidden" : "flex"
                } items-center font-sen rounded-lg hover:!text-white hover:bg-red-500`}
                danger
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    fill="currentColor"
                  >
                    <path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 11H11V17H9V11ZM13 11H15V17H13V11ZM9 4V6H15V4H9Z"></path>
                  </svg>
                }
              >
                Clear
              </Button>
            </div>

            {/* items list */}
            <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
              {serviceItems.map((item: any, index: number) => (
                <div
                  className="flex flex-col rounded-xl bg-white px-3 py-2"
                  key={index}
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-sen text-slate-700 text-sm">
                      {item.service.name}
                    </h4>
                    <p className="text-slate-700 font-sen text-sm">
                      {item.quantity * item.service.price}
                    </p>
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        type="text"
                        className="px-2"
                        onClick={() => {
                          submit(
                            {
                              service_id: item.service._id,
                              actionType: "decrease_service",
                            },
                            {
                              method: "POST",
                            }
                          );
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="w-4 h-4"
                          fill="currentColor"
                        >
                          <path d="M19 11H5V13H19V11Z"></path>
                        </svg>
                      </Button>
                      <Input
                        type="number"
                        className="w-16 text-center"
                        defaultValue={item.quantity}
                        value={item.quantity}
                        onChange={(e) => {
                          submit(
                            {
                              service_id: item.service._id,
                              actionType: "change_service_quantity",
                              quantity: e.target.value,
                            },
                            {
                              method: "POST",
                            }
                          );
                        }}
                      />
                      <Button
                        type="text"
                        className="px-2"
                        onClick={() => {
                          submit(
                            {
                              service_id: item.service._id,
                              actionType: "increase_service",
                            },
                            {
                              method: "POST",
                            }
                          );
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="w-4 h-4"
                          fill="currentColor"
                        >
                          <path d="M11 115JKNpoXuiCdkxEBwi4j2fw83LP3K8T6H11Z"></path>
                        </svg>
                      </Button>
                    </div>
                    <Button type="text" className="px-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
                        fill="currentColor"
                        onClick={() => {
                          submit(
                            {
                              service_id: item.service._id,
                              actionType: "remove_service_from_cart",
                            },
                            {
                              method: "POST",
                            }
                          );
                        }}
                      >
                        <path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path>
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* checkout button */}
          <Button
            size="large"
            type="primary"
            onClick={() => setOpenConfirmModal(true)}
            className={`${
              cartItems.length === 0 && serviceItems.length === 0
                ? "hidden"
                : "flex"
            } items-center justify-center rounded-xl bg-blue-500 !text-center w-full`}
          >
            Confirm Checkout
          </Button>
        </div>
      </Drawer>

      {/* Create Modal */}
      <CreateModal
        openModal={openCustomerModal}
        setOpenModal={() => setOpenCustomerModal(false)}
        title="Add New Customer"
        formType={createCustomerForm}
      >
        <Item
          label="Customer Name"
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
    </AdminLayout>
  );
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const cartController = await new CartController(request);
  const orderController = await new OrderController(request);

  const product = formData.get("product_id") as string;
  const service = formData.get("service_id") as string;
  const quantity = formData.get("quantity") as string;
  const actionType = formData.get("actionType") as string;

  if (actionType == "complete") {
    return await orderController.checkout({
      orderId: formData.get("invoiceCode") as string,
      discount: formData.get("discount") as string,
      customer: formData.get("customer") as string,
      onCredit: formData.get("on_credit") as string,
      reservePickup: formData.get("reservePickup") as string,
      amountPaid: formData.get("amount_paid") as string,
      balance: formData.get("balance") as string,
    });
  } else if (actionType == "change_quantity") {
    return await cartController.changeQuantity({ product, quantity });
  } else if (actionType == "increase") {
    return await cartController.increaseItem({ product });
  } else if (actionType == "decrease") {
    return await cartController.decreaseItem({ product });
  } else if (actionType == "add_to_cart") {
    return await cartController.addToCart({
      product,
    });
  } else if (actionType == "remove_from_cart") {
    return await cartController.removeFromCart({
      product,
    });
  } else if (actionType == "clear_cart") {
    return await cartController.clearCart();
  }
  //   for services
  else if (actionType == "change_service_quantity") {
    return await cartController.changeServiceQuantity({ service, quantity });
  } else if (actionType == "increase_service") {
    return await cartController.increaseServiceItem({ service });
  } else if (actionType == "decrease_service") {
    return await cartController.decreaseServiceItem({ service });
  } else if (actionType == "remove_service_from_cart") {
    return await cartController.removServiceFromCart({
      service,
    });
  } else if (actionType == "clear_service_cart") {
    return await cartController.clearServiceCart();
  }
  return true;
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") as string) || 1;
  const search_term = url.searchParams.get("search_term") as string;

  const adminController = await new AdminController(request);
  await adminController.requireAdminId();
  const user = await adminController.getAdmin();

  const productController = await new ProductController(request);
  // const { products, totalPages } = await productController.getProducts({
  //   page,
  //   search_term,
  //   limit: 16,
  // });

  const featured_categories = await productController.getFeaturedCategories();

  const cartController = await new CartController(request);
  const { cartItems, serviceItems } = await cartController.getUserCart({
    user: (await adminController.getAdminId()) as string,
  });

  const customerController = await new CustomerController(request);
  const customers = await customerController.getCustomersx();

  return {
    user,
    featured_categories,
    page,
    // totalPages,
    search_term,
    cartItems,
    serviceItems,
    customers,
  };
};
