// Auth secrets - single source of truth for all auth-related files

const AUTH_SECRET = process.env.AUTH_SECRET
if (!AUTH_SECRET) {
  throw new Error("AUTH_SECRET environment variable is required")
}

export const JWT_SECRET = new TextEncoder().encode(AUTH_SECRET)
