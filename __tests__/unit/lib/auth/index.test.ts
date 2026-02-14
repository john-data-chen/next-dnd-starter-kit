import { describe, expect, it } from "vitest"

import { auth, authConfig } from "@/lib/auth/index"

describe("auth index", () => {
  it("should export auth and authConfig", () => {
    expect(auth).toBeDefined()
    expect(authConfig).toBeDefined()
  })
})
