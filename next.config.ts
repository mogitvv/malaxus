import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Cache Components aus: hängt sich in Cloudflares Workers-Laufzeitumgebung auf
     (Next.js warnt selbst, dass setTimeout() dort nicht wie erwartet funktioniert). */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
