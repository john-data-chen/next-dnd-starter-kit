import { ROUTES } from "@/constants/routes"
import { Link } from "@/i18n/navigation"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">Page not found</p>
      <Link
        href={ROUTES.BOARDS.ROOT}
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
      >
        Go to Boards
      </Link>
    </div>
  )
}
