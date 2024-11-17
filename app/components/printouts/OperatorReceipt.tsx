/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import companyLogo from "~/assets/logo.png";
import { AdminInterface } from "~/types";

const OperatorReceipt = ({
  printoutRef,
  stockData,
  paymentData,
  user,
  operatorName,
}: {
  printoutRef: React.MutableRefObject<HTMLDivElement | null>;
  stockData: any;
  paymentData: any;
  user: AdminInterface;
  operatorName: string;
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
            Operator: <span className="font-bold">{operatorName}</span>
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
            Payment Receipt
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
              <th className="font-poppins text-[11px]">Date</th>
              <th className="font-poppins text-[11px]">Product</th>
              <th className="font-poppins text-[11px]">Stock</th>
              <th className="font-poppins text-[11px]">Comm</th>
              <th className="font-poppins text-[11px]">U. Price</th>
              <th className="font-poppins text-[11px]">Total Amt</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-poppins text-[11px] font-bold" colSpan={6}>
                Stock Items
              </td>
            </tr>
            {stockData?.map((item: any, index: number) => (
              <tr key={index}>
                <td className="font-poppins text-[11px]">
                  {new Date(item.createdAt).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </td>
                <td className="font-poppins text-[11px]">
                  {item?.product?.name}
                </td>
                <td className="font-poppins text-[11px]">
                  {item?.totalQuantity}
                </td>
                <td className="font-poppins text-[11px]">{item?.commission}</td>
                <td className="font-poppins text-[11px]">{item?.unitPrice}</td>
                <td className="font-poppins text-[11px] text-right">
                  {item?.amountPayable}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* payment table */}
        <div>
          <h4 className="font-poppins font-bold text-sm text-black">
            Payments
          </h4>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left font-bold border-black border-b">
              <th className="font-poppins text-[11px]">Date</th>
              <th className="font-poppins text-[11px]">Amount</th>
              <th className="font-poppins text-[11px]">Type</th>
            </tr>
          </thead>
          <tbody>
            {paymentData.length > 0 ? (
              paymentData.map((payment: any, index: number) => (
                <tr key={index}>
                  <td className="font-poppins text-[11px]">
                    {new Date(payment?.createdAt)
                      .toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                      })
                      .replace(/\//g, "-")}
                  </td>
                  <td className="font-poppins text-[11px]">
                    {payment?.amount}
                  </td>
                  <td className="font-poppins text-[11px] capitalize">
                    {payment?.transactionType}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="font-poppins text-[11px]" colSpan={6}>
                  No Payment
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* total */}
        <div className="flex items-center justify-between font-bold mt-4 border-black border-t">
          <p className="font-poppins text-[11px]">Amount Payable</p>
          <p className="font-poppins text-[11px]">
            {stockData?.reduce(
              (acc: number, item: any) => acc + item.amountPayable,
              0
            )}
          </p>
        </div>

        {/* total paid */}
        <div className="flex items-center justify-between font-bold">
          <p className="font-poppins text-[11px]">Amount Paid</p>
          <p className="font-poppins text-[11px]">
            {paymentData?.reduce(
              (acc: number, payment: any) => acc + payment.amount,
              0
            )}
          </p>
        </div>

        {/* balance */}
        <div className="flex items-center justify-between font-bold">
          <p className="font-poppins text-[11px]">Balance</p>
          <p className="font-poppins text-[11px]">
            {`${
              stockData?.reduce(
                (acc: number, item: any) => acc + item.amountPayable,
                0
              ) -
                paymentData?.reduce(
                  (acc: number, payment: any) => acc + payment.amount,
                  0
                ) >
              0
                ? "Owing"
                : "Change"
            }: ${
              stockData?.reduce(
                (acc: number, item: any) => acc + item.amountPayable,
                0
              ) -
              paymentData?.reduce(
                (acc: number, payment: any) => acc + payment.amount,
                0
              )
            }`}
          </p>
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

export default OperatorReceipt;
