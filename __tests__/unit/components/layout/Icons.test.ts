import { StarIcon } from "lucide-react"
import { describe, expect, it } from "vitest"

import { Icons } from "@/components/layout/Icons"

describe("Icons Object", () => {
  it("should export StarIcon as projectLogo", () => {
    // Verify that the Icons.projectLogo property is exactly the StarIcon component
    expect(Icons.projectLogo).toBe(StarIcon)
  })
})
