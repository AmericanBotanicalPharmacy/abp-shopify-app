import {useEffect, useState} from 'react';
import {
  reactExtension,
  useApi,
  AdminAction,
  BlockStack,
  Button,
  Text,
  TextField,
} from '@shopify/ui-extensions-react/admin';

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = 'admin.product-details.action.render';

export default reactExtension(TARGET, () => <App />);

function validateForm (title) {
  return {
    isValid: Boolean(title),
    errors: {
      title: !title
    },
  };
};

function App() {
  // The useApi hook provides access to several useful APIs like i18n, close, and data.
  const {i18n, close, data} = useApi(TARGET);
  console.log({data});
  const [productTitle, setProductTitle] = useState('');
  const [formErrors, setFormErrors] = useState(null);
  const [title, setTitle] = useState(null);

  // Use direct API calls to fetch data from Shopify.
  // See https://shopify.dev/docs/api/admin-graphql for more information about Shopify's GraphQL API
  useEffect(() => {
    (async function getProductInfo() {
      const getProductQuery = {
        query: `query Product($id: ID!) {
          product(id: $id) {
            title
          }
        }`,
        variables: {id: data.selected[0].id},
      };

      const res = await fetch("shopify:admin/api/graphql.json", {
        method: "POST",
        body: JSON.stringify(getProductQuery),
      });

      if (!res.ok) {
        console.error('Network error');
      }

      const productData = await res.json();
      setProductTitle(productData.data.product.title);
    })();
  }, [data.selected]);

  const onCreate = () => {
    const {isValid, errors} = validateForm(title);
    setFormErrors(errors);
    if (isValid) {
      console.log('create qrcode')
    }
  }

  return (
    // The AdminAction component provides an API for setting the title and actions of the Action extension wrapper.
    <AdminAction
      primaryAction={
        <Button
          onPress={onCreate}
        >
          Create
        </Button>
      }
      secondaryAction={
        <Button
          onPress={() => {
            close();
          }}
        >
          Cancel
        </Button>
      }
    >
      <TextField
        value={title}
        error={formErrors?.title ? "Please enter a title" : undefined}
        onChange={(val) => setTitle(val)}
        label="Title"
        maxLength={50}
      />
    </AdminAction>
  );
}