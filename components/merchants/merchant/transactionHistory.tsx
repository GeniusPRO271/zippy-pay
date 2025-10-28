import StatusBadge from "@/components/dashboard/table/statusBadge"
import { STATUS_CONFIG } from "@/components/dashboard/table/statusConfig"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { IconInfoCircle } from "@tabler/icons-react"
import { format } from "date-fns"

function TransactionHistory() {
  return (
    <Card className="p-5 flex flex-col gap-10 flex-1">
      <div className="flex  flex-col justify-center ">
        <div className="flex items-center justify-between">
          <h4 className="scroll-m-20 text-normal font-semibold tracking-tight">
            Transaction History
          </h4>
          <div className="flex items-center gap-2">
            <Button variant={"ghost"} size={"sm"} className="cursor-pointer">
              View more
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <IconInfoCircle size={18} className="text-gray-500" />
              </TooltipTrigger>
              <TooltipContent className="mb-1">
                <p>Latest transactions</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div className="max-h-[300px] mt-5">
          <Table className="max-w-full flex-1 overflow-hidden">
            <TableHeader>
              <TableRow>
                <TableHead className="w-full">Costumer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Benjamin Toro</TableCell>
                <TableCell>
                  <StatusBadge status="ok" statusConfig={STATUS_CONFIG} />
                </TableCell>
                <TableCell>
                  {format(new Date(), "dd/MM/yyyy hh:mm")}
                </TableCell>
                <TableCell className="text-right">$1,200</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Benjamin Toro</TableCell>
                <TableCell>
                  <StatusBadge status="error" statusConfig={STATUS_CONFIG} />
                </TableCell>
                <TableCell>
                  {format(new Date(), "dd/MM/yyyy hh:mm")}
                </TableCell>
                <TableCell className="text-right">$200</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Benjamin Toro</TableCell>
                <TableCell>
                  <StatusBadge status="ok" statusConfig={STATUS_CONFIG} />
                </TableCell>
                <TableCell>
                  {format(new Date(), "dd/MM/yyyy hh:mm")}
                </TableCell>
                <TableCell className="text-right">$1,000</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  )
}

export default TransactionHistory
