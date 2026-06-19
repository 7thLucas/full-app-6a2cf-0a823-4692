import { useRouteError } from "react-router";
import { AxonProvider } from "~/axon/store";
import { ScreenProvider } from "~/axon/screen-store";
import { AxonMobileApp } from "~/axon/components/AxonMobileApp";
import { GlobalError } from "~/error";

export default function IndexPage() {
  return (
    <AxonProvider>
      <ScreenProvider>
        <AxonMobileApp />
      </ScreenProvider>
    </AxonProvider>
  );
}

/**
 * Route-level ErrorBoundary. Catches render errors thrown inside the Axon
 * screens here (where this route's data context is available) so they do NOT
 * bubble up to the root ErrorBoundary during hydration — which is what
 * produced the "useLoaderData must be used within a data router" crash.
 */
export function ErrorBoundary() {
  const error = useRouteError();
  return <GlobalError error={error} />;
}
