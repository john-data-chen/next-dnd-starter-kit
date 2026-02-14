import { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false
  },
  compiler: {
    relay: {
      src: "./",
      artifactDirectory: "./__generated__",
      language: "typescript",
      eagerEsModules: false
    }
  },
  // enable react compiler will increase build time 30~40%
  reactCompiler: false,
  cacheComponents: true,
  experimental: {
    turbopackFileSystemCacheForBuild: true
  }
}

export default withNextIntl(nextConfig)
