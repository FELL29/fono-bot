import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Skeleton variants for specific UI components
export const ChildCardSkeleton = () => (
  <div className="rounded-lg border border-muted p-6 space-y-4 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex items-center space-x-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-6 w-6 rounded" />
        <Skeleton className="h-6 w-6 rounded" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-8" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
    <div className="flex justify-between">
      <Skeleton className="h-5 w-20 rounded-full" />
      <Skeleton className="h-3 w-24" />
    </div>
  </div>
);

export const StatsCardSkeleton = () => (
  <div className="rounded-lg border border-muted p-6 space-y-2 animate-pulse">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-4" />
    </div>
    <Skeleton className="h-8 w-12" />
  </div>
);

export const ActivitySkeleton = () => (
  <div className="p-4 rounded-lg border border-muted space-y-3 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex items-center space-x-3">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 animate-fade-in">
    {/* Header skeleton */}
    <div className="bg-background/80 backdrop-blur-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-16 rounded" />
            <Skeleton className="h-6 w-12 rounded-full" />
            <Skeleton className="h-8 w-12 rounded" />
          </div>
        </div>
      </div>
    </div>

    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Welcome section skeleton */}
      <div className="mb-6 sm:mb-8">
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Children cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <ChildCardSkeleton key={i} />
        ))}
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    </main>
  </div>
);

export { Skeleton }
