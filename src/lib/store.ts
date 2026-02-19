/**
 * @deprecated Import from `@/lib/stores` instead.
 * This file re-exports stores for backward compatibility during migration.
 * Components should be updated to import from the specific store they need.
 */
export { useAuthStore, useBoardStore, useProjectStore } from "./stores"

// Backward compatibility: re-export useProjectStore as useTaskStore
// This allows existing components to work without immediate changes.
// TODO: Update all consumers to use specific stores, then remove this.
export { useProjectStore as useTaskStore } from "./stores"
