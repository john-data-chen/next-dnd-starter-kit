import { Types } from "mongoose"

/**
 * Converts various MongoDB ID representations to a standardized string format.
 * Handles:
 * - Native Types.ObjectId instances
 * - Documents with _id property
 * - Documents with id property (not _id)
 * - Plain string IDs
 */
export function getObjectIdString(
  id: Types.ObjectId | string | { _id?: Types.ObjectId | string; id?: string } | null | undefined
): string {
  if (!id) {
    return ""
  }
  if (id instanceof Types.ObjectId) {
    return id.toHexString()
  }
  if (typeof id === "object" && id !== null) {
    if ("_id" in id && id._id) {
      return getObjectIdString(id._id)
    }
    if ("id" in id && id.id) {
      return String(id.id)
    }
  }
  if (typeof id === "string") {
    return id
  }
  return ""
}
