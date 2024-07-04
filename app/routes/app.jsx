import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import {I18nContext, I18nManager} from '@shopify/react-i18n';  // <-- add code
import { AppProvider as PolarisProvider } from '@shopify/polaris';
import { AppProvider as DiscountProvider } from "@shopify/discount-app-components";
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';

import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
};

const app = createApp({
  apiKey: process.env.SHOPIFY_API_KEY || "",
  shopOrigin: new URLSearchParams(window.location.search).get('shop'),
  forceRedirect: true,
});


export default function App() {
  const { apiKey } = useLoaderData();
  const i18nManager = new I18nManager({   // <-- add code
    locale: 'en'
  });

  return (
      <AppProvider isEmbeddedApp apiKey={apiKey}>
        <AppBridgeProvider config={app}>
          <DiscountProvider locale="en-US" ianaTimezone="America/Los_Angeles">
            <I18nContext.Provider value={i18nManager}> 
              <ui-nav-menu>
                <Link to="/app" rel="home">
                  Home
                </Link>
                <Link to="/app/additional">Additional page</Link>
              </ui-nav-menu>
              <Outlet />
            </I18nContext.Provider>
          </DiscountProvider>
        </AppBridgeProvider>
      </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
