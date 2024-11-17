import { LoaderFunction, json } from "@remix-run/node";
import PaymentController from "~/controllers/PaymentController";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") as string) || 1;
  const operatorId = url.searchParams.get("operatorId") as string;
  const from = url.searchParams.get("from") as string;
  const to = url.searchParams.get("to") as string;

  const paymentController = new PaymentController(request);
  const history = await paymentController.getOperatorPaymentsApi({
    operatorId,
    from,
    to,
  });

  return json(history);
};
