/* eslint-disable @typescript-eslint/no-explicit-any */
import companyLogo from "~/assets/logo.png";

const SalesReceipt = ({
  saleItem,
  receiptRef,
}: {
  saleItem: any;
  receiptRef: any;
}) => {
  return (
    <div className="px-5 hidden">
      <div className="bg-white flex flex-col gap-2 border p-2" ref={receiptRef}>
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
            Bill To:{" "}
            <span className="font-bold">{saleItem?.customer?.fullName}</span>
          </h3>
        </div>
        {/* bill to */}
        <div className="flex-1">
          <h3 className="font-poppins text-[12px]">
            Cashier:{" "}
            <span className="font-bold">{saleItem?.user.username}</span>
          </h3>
        </div>

        {/* title, date and invoice code */}
        <div>
          <h4 className="font-poppins font-bold text-sm text-black text-center">
            Sales Receipt
          </h4>
          <div className="flex items-center justify-between">
            <p className="font-poppins text-[12px]">
              {new Date(saleItem?.createdAt)
                .toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
                .replace(/,/g, "")}
            </p>
            <p className="font-poppins text-[11px] uppercase">
              Invoice #: {saleItem?.orderId}
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
                Products
              </td>
            </tr>
            {saleItem?.orderItems.map((item: any, index: number) => (
              <tr key={index}>
                <td className="font-poppins text-[11px]">
                  {item.product.name}
                </td>
                <td className="font-poppins text-[11px]">{item.quantity}</td>
                <td className="font-poppins text-[11px]">
                  {item.sellingPrice}
                </td>
                <td className="font-poppins text-[11px] text-right">
                  {item.quantity * item.sellingPrice}
                </td>
              </tr>
            ))}
          </tbody>

          <tbody>
            <tr>
              <td className="font-poppins text-[11px] font-bold" colSpan={4}>
                Services
              </td>
            </tr>
            {saleItem?.orderServiceItems.map((item: any, index: number) => (
              <tr key={index}>
                <td className="font-poppins text-[11px]">
                  {item.service.name}
                </td>
                <td className="font-poppins text-[11px]">{item.quantity}</td>
                <td className="font-poppins text-[11px]">
                  {item.sellingPrice}
                </td>
                <td className="font-poppins text-[11px] text-right">
                  {item.quantity * item.sellingPrice}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* total */}
        <div className="flex items-center justify-between font-bold mt-4 border-black border-t">
          <p className="font-poppins text-[11px]">Total</p>
          <p className="font-poppins text-[11px]">
            {saleItem?.orderItems.reduce(
              (acc: number, item: any) =>
                acc + item.quantity * item.sellingPrice,
              0
            ) +
              saleItem?.orderServiceItems.reduce(
                (acc: number, item: any) =>
                  acc + item.quantity * item.sellingPrice,
                0
              )}
          </p>
        </div>

        {/* discount */}
        <div className="flex items-center justify-between font-bold">
          <p className="font-poppins text-[11px]">Discount</p>
          <p className="font-poppins text-[11px]">{saleItem?.discount}</p>
        </div>

        {/* amount paid */}
        <div className="flex items-center justify-between font-bold">
          <p className="font-poppins text-[11px]">Amount Paid</p>
          <p className="font-poppins text-[11px]">{saleItem?.amountPaid}</p>
        </div>

        {/* balance */}
        <div className="flex items-center justify-between font-bold">
          <p className="font-poppins text-[11px]">Balance</p>
          <p className="font-poppins text-[11px]">
            {`${saleItem?.balance < 0 ? "Owing" : "Change"}: ${
              saleItem?.balance
            }`}
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
  );
};

export default SalesReceipt;
