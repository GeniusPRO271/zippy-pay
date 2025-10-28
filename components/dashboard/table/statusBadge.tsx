import { Badge } from "@/components/ui/badge";
import { IconHelpCircle } from "@tabler/icons-react";

interface StatusBadgeProps {
  status: string;
  statusConfig: Record<
    string,
    {
      label: string;
      icon: React.ElementType;
      color: string;
    }
  >;
}

export default function StatusBadge({ status, statusConfig }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: "Unknown",
    icon: IconHelpCircle,
    color: "text-muted-foreground",
  };

  const { icon: IconComponent, color, label } = config;

  return (
    <Badge
      variant="outline"
      className="text-muted-foreground px-1.5 flex items-center gap-1"
    >
      <IconComponent className={color} size={14} />
      {label}
    </Badge>
  );
}
