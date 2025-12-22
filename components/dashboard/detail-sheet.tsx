import { ReactNode } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import RawJsonBlock from "./raw-json-block";
import { BaseTransaction } from "@/lib/types/transaction";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { format } from "date-fns";
import { timestampToDate } from "@/lib/analytics/utils";

function DetailSheet({ children, data }: { children: ReactNode, data: BaseTransaction }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Transaction Details
          </SheetTitle>
          <SheetDescription>
            <p className="text-left">
              This transaction is associated with the commerce account {" "}
              <strong>
                {data.commerceId}{" "}
              </strong>
              and was created under the request {" "}
              <strong>
                {data.commerceReqId}
              </strong>

              {" "}Its current status is {" "}
              <strong className="uppercase">
                {data.status}
              </strong>
            </p>
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 overflow-y-scroll mb-4">
          <Table className="mb-4 max-w-[400px]">
            <TableHeader>
              <TableRow>
                <TableHead className="">Field</TableHead>
                <TableHead className="">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Transaction Status</TableCell>
                <TableCell>{data.status}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Amount</TableCell>
                <TableCell>{data.quantity}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Currency</TableCell>
                <TableCell>{data.currency}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Method</TableCell>
                <TableCell>{data.payMethod}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-ellipsis">Costumer Name</TableCell>
                <TableCell>{data.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Costumer Email</TableCell>
                <TableCell>{data.email}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Document Number</TableCell>
                <TableCell>{data.documentId}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Date Requested</TableCell>
                <TableCell>
                  {format(data.dateRequest, "dd/MM/yyyy hh:mm")}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">Raw Json</h4>
          <RawJsonBlock json={data} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default DetailSheet
