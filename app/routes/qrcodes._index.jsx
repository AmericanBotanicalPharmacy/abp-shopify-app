import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

import { getQRCodes } from "../models/QRCode.server";

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const qrCodes = await getQRCodes(session.shop, admin.graphql);

  return json({
    qrCodes,
  });
}
