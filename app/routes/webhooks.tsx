import { authenticate } from "../shopify.server";
import db from "../db.server";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";

export const action = async ({ request }: LoaderFunctionArgs) => {
  const { topic, shop, session, admin, payload } = await authenticate.webhook(request);

  if (!admin) {
    // The admin context isn't returned if the webhook fired after a shop was uninstalled.
    throw new Response();
  }

  // const payload = await request.json();

  console.log(topic)
  console.log(payload)

  switch (topic as string) {
    case "APP_UNINSTALLED":
      if (session) {
        await db.session.deleteMany({ where: { shop } });
      }

      break;
    case "ORDERS_CREATE":
      console.log(topic)
      console.log(payload)
      break;
    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
    case "SHOP_REDACT":
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
