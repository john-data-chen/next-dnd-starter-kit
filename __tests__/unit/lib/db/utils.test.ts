import { Types } from "mongoose"
import { describe, expect, it } from "vitest"

import { getObjectIdString } from "@/lib/db/utils"

describe("getObjectIdString", () => {
  it("returns empty string for null", () => {
    expect(getObjectIdString(null)).toBe("")
  })

  it("returns empty string for undefined", () => {
    expect(getObjectIdString(undefined)).toBe("")
  })

  it("converts a native ObjectId to its hex string", () => {
    const oid = new Types.ObjectId()
    expect(getObjectIdString(oid)).toBe(oid.toHexString())
  })

  it("resolves a document whose _id is an ObjectId", () => {
    const oid = new Types.ObjectId()
    expect(getObjectIdString({ _id: oid })).toBe(oid.toHexString())
  })

  it("resolves a document whose _id is already a string", () => {
    expect(getObjectIdString({ _id: "abc123" })).toBe("abc123")
  })

  it("falls back to the id field when no _id is present", () => {
    expect(getObjectIdString({ id: "id-456" })).toBe("id-456")
  })

  it("returns a plain string id unchanged", () => {
    expect(getObjectIdString("plain-id")).toBe("plain-id")
  })

  it("returns empty string for an object without _id or id", () => {
    expect(getObjectIdString({})).toBe("")
  })

  it("returns empty string when both _id and id are falsy", () => {
    expect(getObjectIdString({ _id: "", id: "" })).toBe("")
  })
})
