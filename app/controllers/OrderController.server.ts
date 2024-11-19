/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect, json } from "@remix-run/node"
import moment from "moment"
import { commitSession, getSession } from "~/session"
import AdminController from "./AdminController.server"
import { Cart } from "~/models/Cart"
import { ServiceCart } from "~/models/ServiceCart"
import { Order } from "~/models/Order"
import PaymentController from "./PaymentController"
import { Payment } from "~/models/PaymentDetails"
import { Product } from "~/models/Product"
import { Customer } from "~/models/Customer"
import { Service } from "~/models/Service"

export default class OrderController {
    private request: Request

    /**
     * Initialize a OrderController instance
     * @param request This Fetch API interface represents a resource request.
     * @returns this
     */
    constructor(request: Request) {
        this.request = request
    }

    private generateOrderId(prefix: string) {
        const length = 12 - prefix.length
        const randomString = Math.random()
            .toString(36)
            .substring(2, 2 + length)
        return `${prefix}-${randomString}`
    }

    public async getSales({
        page,
        search_term,
        status = "pending",
        from,
        to,
    }: {
        page: number
        search_term?: string
        status?: string
        from?: string
        to?: string
    }) {
        const fromDate = from ? new Date(from) : new Date()
        fromDate.setHours(0, 0, 0, 0)
        const toDate = to ? new Date(to) : new Date()
        toDate.setHours(23, 59, 59, 999)

        const limit = 10 // Number of orders per page
        const skipCount = (page - 1) * limit // Calculate the number of documents to skip

        const searchFilter = search_term
            ? {
                  $or: [
                      { orderId: { $regex: search_term, $options: "i" } },
                      { deliveryStatus: { $regex: status, $options: "i" } },
                      {
                          customer: {
                              $in: await Customer.find({
                                  $or: [
                                      {
                                          fullName: {
                                              $regex: search_term,
                                              $options: "i",
                                          },
                                      },
                                      {
                                          phone: {
                                              $regex: search_term,
                                              $options: "i",
                                          },
                                      },
                                  ],
                              }).select("_id"),
                          },
                      },
                  ],
              }
            : {}
        if (from && to) {
            searchFilter.createdAt = {
                $gte: fromDate,
                $lte: toDate,
            }
        }
        const orders = await Order.find({
            onCredit: false,
            orderType: "sale",
            ...searchFilter,
        })
            // .skip(skipCount)
            // .limit(limit)
            .populate("customer")
            .populate({
                path: "orderServiceItems.service",
            })
            .populate({
                path: "orderItems.product",
                populate: {
                    path: "images",
                    model: "images",
                },
            })
            .populate("user")
            .sort({ createdAt: "desc" })
            .exec()

        const totalOrdersCount = await Order.countDocuments(searchFilter).exec()
        const totalPages = Math.ceil(totalOrdersCount / limit)

        return { orders, totalPages }
    }

    public async getOrders({
        page,
        search_term,
        status = "pending",
        from,
        to,
    }: {
        page: number
        search_term?: string
        status?: string
        from?: string
        to?: string
    }) {
        const fromDate = from ? new Date(from) : new Date()
        fromDate.setHours(0, 0, 0, 0)
        const toDate = to ? new Date(to) : new Date()
        toDate.setHours(23, 59, 59, 999)

        const limit = 10 // Number of orders per page
        const skipCount = (page - 1) * limit // Calculate the number of documents to skip

        const searchFilter = search_term
            ? {
                  $or: [
                      { orderId: { $regex: search_term, $options: "i" } },
                      { deliveryStatus: { $regex: status, $options: "i" } },
                  ],
              }
            : {}

        if (from && to) {
            searchFilter.createdAt = {
                $gte: fromDate,
                $lte: toDate,
            }
        }

        const orders = await Order.find({
            onCredit: false,
            orderType: "order",
            ...searchFilter,
        })
            // .skip(skipCount)
            // .limit(limit)
            .populate("customer")
            .populate({
                path: "orderServiceItems.service",
            })
            .populate({
                path: "orderItems.product",
                populate: {
                    path: "images",
                    model: "images",
                },
            })
            .populate("user")
            .sort({ createdAt: "desc" })
            .exec()

        const totalOrdersCount = await Order.countDocuments(searchFilter).exec()
        const totalPages = Math.ceil(totalOrdersCount / limit)

        return { orders, totalPages }
    }

    public async getOrdersOnCredit({
        page,
        search_term,
        status = "pending",
    }: {
        page: number
        search_term?: string
        status?: string
    }) {
        const limit = 10 // Number of orders per page
        const skipCount = (page - 1) * limit // Calculate the number of documents to skip

        const searchFilter = search_term
            ? {
                  $or: [
                      { orderId: { $regex: search_term, $options: "i" } },
                      { deliveryStatus: { $regex: status, $options: "i" } },
                  ],
              }
            : {}

        const orders = await Order.find({ onCredit: true, ...searchFilter })
            .skip(skipCount)
            .limit(limit)
            .populate({
                path: "orderItems.stock",
                // model: "stocks",
            })
            .populate({
                path: "orderItems.product",
                populate: {
                    path: "images",
                    model: "images",
                },
            })
            .populate("user")
            .sort({ createdAt: "desc" })
            .exec()

        const totalOrdersCount = await Order.countDocuments(searchFilter).exec()
        const totalPages = Math.ceil(totalOrdersCount / limit)

        return { orders, totalPages }
    }

    public getCustomerOrders = async ({
        customerId,
    }: {
        customerId: string
    }) => {
        try {
            const orders = await Order.find({ customer: customerId })

                .populate("user")
                .exec()

            return orders
        } catch (error) {
            console.error("Error retrieving orders:", error)
        }
    }

    /**
     * A function to get details of an Order
     * @param orderId The current order ID
     * @returns Order object
     */
    public async getOrder({ orderId }: { orderId: string }) {
        try {
            const order = await Order.findById(orderId)
                .populate({
                    path: "orderItems.product",
                    populate: {
                        path: "images",
                        model: "images",
                    },
                })
                .populate("customer")
                .populate("user")
                // .populate({
                //   path: "user",
                //   select: "_id firstName lastName email phone address",
                // })
                .exec()

            return order
        } catch (error) {
            console.error("Error retrieving order:", error)
        }
    }

    allUserOrders = async ({ user }: { user: string }) => {
        // const limit = 10; // Number of orders per page
        // const skipCount = (page - 1) * limit; // Calculate the number of documents to skip
        //
        // const totalOrdersCount = await Order.countDocuments({}).exec();
        // const totalPages = Math.ceil(totalOrdersCount / limit);

        try {
            const orders = await Order.find({ user })
                // .skip(skipCount)
                // .limit(limit)
                .populate({
                    path: "orderItems.product",
                    populate: {
                        path: "images",
                        model: "images",
                    },
                })
                .populate("user")
                .exec()

            return orders
        } catch (error) {
            console.error("Error retrieving orders:", error)
        }
    }

    /**
     * first step in checkout
     * @param param0 user: userId
     * @returns null
     */
    public checkout = async ({
        orderId,
        customer,
        amountPaid,
        balance,
        onCredit = "false",
        reservePickup = "false",
        discount,
    }: {
        customer: string
        amountPaid: string
        balance: string
        onCredit: string
        reservePickup: string
        discount: string
        orderId: string
    }) => {
        const session = await getSession(this.request.headers.get("Cookie"))
        const adminAuth = await new AdminController(this.request)
        const adminId = await adminAuth.getAdminId()

        const isExist = await Order.findOne({ orderId }).exec()

        if (isExist) {
            session.flash("message", {
                title: "Order ID already exist",
                status: "error",
            })
            return redirect(`/pos`, {
                headers: {
                    "Set-Cookie": await commitSession(session),
                },
            })
        }

        try {
            const cartItems = await Cart.find({ user: adminId })
                .populate("product")
                .exec()

            const serviceCartItems = await ServiceCart.find({ user: adminId })
                .populate("service")
                .exec()

            // if (cartItems.length === 0) {
            //   session.flash("message", {
            //     title: "Cart is empty",
            //     status: "error",
            //   });
            //   return redirect(`/pos`, {
            //     headers: {
            //       "Set-Cookie": await commitSession(session),
            //     },
            //   });
            // }

            let totalPrice = 0
            cartItems?.forEach((cartItem) => {
                const productPrice = cartItem?.product?.price
                const quantity = cartItem.quantity
                totalPrice += productPrice * quantity
            })

            let serviceTotalPrice = 0
            serviceCartItems?.forEach((cartItem) => {
                const productPrice = cartItem?.service?.price
                const quantity = cartItem.quantity
                serviceTotalPrice += productPrice * quantity
            })

            let newCartItems: any = []
            cartItems?.forEach((cartItem) => {
                const quantity = cartItem.quantity
                const costPrice = cartItem?.product?.costPrice
                    ? cartItem?.product?.costPrice
                    : 0
                const sellingPrice = cartItem?.product?.price
                const product = cartItem?.product?._id
                const stock = cartItem?.stock?._id
                newCartItems.push({
                    product,
                    costPrice,
                    sellingPrice,
                    stock,
                    quantity,
                })
            })

            let newServiceCartItems: any = []
            serviceCartItems?.forEach((cartItem) => {
                const quantity = cartItem.quantity
                const sellingPrice = cartItem?.service?.price
                const costPrice = cartItem?.service?.costPrice
                    ? cartItem?.service?.costPrice
                    : 0
                const service = cartItem?.service?._id
                const stock = cartItem?.stock?._id
                newServiceCartItems.push({
                    service,
                    costPrice,
                    sellingPrice,
                    stock,
                    quantity,
                })
            })

            // const orderId = this.generateOrderId("ORD");

            const order = await Order.create({
                orderId,
                user: adminId,
                orderItems: newCartItems,
                orderServiceItems: newServiceCartItems,
                paymentStatus: onCredit == "true" ? "pending" : "paid",
                onCredit: onCredit == "true" ? true : false,
                status: reservePickup == "true" ? "pending" : "completed",
                deliveryStatus:
                    reservePickup == "true" ? "pending" : "delivered",
                totalPrice:
                    totalPrice + serviceTotalPrice - parseFloat(discount),
                amountPaid: amountPaid ? parseFloat(amountPaid) : 0,
                balance: balance ? parseFloat(balance) : 0,
                customer,
                discount: discount ? parseFloat(discount) : 0,
            })

            await Cart.deleteMany({ user: adminId }).exec()
            await ServiceCart.deleteMany({ user: adminId }).exec()

            for (const item of cartItems) {
                const product = await Product.findById(item.product?._id)

                if (product) {
                    product.quantitySold += item.quantity
                    product.stockAtShop -= item.quantity
                    await product.save()
                }
            }

            // const logController = await new LogController();
            // await logController.create({
            //   employee: cashier,
            //   action: "place an order",
            //   order: order?._id,
            // });

            if (amountPaid) {
                await Payment.create({
                    amount: amountPaid,
                    order: order?._id,
                    user: adminId,
                    customer,
                })
            }

            await Customer.findByIdAndUpdate(customer, {
                $inc: {
                    balance:
                        -(
                            totalPrice +
                            serviceTotalPrice -
                            parseFloat(discount)
                        ) + parseFloat(amountPaid),
                },
            })

            return await Order.findById(order?._id)
                .populate({
                    path: "orderItems.product",
                    // populate: {
                    //   path: "images",
                    //   model: "images",
                    // },
                })
                .populate({
                    path: "orderServiceItems.service",
                })
                .populate({
                    path: "user",
                    select: "_id firstName lastName email phone",
                })
                .populate({
                    path: "customer",
                    select: "_id fullName email phone",
                })
                .exec()
        } catch (error) {
            session.flash("message", {
                title: "Order Deletion Failed",
                status: "error",
            })
            return redirect(`/pos`, {
                headers: {
                    "Set-Cookie": await commitSession(session),
                },
            })
        }
    }

    public undoCheckout = async ({ id, path }) => {
        const session = await getSession(this.request.headers.get("Cookie"))
        const adminAuth = await new AdminController(this.request)
        const adminId = await adminAuth.getAdminId()

        try {
            const order = await Order.findById(id)
                .populate({
                    path: "orderItems.product",
                    // populate: {
                    //   path: "images",
                    //   model: "images",
                    // },
                })
                .exec()
            console.log(order)

            if (order.orderType != "order") {
                for (const item of order.orderItems) {
                    const product = await Product.findById(item.product?._id)

                    if (product) {
                        product.quantitySold -= item.quantity
                        product.stockAtShop += item.quantity
                        await product.save()
                    }
                }
            }

            await Order.findByIdAndDelete(id).exec()
            await Payment.deleteMany({ id }).exec()

            // if (order.orderType == "order") {
            await Customer.findByIdAndUpdate(order.customer, {
                $inc: { balance: +order.totalPrice },
            })
            // }
            session.flash("message", {
                title: "Order Deleted!",
                status: "success",
            })
            return redirect(path, {
                headers: {
                    "Set-Cookie": await commitSession(session),
                },
            })
        } catch (error) {
            console.log(error)

            session.flash("message", {
                title: "Order Deletion Failed",
                status: "error",
            })
            return redirect(path, {
                headers: {
                    "Set-Cookie": await commitSession(session),
                },
            })
        }
    }

    public orderStatus = async ({
        status,
        _id,
    }: {
        status: string
        _id: string
    }) => {
        try {
            await Order.findByIdAndUpdate(_id, {
                deliveryStatus: status,
            }).exec()

            return true
        } catch (error) {
            console.error("Error chanign order status:", error)
            return json(
                {
                    error: "Error creating cart",
                    fields: {},
                },
                { status: 400 }
            )
        }
    }

    public orderPaymentStatus = async ({
        status,
        orderId,
        paymentReff,
    }: {
        status: string
        orderId: string
        paymentReff: string
    }) => {
        try {
            await Order.findByIdAndUpdate(orderId, {
                paymentStatus: status,
                paymentReff,
            }).exec()

            return true
        } catch (error) {
            console.error("Error chanign order status:", error)
            return json(
                {
                    error: "Error creating cart",
                    fields: {},
                },
                { status: 400 }
            )
        }
    }

    public getOrderStats = async () => {
        const currentDate = new Date()
        const startOfLast7Months = moment(currentDate)
            .subtract(7, "months")
            .startOf("month")
            .toDate()

        let orderStats

        // Create an aggregation pipeline to calculate revenue and expenses
        const result = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfLast7Months },
                    paymentStatus: "paid",
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m", date: "$createdAt" },
                    },
                    revenue: { $sum: "$totalPrice" },
                    expenses: { $sum: 0 },
                },
            },
            {
                $sort: { _id: 1 }, // Sort by date in ascending order
            },
            {
                $project: {
                    _id: 0, // Exclude _id field from the result
                    month: "$_id", // Rename _id to 'month'
                    revenue: 1,
                    expenses: 1,
                },
            },
        ])

        // Process 'result' to create your chart data
        const labels = result.map((entry: any) => entry.month)
        const revenueData = result.map((entry: any) => entry.revenue)
        const expensesData = result.map((entry: any) => entry.expenses)

        return {
            labels,
            datasets: [
                {
                    label: "Revenue",
                    data: revenueData,
                    borderColor: "rgb(53, 162, 235)",
                    backgroundColor: "rgba(53, 162, 235, 0.5)",
                    tension: 0.2,
                },
                {
                    label: "Expenses",
                    data: expensesData,
                    borderColor: "rgb(255, 99, 132)",
                    backgroundColor: "rgba(255, 99, 132, 0.5)",
                    tension: 0.2,
                },
            ],
        }
    }

    public getTotals = async () => {
        // Calculate Total Revenue
        const revenueResult = await Order.aggregate([
            {
                $match: { paymentStatus: "paid" },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalPrice" },
                },
            },
        ])

        const totalRevenue =
            revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0

        // Calculate Orders Completed
        const completedCount = await Order.countDocuments({
            deliveryStatus: { $in: ["shipped", "delivered"] },
        })

        // Calculate Pending Orders
        const pendingCount = await Order.countDocuments({
            paymentStatus: { $in: ["pending", "paid"] },
        })
        const bestsellingProducts = await Product.find()
            .populate("images")
            .sort({ quantitySold: -1 })
            .limit(5)
            .exec()

        const today = new Date()
        today.setHours(0, 0, 0)
        const tomorrow = new Date()
        tomorrow.setHours(23, 59, 59)

        const ordersCountPipeline = [
            {
                $match: {
                    paymentStatus: "paid",
                    createdAt: {
                        $gte: today,
                        $lt: tomorrow,
                    },
                },
            },
            {
                $count: "totalOrdersToday",
            },
        ]

        // Pipeline to calculate total revenue
        const ordersRevenuePipeline = [
            {
                $match: {
                    paymentStatus: "paid",
                    createdAt: {
                        $gte: today,
                        $lt: tomorrow,
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    totalTodayRevenue: { $sum: "$totalPrice" },
                },
            },
        ]

        // Execute both pipelines and combine results
        const ordersCountResult = await Order.aggregate(ordersCountPipeline)
        const ordersRevenueResult = await Order.aggregate(ordersRevenuePipeline)

        // const combinedResult = {
        //   totalOrdersToday: ordersCountResult[0].totalOrdersToday,
        //   totalTodayRevenue: ordersRevenueResult[0].totalTodayRevenue,
        // };

        return {
            totalRevenue,
            completedCount,
            pendingCount,
            bestsellingProducts,
            totalOrdersToday: ordersCountResult[0]?.totalOrdersToday,
            totalTodayRevenue: ordersRevenueResult[0]?.totalTodayRevenue,
        }
    }

    public placeOrder = async ({
        orderId,
        customer,
        amountPaid,
        items,
    }: {
        orderId: string
        customer: string
        amountPaid?: string
        items: {
            product: string
            quantity: number
            description: string
            price: number
        }[]
    }) => {
        const session = await getSession(this.request.headers.get("Cookie"))
        const adminAuth = await new AdminController(this.request)
        const adminId = await adminAuth.getAdminId()

        try {
            let totalPrice = 0
            items?.forEach((cartItem) => {
                const productPrice = cartItem?.price
                const quantity = cartItem.quantity
                totalPrice += productPrice * quantity
            })

            // let newCartItems: any = [];
            // cartItems?.forEach((cartItem) => {
            //   const quantity = cartItem.quantity;
            //   const costPrice = cartItem?.product?.costPrice
            //     ? cartItem?.product?.costPrice
            //     : 0;
            //   const sellingPrice = cartItem?.product?.price;
            //   const product = cartItem?.product?._id;
            //   newCartItems.push({
            //     product,
            //     costPrice,
            //     sellingPrice,
            //     quantity,
            //   });
            // });

            // const orderId = this.generateOrderId("ORD");

            const order = await Order.create({
                orderId,
                user: adminId,
                paymentStatus: "pending",
                status: "pending",
                deliveryStatus: "pending",
                totalPrice: totalPrice,
                balance: -totalPrice,
                amountPaid: 0,
                customer,
                orderType: "order",
                items,
            })
            // amountPaid ? parseFloat(amountPaid) :

            // await Payment.create({
            //   amount: amountPaid,
            //   order: order?._id,
            //   user: adminId,
            //   customer,
            // });

            await Customer.findByIdAndUpdate(customer, {
                $inc: { balance: -totalPrice },
            })

            return await Order.findById(order?._id)
                .populate({
                    path: "user",
                    select: "_id firstName lastName email phone",
                })
                .populate({
                    path: "customer",
                    select: "_id fullName email phone",
                })
                .exec()
        } catch (error) {
            session.flash("message", {
                title: "Checkout Failed",
                status: "error",
            })
            return redirect(`/orders`, {
                headers: {
                    "Set-Cookie": await commitSession(session),
                },
            })
        }
    }

    public deleteOrderItem = async ({
        itemId,
        id,
    }: {
        itemId: string
        id: string
    }) => {
        const session = await getSession(this.request.headers.get("Cookie"))

        try {
            const order = await Order.findById(id).exec()
            const item = order?.items?.find((item) => item._id == itemId)

            await Order.findByIdAndUpdate(id, {
                $pull: { items: { _id: itemId } },
                $inc: { totalPrice: -(item.quantity * item.price) },
            }).exec()

            await Customer.findByIdAndUpdate(order?.customer, {
                $inc: { balance: item.quantity * item.price },
            })

            session.flash("message", {
                title: "Order Item Deleted!",
                status: "success",
            })

            return redirect(`/orders/${id}`, {
                headers: {
                    "Set-Cookie": await commitSession(session),
                },
            })
        } catch (error) {
            console.log(error)

            session.flash("message", {
                title: "Order Item Deletion Failed",
                status: "error",
            })
            return redirect(`/orders`, {
                headers: {
                    "Set-Cookie": await commitSession(session),
                },
            })
        }
    }

    public editOrderItem = async ({
        itemId,
        id,
        productName,
        quantity,
        price,
        description,
    }: {
        id: string
        itemId: string
        productName: string
        quantity: string
        price: string
        description: string
    }) => {
        try {
            const order = await Order.findById(id).exec()
            const item = order?.items?.find((item) => item._id == itemId)

            await Order.findByIdAndUpdate(id, {
                $pull: { items: { _id: itemId } },
                $inc: { totalPrice: -(item.quantity * item.price) },
            }).exec()

            await Order.findByIdAndUpdate(id, {
                $push: {
                    items: {
                        productName,
                        quantity: parseInt(quantity),
                        price: parseFloat(price),
                        description,
                    },
                },
                $inc: { totalPrice: parseInt(quantity) * parseFloat(price) },
            }).exec()

            await Customer.findByIdAndUpdate(order?.customer, {
                $inc: {
                    balance: parseInt(item.quantity) * parseFloat(item.price),
                },
            })

            await Customer.findByIdAndUpdate(order?.customer, {
                $inc: { balance: -(parseInt(quantity) * parseFloat(price)) },
            })

            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }

    public makeRepayment = async ({
        orderId,
        amount,
    }: {
        orderId: any
        amount: string
    }) => {
        const session = await getSession(this.request.headers.get("Cookie"))
        const adminAuth = await new AdminController(this.request)
        const adminId = await adminAuth.getAdminId()

        try {
            const order = await Order.findById(orderId).exec()

            await Order.findByIdAndUpdate(orderId, {
                $inc: {
                    amountPaid: parseFloat(amount),
                    balance: +parseFloat(amount),
                },
            }).exec()

            await Payment.create({
                amount: parseFloat(amount),
                order: orderId,
                user: adminId,
                customer: order?.customer,
            })

            await Customer.findByIdAndUpdate(order?.customer, {
                $inc: { balance: +parseFloat(amount) },
            })

            session.flash("message", {
                title: "Repayment Successful",
                status: "success",
            })
            return redirect(`/sales`, {
                headers: {
                    "Set-Cookie": await commitSession(session),
                },
            })
        } catch (error) {
            console.log(error)

            session.flash("message", {
                title: "Repayment Failed",
                status: "error",
            })
            return redirect(`/sales`, {
                headers: {
                    "Set-Cookie": await commitSession(session),
                },
            })
        }
    }
}
