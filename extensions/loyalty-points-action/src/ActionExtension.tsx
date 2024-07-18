import { useCallback, useEffect, useState } from "react";
import {
  reactExtension,
  useApi,
  AdminAction,
  BlockStack,
  Button,
  Text,
  NumberField,
} from "@shopify/ui-extensions-react/admin";

import { updateLoyaltyPoints } from "./utils";

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = "admin.customer-segment-details.action.render";

export default reactExtension(TARGET, () => <App />);

function App() {
  // The useApi hook provides access to several useful APIs like i18n, close, and data.
  const { i18n, close, data } = useApi(TARGET);

  const [segmentName, setSegmentName] = useState("");
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  // Use direct API calls to fetch data from Shopify.
  // See https://shopify.dev/docs/api/admin-graphql for more information about Shopify's GraphQL API
  useEffect(() => {
    (async function getSegmentInfo() {
      const getSegmentQuery = {
        query: `query Segment($id: ID!) {
          segment(id: $id) {
            name
          }
        }`,
        variables: { id: data.selected[0].id },
      };

      const res = await fetch("shopify:admin/api/graphql.json", {
        method: "POST",
        body: JSON.stringify(getSegmentQuery),
      });

      if (!res.ok) {
        console.error("Network error");
      }

      const segmentData = await res.json();
      setSegmentName(segmentData.data.segment.name);
    })();
  }, []);

  return (
    // The AdminAction component provides an API for setting the title and actions of the Action extension wrapper.
    <AdminAction
      primaryAction={<Button onPress={() => {
        close();
      }}>
        {i18n.translate("done")}
      </Button>}
      secondaryAction={
        <Button
          onPress={() => {
            close();
          }}
        >
          {i18n.translate("close")}
        </Button>
      }
    >
      <BlockStack gap>
        <Text>
          {i18n.translate("description", {
            segment: segmentName,
          })}
        </Text>
        <NumberField
          inputMode="numeric"
          max={100}
          label={i18n.translate("label")}
          value={loyaltyPoints}
          onChange={setLoyaltyPoints}
        />
      </BlockStack>
    </AdminAction>
  );
}
