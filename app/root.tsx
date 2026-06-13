import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  isRouteErrorResponse,
  useRouteError,
} from "react-router";
import type { LinksFunction } from "react-router";
import stylesheet from "~/tailwind.css?url";
import { useEffect } from "react";
import { ConfigurablesProvider, ConfigurablesCSSBridge } from "~/modules/configurables";
import { GlobalError } from "./error";

function ErrorReporter({ error }: { error: any }) {
  useEffect(() => {
    if (typeof window !== "undefined" && window.parent !== window) {
      const errorMsg = error instanceof Error ? error.message : String(error || "Unknown error");
      window.parent.postMessage(
        {
          type: "RUNTIME_ERROR",
          message: errorMsg,
        },
        "*"
      );
    }
  }, [error]);

  return null;
}

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <title>Axon — Error</title>
        <Links />
      </head>
      <body style={{ background: "#080810", color: "#f1f5f9" }}>
        <ErrorReporter error={error} />
        <GlobalError error={error} />
        <Scripts />
      </body>
    </html>
  );
}

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

/**
 * RouteChangeReporter - Reports route changes to parent window via postMessage.
 */
function RouteChangeReporter() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== "undefined" && window.parent !== window) {
      window.parent.postMessage(
        {
          type: "qb-route-change",
          pathname: location.pathname,
        },
        "*",
      );
    }
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body style={{ background: "#080810", color: "#f1f5f9", height: "100vh", overflow: "hidden" }}>
        <RouteChangeReporter />
        <ConfigurablesProvider>
          <ConfigurablesCSSBridge />
          <Outlet />
        </ConfigurablesProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
