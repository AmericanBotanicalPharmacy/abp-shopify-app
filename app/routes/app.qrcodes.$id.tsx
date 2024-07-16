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
import { QRCode } from "@prisma/client";

import db from "../db.server";
import { getQRCode, validateQRCode, createQRCode, updateQRCode } from "../models/QRCode.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  console.log(params)
  if (params.id === "new") {
    const url = new URL(request.url);
    var productId = url.searchParams.get("product_id");
    if(productId && request.method == 'GET') {
      console.log(productId)
      const response = await admin.rest.get({ path: "products/"+productId+".json" });
      const responseJson = await response.json();
      console.log(responseJson)
      const product =responseJson.product
      if(product) {
        const { images, id, variants, title, handle } = product;

        return json({
          title: "",
          destination: "product",
          productId: "gid://shopify/Product/"+id,
          productVariantId: "gid://shopify/ProductVariant/"+variants[0].id,
          productTitle: title,
          productHandle: handle,
          productAlt: product.image?.alt,
          productImage: product.image?.src
        })
      }
    }
    return json({
      destination: "product",
      title: "",
    });
  }

  return json(await getQRCode(Number(params.id), admin.graphql));
}

interface RequestData {
  title: string
  productId: string
  productVariantId: string
  productHandle: string
  destination: string
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  const formPayload = await request.formData();
  const title = formPayload.get('title') as string;
  const productId = formPayload.get('productId')  as string
  const destination = formPayload.get('destination')  as string
  const productHandle = formPayload.get("productHandle")  as string
  const productVariantId = formPayload.get("productHandle")  as string

  const action = formPayload.get('action')

  /** @type {any} */
  const data = {
    title,
    productId,
    destination,
    productHandle,
    productVariantId,
    shop,
  };

  if (action === "delete") {
    await db.qRCode.delete({ where: { id: Number(params.id) } });
    return redirect("/app");
  }

  const errors = validateQRCode(data);

  if (errors) {
    return json({ errors }, { status: 422 });
  }

  const qrCode =
    params.id === "new"
      ? await createQRCode(data)
      : await updateQRCode(Number(params.id), data);

  return redirect(`/app/qrcodes/${qrCode.id}`);
}

interface ActionErrors {
  [key: string]: string;
}

interface ActionData {
  errors?: ActionErrors;
}

type QRCodeFormData = {
  id?: string
  title: string
  destination: string
  productId: string
  productVariantId: string
  productTitle: string
  productHandle: string
  productAlt?: string
  productImage: string
  destinationUrl: string
  image: string
}

export default function QRCodeForm() {
  const errors = useActionData<ActionData>()?.errors || {};
  const params = useParams();
  const productId = params.productId;

  const qrCode = useLoaderData<QRCodeFormData>();
  const [formState, setFormState] = useState(qrCode);
  const [cleanFormState, setCleanFormState] = useState(qrCode);
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

  const nav = useNavigation();
  const isSaving =
    nav.state === "submitting" && nav.formData?.get("action") !== "delete";
  const isDeleting =
    nav.state === "submitting" && nav.formData?.get("action") === "delete";

  const navigate = useNavigate();

  async function selectProduct() {
    const products = await window.shopify.resourcePicker({
      type: "product",
      action: "select", // customized action verb, either 'select' or 'add',
    });

    if (products) {
      const { images, id, variants, title, handle } = products[0];

      setFormState({
        ...formState,
        productId: id,
        productVariantId: variants[0].id as string,
        productTitle: title,
        productHandle: handle,
        productAlt: images[0]?.altText,
        productImage: images[0]?.originalSrc,
      });
    }
  }

  const submit = useSubmit();
  function handleSave() {
    const data = {
      title: formState.title,
      productId: formState.productId || "",
      productVariantId: formState.productVariantId || "",
      productHandle: formState.productHandle || "",
      destination: formState.destination,
    };

    setCleanFormState({ ...formState });
    submit(data, { method: "post" });
  }

  if (productId) {
    fetch(`/products/${productId}.json`)
      .then(response => response.json())
      .then(productData => {
        console.log(productData)
      });
  }

  return (
    <Page>
      <ui-title-bar title={qrCode.id ? "Edit QR code" : "Create new QR code"}>
        <button variant="breadcrumb" onClick={() => navigate("/app")}>
          QR codes
        </button>
      </ui-title-bar>
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="500">
                <Text as={"h2"} variant="headingLg">
                  Title
                </Text>
                <TextField
                  id="title"
                  helpText="Only store staff can see this title"
                  label="title"
                  labelHidden
                  autoComplete="off"
                  value={formState.title}
                  onChange={(title) => setFormState({ ...formState, title })}
                  error={errors.title}
                />
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="500">
                <InlineStack align="space-between">
                  <Text as={"h2"} variant="headingLg">
                    Product
                  </Text>
                  {formState.productId ? (
                    <Button variant="plain" onClick={selectProduct}>
                      Change product
                    </Button>
                  ) : null}
                </InlineStack>
                {formState.productId ? (
                  <InlineStack blockAlign="center" gap="500">
                    <Thumbnail
                      source={formState.productImage || ImageIcon}
                      alt={formState.productAlt ? formState.productAlt : ""}
                    />
                    <Text as="span" variant="headingMd" fontWeight="semibold">
                      {formState.productTitle}
                    </Text>
                  </InlineStack>
                ) : (
                  <BlockStack gap="200">
                    <Button onClick={selectProduct} id="select-product">
                      Select product
                    </Button>
                    {errors.productId ? (
                      <InlineError
                        message={errors.productId}
                        fieldID="myFieldID"
                      />
                    ) : null}
                  </BlockStack>
                )}
                <Bleed marginInlineStart="200" marginInlineEnd="200">
                  <Divider />
                </Bleed>
                <InlineStack gap="500" align="space-between" blockAlign="start">
                  <ChoiceList
                    title="Scan destination"
                    choices={[
                      { label: "Link to product page", value: "product" },
                      {
                        label: "Link to checkout page with product in the cart",
                        value: "cart",
                      },
                    ]}
                    selected={[formState.destination]}
                    onChange={(destination) =>
                      setFormState({
                        ...formState,
                        destination: destination[0],
                      })
                    }
                    error={errors.destination}
                  />
                  {qrCode.destinationUrl ? (
                    <Button
                      variant="plain"
                      url={qrCode.destinationUrl}
                      target="_blank"
                    >
                      Go to destination URL
                    </Button>
                  ) : null}
                </InlineStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Card>
            <Text as={"h2"} variant="headingLg">
              QR code
            </Text>
            {qrCode ? (
              <EmptyState image={qrCode.image} imageContained={true} />
            ) : (
              <EmptyState image="">
                Your QR code will appear here after you save
              </EmptyState>
            )}
            <BlockStack gap="300">
              <Button
                disabled={!qrCode?.image}
                url={qrCode?.image}
                download
                variant="primary"
              >
                Download
              </Button>
              <Button
                disabled={!qrCode.id}
                url={`/qrcodes/${qrCode.id}`}
                target="_blank"
              >
                Go to public URL
              </Button>
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <PageActions
            secondaryActions={[
              {
                content: "Delete",
                loading: isDeleting,
                disabled: !qrCode.id || !qrCode || isSaving || isDeleting,
                destructive: true,
                outline: true,
                onAction: () =>
                  submit({ action: "delete" }, { method: "post" }),
              },
            ]}
            primaryAction={{
              content: "Save",
              loading: isSaving,
              disabled: !isDirty || isSaving || isDeleting,
              onAction: handleSave,
            }}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
