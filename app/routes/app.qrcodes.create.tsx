import { useState } from "react";
import { json, redirect, } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";

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

export async function action({ request, params }: ActionFunctionArgs) {
  const { session, admin, cors } = await authenticate.admin(request);
  const { shop } = session;

  console.log('request')
  const requestJson = await request.json()

  console.log('request json ')
  console.log(requestJson)
  const response = await admin.rest.get({ path: "products/"+requestJson.product_id.split('/').pop()+".json" });
  const responseJson = await response.json();
  console.log('product json: ' + responseJson)

  console.log(responseJson)

  const product =responseJson.product
  if(product) {
    const { images, id, variants, title, handle } = product;

    const data = {
      title: requestJson.title,
      destination: requestJson.destination,
      shop: shop,
      productId: String(id),
      productVariantId: String(variants[0].id),
      productHandle: handle
    }
    await db.qRCode.create({ data })
  }

  return cors(json({
    success: true
  }))
}
