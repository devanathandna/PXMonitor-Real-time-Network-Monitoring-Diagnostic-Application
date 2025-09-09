
import { cn } from "@/lib/utils";

interface StatusCardProps {
  title: string;
  status: "stable" | "unstable" | "critical";
  description?: string;
  className?: string;
}

const StatusCard = ({ title, status, description, className }: StatusCardProps) => {
  // Define styles based on status
  const getStatusStyles = () => {
    switch (status) {
      case "stable":
        return {
          color: "text-limeGreen",
          shadow: "shadow-[0_0_15px_rgba(34,197,94,0.3)]",
          label: "Stable"
        };
      case "unstable":
        return {
          color: "text-yellow-400",
          shadow: "shadow-[0_0_15px_rgba(250,204,21,0.3)]",
          label: "Unstable"
        };
      case "critical":
        return {
          color: "text-coralRed",
          shadow: "shadow-[0_0_15px_rgba(248,113,113,0.3)]",
          label: "Critical"
        };
    }
  };
  
  const statusStyle = getStatusStyles();
  
  return (
    <div className={cn("network-card", className)}>
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="flex flex-col items-center justify-center py-4">
        <div 
          className={cn(
            "text-2xl font-bold py-2 px-6 rounded-full border",
            statusStyle.color,
            statusStyle.shadow,
            `border-${statusStyle.color}`
          )}
        >
          {statusStyle.label}
        </div>
        {description && (
          <p className="mt-4 text-sm text-muted-foreground text-center">{description}</p>
        )}
      </div>
    </div>
  );
};

export default StatusCard;
