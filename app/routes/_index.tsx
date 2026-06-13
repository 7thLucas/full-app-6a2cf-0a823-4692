import { AxonProvider } from "~/axon/store";
import { AxonDashboard } from "~/axon/components/AxonDashboard";

export default function IndexPage() {
  return (
    <AxonProvider>
      <AxonDashboard />
    </AxonProvider>
  );
}
