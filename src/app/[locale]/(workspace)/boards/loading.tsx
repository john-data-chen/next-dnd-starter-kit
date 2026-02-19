import { Skeleton } from "@/components/ui/skeleton"

export default function BoardsLoading() {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="flex flex-col items-start justify-between gap-2 p-4 sm:flex-row sm:items-center">
        <Skeleton className="h-10 w-[200px]" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[140px]" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[160px] rounded-lg" />
        ))}
      </div>
    </div>
  )
}
