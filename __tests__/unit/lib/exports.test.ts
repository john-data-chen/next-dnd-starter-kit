import { expect, test } from "vitest"

import * as AuthIndex from "@/lib/auth/index"
import * as StoreIndex from "@/lib/store"
import * as StoresIndex from "@/lib/stores/index"

test("exports check", () => {
  expect(StoreIndex.useAuthStore).toBeDefined()
  expect(StoreIndex.useBoardStore).toBeDefined()
  expect(StoreIndex.useProjectStore).toBeDefined()
  expect(StoreIndex.useTaskStore).toBeDefined()

  expect(AuthIndex.auth).toBeDefined()
  expect(AuthIndex.authConfig).toBeDefined()

  expect(StoresIndex.useAuthStore).toBeDefined()
  expect(StoresIndex.useBoardStore).toBeDefined()
  expect(StoresIndex.useProjectStore).toBeDefined()
})
