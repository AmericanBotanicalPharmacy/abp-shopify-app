import { useEffect, useMemo, useState } from "react";

import {
  reactExtension,
  useApi,
  AdminBlock,
  BlockStack,
  Text,
} from '@shopify/ui-extensions-react/admin';

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = 'admin.product-details.block.render';

export default reactExtension(TARGET, () => <App />);

function App() {
  // The useApi hook provides access to several useful APIs like i18n and data.
  const {i18n, data} = useApi(TARGET);
  const productId = data.selected[0].id;
  const [qrCodes, setQrCodes] = useState([]);

  useEffect(() => {
    (async function getQrCodes() {
      const response = await fetch('/qrcodes?product_id='+productId);
      const qrCodesData = await response.json();
      if(qrCodesData?.data?.qrCodes) {
        setQrCodes(qrCodesData.data.qrCodes)
      }
    })();

  }, [productId]);

  return (
    <AdminBlock title="Product Qrcodes">
      <BlockStack>
        <Text fontWeight="bold">{qrCodes.length}</Text>
      </BlockStack>
    </AdminBlock>
  );
}