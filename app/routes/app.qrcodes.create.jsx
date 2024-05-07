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

  console.log(request)

  const response = await admin.rest.get({ path: "products/"+productId+".json" });
  const responseJson = await response.json();
  console.log(responseJson)
  const product =responseJson.product
  if(product) {
    const { images, id, variants, title, handle } = product;


    const data = {

    }
    await db.qRCode.create({ data })
  }

  return cors(json({
    success: true
  }))
}
