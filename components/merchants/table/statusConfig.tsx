import { IconAlertTriangleFilled, IconCircleCheckFilled, IconCircleXFilled, IconClock, IconHelpCircle } from "@tabler/icons-react";

export const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ElementType;
    color: string;
  }
> = {
  active: {
    label: "Active",
    icon: IconCircleCheckFilled,
    color: "text-green-500 dark:text-green-400",
  },
  inactive: {
    label: "Inactive",
    icon: IconCircleXFilled,
    color: "text-gray-500 dark:text-gray-400",
  },
  suspended: {
    label: "Suspended",
    icon: IconAlertTriangleFilled,
    color: "text-yellow-500 dark:text-yellow-400",
  },
  pending: {
    label: "Pending",
    icon: IconClock,
    color: "text-blue-500 dark:text-blue-400",
  },
  default: {
    label: "Unknown",
    icon: IconHelpCircle,
    color: "text-muted-foreground",
  },
};

