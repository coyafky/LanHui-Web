import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  telemetry: false,
});
