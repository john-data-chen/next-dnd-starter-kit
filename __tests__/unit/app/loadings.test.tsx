import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import BoardDetailLoading from "@/app/[locale]/(workspace)/boards/[boardId]/loading"
import BoardsLoading from "@/app/[locale]/(workspace)/boards/loading"

describe("Loading Components", () => {
  it("BoardsLoading renders correctly", () => {
    const { container } = render(<BoardsLoading />)
    expect(container).toBeDefined()
  })

  it("BoardDetailLoading renders correctly", () => {
    const { container } = render(<BoardDetailLoading />)
    expect(container).toBeDefined()
  })
})
