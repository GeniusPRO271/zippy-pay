import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CarouselApi } from "@/components/ui/carousel";
import { useCreateReport } from "@/hooks/useGenerateReport";
import { CreateReportRequest } from "@/lib/api/reportGenerator";
import { BaseTransaction } from "@/lib/types/transaction";
import { IconReportMoney, IconReportAnalytics } from "@tabler/icons-react";

export default function ReportTypeSelect({
  setType,
  api,
  setShow,
  transactions
}: {
  setType: React.Dispatch<React.SetStateAction<"financial" | "resume" | undefined>>
  api: CarouselApi
  transactions: BaseTransaction[]
  setShow: React.Dispatch<React.SetStateAction<boolean>>

}) {

  const handleSelect = (type: "financial" | "resume") => {
    if (api && type != undefined) api.scrollNext()
  };

  const { mutate, isPending } = useCreateReport();

  function onSubmitResumeReport() {
    const payload = {
      reportType: "resume",
      transactions: transactions,
    } as CreateReportRequest;

    mutate(payload);

    if (!isPending) {
      setShow(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generate a Report</CardTitle>
        <CardDescription>
          Select the type of report you want to generate.
          <p>
            Found transactions {transactions.length}
          </p>
        </CardDescription>
      </CardHeader>

      <CardContent className="max-h-[441px] space-y-4">
        <div
          onClick={() => handleSelect("financial")}
          onMouseOver={() => setType("financial")}
          className="flex flex-col gap-1 p-4 border border-dashed hover:border-solid rounded-2xl hover:bg-muted/50 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-1">
              <IconReportMoney />
              <h3 className="text-lg font-semibold">Financial Report</h3>
            </div>
            <Badge className="text-xs h-5">.xlsx</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            An Excel file with one sheet per payment method for a selected country. Each sheet includes commission formulas,
            transaction details, and calculated totals per method.
          </p>
        </div>

        <div
          onClick={() => handleSelect("resume")}
          onMouseOver={() => setType("resume")}
          className="flex flex-col gap-1 p-4 border border-dashed hover:border-solid rounded-2xl hover:bg-muted/50 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-1">
              <IconReportAnalytics />
              <h3 className="text-lg font-semibold">Summary Report</h3>
            </div>
            <Badge className="text-xs h-5">.xlsx</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            An Excel file showing all countries with transaction amounts, success rates, and providers. Each country is in a
            separate table, with columns grouped by 7-day periods.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
