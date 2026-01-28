import * as React from "react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type DashboardSkeletonProps = {
  showHeader?: boolean
}

export function DashboardSkeleton({ showHeader = true }: DashboardSkeletonProps) {
  return (
    <div className="w-full h-full">
      {showHeader && (
        <div className="sticky top-0 z-50 bg-background py-2">
          <div className="items-center justify-between flex">
            <div className="flex gap-2 items-center justify-between flex-1 px-2">
              <Skeleton className="h-4 w-96" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-9 w-32" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 mt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="flex-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-24" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-28 mb-2" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex space-x-4 mt-4">
        <Card className="flex-1">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>

      <div className="flex space-x-4 mt-4">
        <Card className="flex-1">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
