import { useState } from "react";
import { json, redirect, } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
  useNavigate,
  useParams,
} from "@remix-run/react";
import { authenticate } from "../shopify.server";
import db from "../db.server";

import {
  Card,
  Bleed,
  Button,
  ChoiceList,
  Divider,
  EmptyState,
  InlineStack,
  InlineError,
  Layout,
  Page,
  Text,
  TextField,
  Thumbnail,
  BlockStack,
  PageActions,
} from "@shopify/polaris";
import { ImageIcon } from "@shopify/polaris-icons";

// import db from "../db.server";
// import { getQRCode, validateQRCode } from "../models/QRCode.server";

export async function action({ request, params }) {
  const { session, admin } = await authenticate.admin(request);
  const { shop } = session;

  const requestJson = await request.json()

  const response = await admin.rest.get({ path: "products/"+requestJson.product_id+".json" });
  const responseJson = await response.json();

  console.log(responseJson)

  const product =responseJson.product
  if(product) {
    const { images, id, variants, title, handle } = product;

    const data = {
      productId: id,
      productVariantId: variants[0].id,
      productTitle: title,
      productHandle: handle,
      productAlt: product.image?.alt,
      productImage: product.image?.src
    }
    await db.qRCode.create({ data })
  }

  return cors(json({
    success: true
  }))
}
