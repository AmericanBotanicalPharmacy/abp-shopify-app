import { useEffect, useMemo, useState } from "react";

import {
  reactExtension,
  useApi,
  AdminBlock,
  BlockStack,
  Text,
  Box,
  Button,
  Divider,
  Form,
  Icon,
  InlineStack,
  ProgressIndicator,
  Select,
  Image,
  Link
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
      if(qrCodesData?.qrCodes) {
        setQrCodes(qrCodesData.qrCodes)
      }
    })();

  }, [productId]);

  return (
    <AdminBlock title="Product Qrcodes">
      <BlockStack>
        {qrCodes.length == 0 && <>
          <Link href={"app:app/qrcodes/new?product_id="+productId.split('/').pop()}>
            Add New QrCode
          </Link>
        </>}
      {qrCodes.map(
          ({ id, title, imageUrl }, index) => {
            return (
              <>
                {index > 0 && <Divider />}
                <Box key={id} padding="base small">
                  <InlineStack
                    blockAlignment="center"
                    inlineSize="100%"
                    gap="large"
                  >
                    <Box inlineSize="53%">
                      <Box inlineSize="100%">
                        <Text fontWeight="bold" textOverflow="ellipsis">{title}</Text>
                      </Box>
                    </Box>
                    <Box inlineSize="40%">
                      <Box inlineSize="100%">
                        <Image src={imageUrl} />
                      </Box>
                    </Box>
                  </InlineStack>
                </Box>
              </>
            );
          }
        )}
      </BlockStack>
    </AdminBlock>
  );
}