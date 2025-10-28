"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { XCircle } from "lucide-react"

function FailedPayment() {
  const router = useRouter()

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Card className="w-[400px] flex flex-col justify-center items-center border shadow-none rounded-md p-6 gap-4">
          <XCircle className="size-8" />
          <div className="text-center">
            <h1 className="text-2xl font-bold">Test Payment Failed</h1>
            <p className="text-gray-700 leading-relaxed">
              Something went wrong with your transaction.
            </p>
          </div>
          <Button
            onClick={() => router.push('/')}
            className="w-full cursor-pointer"
          >
            Go Back Home
          </Button>
        </Card>
      </main>
    </div>
  )
}

export default FailedPayment
