export async function updateLoyaltyPoints(segmentId: string, points: number) {
  const customerIds = await getCustomerIds(segmentId);

  // This example uses metafields to store the data. For more information, refer to https://shopify.dev/docs/apps/custom-data/metafields.
  return await makeGraphQLQuery(
    `mutation SetMetafield($metafields: [MetafieldsSetInput!]!) {
      metafieldDefinitionCreate(
        definition: {namespace: "$app:customerLoyalty", key: "points", name: "Loyalty points", ownerType: CUSTOMER, type: "number_integer", access: {admin: MERCHANT_READ_WRITE}}
      ) {
        createdDefinition {
          id
        }
      }
      metafieldsSet(metafields: $metafields) {
        userErrors {
          field
          message
          code
        }
      }
    }
  `,
    {
      metafields: customerIds.map((customerId: string) => ({
        ownerId: customerId,
        namespace: "$app:customerLoyalty",
        key: "points",
        type: "number_integer",
        value: points.toString(),
      })),
    }
  );
}

export async function getCustomerIds(segmentId: string) {
  // This example uses metafields to store the data. For more information, refer to https://shopify.dev/docs/apps/custom-data/metafields.
  const response = await makeGraphQLQuery(
    `query Segment($id: ID!) {
      customerSegmentMembers(first: 10, segmentId: $id) {
        edges {
          node {
            id
          }
        }
      }
    }
`,
    { id: segmentId }
  );

  return response.data.customerSegmentMembers.edges.map((edge: { node: { id: number }}) => edge.node.id);
}

async function makeGraphQLQuery(query: string, variables: any) {
  const graphQLQuery = {
    query,
    variables,
  };

  const res = await fetch("shopify:admin/api/graphql.json", {
    method: "POST",
    body: JSON.stringify(graphQLQuery),
  });

  if (!res.ok) {
    console.error("Network error");
  }

  return await res.json();
}
