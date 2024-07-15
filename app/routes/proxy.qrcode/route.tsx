import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import db from "../../db.server";
import { getQRCodeImage } from "../../models/QRCode.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  var productId = url.searchParams.get("product_id");
  const qrCode = await db.qRCode.findFirst({ where: { productId: {
    contains: productId as string
  } } });

  invariant(qrCode, "Could not find QR code destination");

  return json({
    title: qrCode.title,
    image: await getQRCodeImage(qrCode.id),
  });
}
