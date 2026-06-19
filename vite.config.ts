import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import devtoolsJson from "vite-plugin-devtools-json";
import { fileURLToPath, URL } from "node:url";
import fs from "node:fs";

const isContainer = fs.existsSync("/.dockerenv") || fs.existsSync("/run/secrets/kubernetes.io");
const defaultPort = isContainer ? 443 : undefined;
const hmrClientPort = process.env.HMR_CLIENT_PORT
  ? Number(process.env.HMR_CLIENT_PORT)
  : defaultPort;

export default defineConfig({
  resolve: {
    dedupe: ["react", "react-dom", "react-router"],
    alias: [
      {
        find: /^@qb\/(.+)$/,
        replacement: fileURLToPath(new URL("./app/modules/$1", import.meta.url)),
      },
    ],
  },
  // Pre-bundle the client deps the app reaches transitively (the 4-screen
  // Axon UI pulls axios via the orchestrator -> @qb/agentic -> api.client).
  // Without this, Vite discovers axios lazily on first task interaction and
  // does a mid-session "optimized dependencies changed. reloading", which can
  // leave two copies of react-router's DataRouterContext in the page and trip
  // "useLoaderData must be used within a data router" inside the root
  // ErrorBoundary. Forcing them into the initial optimize pass avoids that.
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router",
      "axios",
      "lucide-react",
      "clsx",
      "tailwind-merge",
    ],
  },
  ssr: {
    noExternal: [
      // "@radix-ui",
      // "react-icons",
      // "framer-motion",
      // "@apollo/client",
      // "posthog-js",
      // "posthog-js/react",
    ],
  },
  server: {
    allowedHosts: true,
    watch: {
      usePolling: true,
      interval: 100,
    },
    hmr: hmrClientPort ? { clientPort: hmrClientPort } : true,
  },
  plugins: [
    devtoolsJson(),
    reactRouter(),
    tsconfigPaths(),
  ],
});
