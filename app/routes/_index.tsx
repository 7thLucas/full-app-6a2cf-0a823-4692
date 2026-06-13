import { AxonProvider } from "~/axon/store";
import { ScreenProvider } from "~/axon/screen-store";
import { AxonMobileApp } from "~/axon/components/AxonMobileApp";

export default function IndexPage() {
  return (
    <AxonProvider>
      <ScreenProvider>
        <AxonMobileApp />
      </ScreenProvider>
    </AxonProvider>
  );
}
