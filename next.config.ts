import type { NextConfig } from "next";

// La API vive en este mismo proyecto (src/app/api), ya no se reenvía a un backend separado.
const nextConfig: NextConfig = {
  devIndicators: false,
};

export default nextConfig;
