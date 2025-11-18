import { BaseTransaction } from "@/lib/types/transaction";
import ReportGeneratorTransactionTable from "../../reportTransaction/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { CreateReportSchemaType } from "@/lib/zod/createReport";

interface ReportGeneratorTransactionOverviewProps {
  form: UseFormReturn<CreateReportSchemaType>
  onNext: () => void
  onBack: () => void
  transaction: BaseTransaction[]
}

export default function ReportGeneratorTransactionOverview(
  {
    form,
    onNext,
    onBack,
    transaction
  }: ReportGeneratorTransactionOverviewProps
) {

  const onSubmit = () => {
    form.setValue("transactions", transaction)
    onNext()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions Overview</CardTitle>
        <CardDescription>
          This is the data that will be use on the report
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ReportGeneratorTransactionTable transactions={transaction} />
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal" className="flex h-full justify-end">
          <Button variant="outline" onClick={onBack} className="cursor-pointer w-full flex-1">
            Back
          </Button>
          <Button
            onClick={onSubmit}
            className="cursor-pointer flex-1"
          >
            Generate Report
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}

