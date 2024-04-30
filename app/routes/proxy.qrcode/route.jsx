import { json } from "@remix-run/node";
import invariant from "tiny-invariant";

import db from "../../db.server";
import { getQRCodeImage } from "../../models/QRCode.server";

export async function loader({ params }) {
  const productId = params.product_id;

  const qrCode = await db.qRCode.findFirst({ where: { productId } });

  invariant(qrCode, "Could not find QR code destination");

  return json({
    title: qrCode.title,
    image: await getQRCodeImage(qrCode.id),
  });
}
