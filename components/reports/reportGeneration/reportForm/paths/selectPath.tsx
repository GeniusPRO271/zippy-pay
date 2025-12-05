"use client";

import { Control, Controller } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconReportMoney, IconReportAnalytics, IconPercentage } from "@tabler/icons-react";
import { CreateReportSchemaType } from "@/lib/zod/createReport";

export default function ReportTypeSelect({
  control,
  onNext,
}: {
  control: Control<CreateReportSchemaType>;
  onNext: () => void;
}) {
  return (
    <Controller
      control={control}
      name="reportType"
      render={({ field }) => (
        <Card className="h-full w-full max-w-md min-h-[calc(100vh-250px)]">
          <CardHeader>
            <CardTitle>Generate a Report</CardTitle>
            <CardDescription>
              Select the type of report you want to generate.
            </CardDescription>
          </CardHeader>

          <CardContent className="h-full space-y-4">

            {/* FINANCIAL REPORT */}
            <div
              onClick={() => field.onChange("finance")}
              className={`flex flex-col gap-1 p-4 rounded-2xl transition cursor-pointer
              border hover:bg-muted/50
              ${field.value === "finance" ? "border-solid border-white bg-muted/50" : "border-dashed"}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-1">
                  <IconReportMoney />
                  <h3 className="text-lg font-semibold">Financial Report</h3>
                </div>
                <Badge className="text-xs h-5">.xlsx</Badge>
              </div>

              <p className="text-sm text-muted-foreground mt-1">
                A multi-sheet Excel with commission formulas and provider stats.
              </p>
            </div>

            {/* SUMMARY REPORT */}
            <div
              onClick={() => field.onChange("resume")}
              className={`flex flex-col gap-1 p-4 rounded-2xl transition cursor-pointer
              border hover:bg-muted/50
              ${field.value === "resume" ? "border-solid border-white bg-muted/50" : "border-dashed"}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-1">
                  <IconReportAnalytics />
                  <h3 className="text-lg font-semibold">Summary Report</h3>
                </div>
                <Badge className="text-xs h-5">.xlsx</Badge>
              </div>

              <p className="text-sm text-muted-foreground mt-1">
                A high-level overview of all countries aggregated by time ranges.
              </p>
            </div>
            <div
              onClick={() => field.onChange("daily")}
              className={`flex flex-col gap-1 p-4 rounded-2xl transition cursor-pointer
              border hover:bg-muted/50
              ${field.value === "daily" ? "border-solid border-white bg-muted/50" : "border-dashed"}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-1">
                  <IconPercentage />
                  <h3 className="text-lg font-semibold">Daily Report</h3>
                </div>
                <Badge className="text-xs h-5">.xlsx</Badge>
              </div>

              <p className="text-sm text-muted-foreground mt-1">
                A multi-sheet Excel with resume of transaction group daily and monthly.
              </p>
            </div>

          </CardContent>

          <CardFooter className="w-full justify-end">
            <Button onClick={() => field.value && onNext()} disabled={!field.value}>
              Next
            </Button>
          </CardFooter>
        </Card>
      )}
    />
  );
}
