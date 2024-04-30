import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

import { getQRCodesByProduct } from "../models/QRCode.server";

export async function loader({ request }) {
  const { admin, session, cors } = await authenticate.admin(request);
  console.log(request.url)
  const url = new URL(request.url);
  console.log(url.searchParams)
  var splitStr = url.searchParams.get("product_id").split("/");
  var productId = splitStr[splitStr.length - 1];

  const qrCodes = await getQRCodesByProduct(session.shop, admin.graphql, productId);

  return cors(json({
    qrCodes,
  }));
}
