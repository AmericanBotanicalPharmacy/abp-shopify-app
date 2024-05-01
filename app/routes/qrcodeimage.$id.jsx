import qrcode from "qrcode";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";

import db from "../db.server";

export async function loader({ params }) {
  var id = params.id;
  const qrCode = await db.qRCode.findUnique({
    where: {
      id: Number(id)
    }
  });

  invariant(qrCode, "Could not find QR code destination");

  const url = new URL(`/qrcodes/${id}/scan`, process.env.SHOPIFY_APP_URL);
  const buffer = await qrcode.toBuffer(url, { type: 'png' });

  return new Response(buffer, {
    headers: {
      "Content-Type": "image/png",
    },
  })
}
