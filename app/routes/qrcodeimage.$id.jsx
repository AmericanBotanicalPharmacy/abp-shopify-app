import qrcode from "qrcode";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { fs } from 'fs';

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
  await qrcode.toFile(url.href);

  const filename = "qrcode_" + id + ".png"
  await qrcode.toFile(filename, data, { width: 256, type: 'png' });

  const imageBuffer = await fs.promises.readFile(filename);
  return new Response(imageBuffer, {
    headers: {
      "Content-Type": "image/png",
    },
  })
}
