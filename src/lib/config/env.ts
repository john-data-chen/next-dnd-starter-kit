import { resolve } from "path"

import { config as dotenvConfig } from "dotenv"

const isNodeEnv = typeof window === "undefined"

if (isNodeEnv && !process.env.VERCEL) {
  dotenvConfig({ path: resolve(process.cwd(), ".env") })
}

const nodeEnv = process.env.NODE_ENV || "development"
const databaseUrl = isNodeEnv ? process.env.DATABASE_URL : undefined

if (isNodeEnv && !process.env.VERCEL && !databaseUrl) {
  const error = new Error(
    nodeEnv === "production"
      ? "Production DATABASE_URL is not defined"
      : "Local development DATABASE_URL is not defined. Please create a .env file with DATABASE_URL."
  )
  if (nodeEnv !== "production") {
    throw error
  }
}

export const config = {
  databaseUrl,
  nodeEnv,
  isProduction: nodeEnv === "production",
  isDevelopment: nodeEnv === "development",
  isTest: nodeEnv === "test",
  appName: process.env.APP_NAME || "Next.js App",
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
  debug: process.env.NEXT_PUBLIC_DEBUG === "true"
}
