
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
  ok: {
    label: "ok",
    icon: IconCircleCheckFilled,
    color: "text-green-500 dark:text-green-400",
  },
  pending: {
    label: "pending",
    icon: IconClock,
    color: "text-gray-500",
  },
  error: {
    label: "error",
    icon: IconCircleXFilled,
    color: "text-red-500 dark:text-red-400",
  },
  default: {
    label: "Unknown",
    icon: IconHelpCircle,
    color: "text-muted-foreground",
  },
};

