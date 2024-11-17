/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import companyLogo from "~/assets/logo.png";
import { AdminInterface } from "~/types";

const OrderInvoice = ({
  printoutRef,
  orderData,
  user,
}: {
  printoutRef: React.MutableRefObject<HTMLDivElement | null>;
  orderData: any;
  user: AdminInterface;
}) => {
  const [invoiceCode, setInvoiceCode] = useState("");

  //   generate invoice code using current timestamp
  useEffect(() => {
    const date = new Date();
    const code = `INV-${date.getTime()}`;
    setInvoiceCode(code);
  }, []);
  return (
    <div className="px-5 hidden">
      <div
        className="bg-white flex flex-col gap-2 border p-2"
        ref={printoutRef}
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
            Customer:{" "}
            <span className="font-bold">{orderData?.customer?.fullName}</span>
          </h3>
        </div>
        {/* bill to */}
        <div className="flex-1">
          <h3 className="font-poppins text-[12px]">
            Cashier:{" "}
            <span className="font-bold">{orderData?.user?.username}</span>
          </h3>
        </div>

        {/* title, date and invoice code */}
        <div>
          <h4 className="font-poppins font-bold text-sm text-black text-center">
            Order Invoice
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
              <td className="font-poppins text-[11px] font-bold" colSpan={4}>
                Order Items
              </td>
            </tr>
            {orderData?.items?.map((item: any, index: number) => (
              <tr key={index}>
                <td className="font-poppins text-[11px]">
                  {item?.productName}
                </td>
                <td className="font-poppins text-[11px]">{item?.quantity}</td>
                <td className="font-poppins text-[11px]">{item?.price}</td>
                <td className="font-poppins text-[11px] text-right">
                  {item?.quantity * item?.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* total */}
        <div className="flex items-center justify-between font-bold mt-4 border-black border-t">
          <p className="font-poppins text-[11px]">Amount Payable</p>
          <p className="font-poppins text-[11px]">{orderData?.totalPrice}</p>
        </div>
      </div>

      {/* footer */}
      <div className="flex items-center justify-center mt-4 border-t border-black pt-2">
        <p className="font-poppins text-[10px] italic text-center">
          Thank you for your patronage
        </p>
      </div>
    </div>
  );
};

export default OrderInvoice;
