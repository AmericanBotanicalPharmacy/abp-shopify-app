import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

import { getQRCodesByProduct } from "../models/QRCode.server";

export async function loader({ request, params }) {
  const { admin, session, cors } = await authenticate.admin(request);
  const qrCodes = await getQRCodesByProduct(session.shop, admin.graphql, params.product_id);

  return cors(json({
    qrCodes,
  }));
}
