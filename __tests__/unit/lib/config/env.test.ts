import { afterEach, describe, expect, it, vi } from "vitest"

describe("Environment Configuration", () => {
  const originalEnv = process.env

  afterEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  it("should have correct environment flags in test environment", async () => {
    const { config } = await import("@/lib/config/env")
    expect(config.isTest).toBe(true)
    expect(config.isProduction).toBe(false)
  })

  it("should have correct environment flags in production", async () => {
    process.env.NODE_ENV = "production"
    process.env.DATABASE_URL = "mongodb://prod"
    const { config } = await import("@/lib/config/env")
    expect(config.isProduction).toBe(true)
    expect(config.nodeEnv).toBe("production")
  })

  it("should use default values when environment variables are not set", async () => {
    process.env.APP_NAME = ""
    const { config } = await import("@/lib/config/env")
    expect(config.appName).toBeDefined()
  })

  it("should not throw when DATABASE_URL is missing in production", async () => {
    process.env.NODE_ENV = "production"
    delete process.env.DATABASE_URL
    const { config } = await import("@/lib/config/env")
    expect(config.databaseUrl).toBeUndefined()
  })
})
