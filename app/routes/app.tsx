import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { HeadersArgs } from '@remix-run/server-runtime';

import {I18nContext, I18nManager} from '@shopify/react-i18n';  // <-- add code
import { AppProvider as DiscountProvider } from "@shopify/discount-app-components";
import {Page, AppProvider as PolarisAppProvider} from '@shopify/polaris';
import enPolarisTranslations from '@shopify/polaris/locales/en.json';

import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();
  const i18nManager = new I18nManager({   // <-- add code
    locale: 'en'
  });

  return (
      <AppProvider isEmbeddedApp apiKey={apiKey}>
        <PolarisAppProvider i18n={enPolarisTranslations}>
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
        </PolarisAppProvider>
      </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs: HeadersArgs) => {
  return boundary.headers(headersArgs);
};
