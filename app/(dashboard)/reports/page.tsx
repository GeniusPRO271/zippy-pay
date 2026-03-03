"use client"

import ReportsTable from "@/components/reports/reportsTable"

export default function ReportsPage() {
  return (
    <>
      <h1 className="scroll-m-20 text-2xl font-bold tracking-tight text-balance mb-4">
        Reports
      </h1>
      <div className="flex justify-center items-center">
        <ReportsTable />
      </div>
    </>
  )
}
