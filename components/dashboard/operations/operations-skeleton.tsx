import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function OperationsSkeleton() {
  return (
    <div className="w-full h-full">
      <div className="flex gap-4 mt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="flex-1 h-[182px]">
            <CardHeader>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-28 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex space-x-4 mt-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="flex-1">
            <CardHeader className="items-center">
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="flex justify-center">
              <Skeleton className="h-[250px] w-[250px] rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
