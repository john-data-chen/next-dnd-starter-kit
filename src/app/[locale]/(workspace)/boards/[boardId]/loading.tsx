import { Skeleton } from "@/components/ui/skeleton"

export default function BoardDetailLoading() {
  return (
    <div className="space-y-4 p-4">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-10 w-[200px]" />
      </div>
      <div className="flex gap-4 overflow-x-auto">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[75vh] w-[380px] shrink-0 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
