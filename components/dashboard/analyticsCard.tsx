import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { IconCaretDownFilled, IconCaretUpFilled, IconInfoCircle, TablerIcon } from '@tabler/icons-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { ReactNode } from "react";

type AnalyticsCardProps = {
  icon?: TablerIcon;
  title: string;
  tooltip?: string;
  value: string | number;
  description?: string;
  chart?: ReactNode;
  footerLabel?: string;
  footerValue?: string | number;
  footerIcon?: TablerIcon;
  footerValueColor?: string;
};

function AnalyticsCard({
  icon,
  title,
  tooltip,
  value,
  description,
  chart,
  footerLabel,
  footerValue,
}: AnalyticsCardProps) {
  const Icon = icon;
  const FooterNumber = footerValue ? Number(footerValue) : 0;
  return (
    <Card className="h-[182px] flex-1 gap-5">
      <CardHeader>
        <CardTitle className="flex gap-2 font-medium">
          {Icon && <Icon size={14} />}
          <p className="text-[14px]">{title}</p>
        </CardTitle>
        {tooltip && (
          <CardAction>
            <Tooltip>
              <TooltipTrigger className="cursor-pointer" asChild>
                <IconInfoCircle size={18} className="text-gray-500" />
              </TooltipTrigger>
              <TooltipContent className="mb-1">
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </CardAction>
        )}
      </CardHeader>

      <CardContent>
        <div>
          <div className="flex justify-between flex-1">
            <p className="text-3xl font-bold">{value}</p>
            <div>{chart}</div>
          </div>
          {description && (
            <p className="text-[12px] text-gray-500">{description}</p>
          )}
        </div>
      </CardContent>

      {(footerLabel || footerValue) && (
        <CardFooter>
          <div className="flex w-full items-center">
            {footerLabel && (
              <p className="text-[14px] font-medium">{footerLabel}</p>
            )}
            <div
              className={` flex justify-end items-center gap-2 w-full ${FooterNumber < 0 ? 'text-red-500' : 'text-green-500'
                }`}
            >
              {FooterNumber < 0 ? FooterNumber * -1 : FooterNumber}%
              {FooterNumber < 0 ? <IconCaretDownFilled /> : <IconCaretUpFilled />}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

export default AnalyticsCard;
