import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

import { getQRCodesByProduct } from "../models/QRCode.server";

export async function loader({ request, params }) {
  const { admin, session, cors } = await authenticate.admin(request);
  var splitStr = params.product_id.split("/");
  var productId = parseInt(splitStr[splitStr.length - 1], 10);

  const response = await getQRCodesByProduct(session.shop, admin.graphql, productId);
  const qrCodes = response.json().qrCodes;

  return cors(json({
    qrCodes,
  }));
}
