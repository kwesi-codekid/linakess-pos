import { LoaderFunction, json } from "@remix-run/node";
import OperatorController from "~/controllers/OperatorController.server";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") as string) || 1;
  const operatorId = url.searchParams.get("operatorId") as string;
  const from = url.searchParams.get("from") as string;
  const to = url.searchParams.get("to") as string;

  const operatorController = new OperatorController(request);
  const history = await operatorController.getOperatorStocksApi({
    operatorId,
    from,
    to,
  });

  return json(history);
};
