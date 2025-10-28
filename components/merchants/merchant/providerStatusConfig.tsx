import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconClock,
  IconHelpCircle,
} from "@tabler/icons-react";

export const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ElementType;
    color: string;
  }
> = {
  connected: {
    label: "Connected",
    icon: IconCircleCheckFilled,
    color: "text-green-500 dark:text-green-400",
  },
  inactive: {
    label: "Inactive",
    icon: IconClock,
    color: "text-yellow-500 dark:text-yellow-400",
  },
  disconnected: {
    label: "Disconnected",
    icon: IconCircleXFilled,
    color: "text-red-500 dark:text-red-400",
  },
  default: {
    label: "Unknown",
    icon: IconHelpCircle,
    color: "text-muted-foreground",
  },
};
