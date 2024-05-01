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
  const qrData = await qrcode.toDataURL(url.href);

  return {
    headers: {
      "Content-Type": "image/png", // Specify the image type
    },
    body: qrData,
  };
}
