import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  agentRules: false,
  async redirects() {
    return [{ source: "/nouvelle", destination: "/#lucioles", permanent: false }];
  },
};

export default nextConfig;
