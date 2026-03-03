"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface MatrixRow {
  name: string
  approved: number
  pending: number
  failed: number
  total: number
}

interface MatrixTableProps {
  title: string
  description?: string
  rows: MatrixRow[]
  nameColumnLabel: string
}

export function MatrixTable({
  title,
  description,
  rows,
  nameColumnLabel,
}: MatrixTableProps) {
  const totals = React.useMemo(() => {
    return rows.reduce(
      (acc, row) => ({
        approved: acc.approved + row.approved,
        pending: acc.pending + row.pending,
        failed: acc.failed + row.failed,
        total: acc.total + row.total,
      }),
      { approved: 0, pending: 0, failed: 0, total: 0 }
    )
  }, [rows])

  if (rows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[150px]">
          <p className="text-sm text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{nameColumnLabel}</TableHead>
              <TableHead className="text-right">Approved</TableHead>
              <TableHead className="text-right">Pending</TableHead>
              <TableHead className="text-right">Failed</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.name}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="text-right text-emerald-600 tabular-nums">
                  {row.approved.toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-yellow-600 tabular-nums">
                  {row.pending.toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-red-500 tabular-nums">
                  {row.failed.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {row.total.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-bold">Total</TableCell>
              <TableCell className="text-right font-bold text-emerald-600 tabular-nums">
                {totals.approved.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-bold text-yellow-600 tabular-nums">
                {totals.pending.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-bold text-red-500 tabular-nums">
                {totals.failed.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-bold tabular-nums">
                {totals.total.toLocaleString()}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  )
}
