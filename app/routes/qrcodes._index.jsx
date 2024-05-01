import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

import { getQRCodesByProduct, getQRCodeImage } from "../models/QRCode.server";

export async function loader({ request }) {
  const { admin, session, cors } = await authenticate.admin(request);
  const url = new URL(request.url);
  var productId = url.searchParams.get("product_id");

  const qrCodesData = await getQRCodesByProduct(session.shop, admin.graphql, productId);
  const qrCodes = qrCodesData.map(datum => ({
    id: datum.id,
    title: datum.title,
    imageUrl: process.env.SHOPIFY_APP_URL + "/qrcodeimage/"+datum.id
  }));

  for (let i = 0; i < qrCodes.length; i++) {
    qrCodes[i].image = await getQRCodeImage(qrCodesData[i].id);
  }

  return cors(json({
    qrCodes: qrCodes
  }));
}
