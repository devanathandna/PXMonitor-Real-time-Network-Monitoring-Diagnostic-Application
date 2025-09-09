
// Find the original MetricCard component and add the explanation feature
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import ExplanationPopover from "../ui/explanation-popover";
import ComponentExplanation from "../ui/component-explanation";

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  status: "success" | "warning" | "danger";
  className?: string;
}

const MetricCard = ({ title, value, unit, icon, status, className }: MetricCardProps) => {
  return (
    <div
      className={cn(
        "rounded-lg border p-3 shadow-sm bg-card",
        status === "success" ? "shadow-green-900/20" : 
        status === "warning" ? "shadow-yellow-900/20" : 
        "shadow-red-900/20",
        className
      )}
    >
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1.5 rounded-full",
            status === "success" ? "bg-green-500/10 text-green-500" : 
            status === "warning" ? "bg-yellow-500/10 text-yellow-500" : 
            "bg-red-500/10 text-red-500"
          )}>
            {icon}
          </div>
          <div className="font-medium text-sm">{title}</div>
        </div>
        <div className="flex space-x-1">
          <ExplanationPopover 
            componentName={title} 
            metrics={{ value, unit, status }}
          />
          <ComponentExplanation 
            componentName={title} 
            data={{ 
              value, 
              unit, 
              status,
              description: getMetricDescription(title, value, unit, status)
            }}
          />
        </div>
      </div>
      <div className="flex items-baseline mt-3">
        <div className={cn(
          "text-2xl font-bold metric-value",
          status === "success" ? "text-green-500" : 
          status === "warning" ? "text-yellow-500" : 
          "text-red-500"
        )}>
          {value}
        </div>
        <div className="text-sm ml-1.5 text-muted-foreground">{unit}</div>
      </div>
    </div>
  );
};

// Helper function to get more detailed metric descriptions for the AI analysis
const getMetricDescription = (title: string, value: number, unit: string, status: string) => {
  const metrics: Record<string, string> = {
    "Latency": `Network latency is the time it takes for data to travel from your device to its destination and back. 
      Your current latency is ${value}${unit}, which is ${
        status === 'success' ? 'excellent and suitable for all online activities.' : 
        status === 'warning' ? 'acceptable but could be improved. You may notice slight delays in real-time applications.' : 
        'quite high and likely causing noticeable delays in your online activities.'
      }`,
      
    "Jitter": `Jitter represents variation in latency over time. 
      Your current jitter is ${value}${unit}, which is ${
        status === 'success' ? 'very low, indicating a stable and consistent connection.' : 
        status === 'warning' ? 'moderate and may occasionally affect real-time applications like video calls.' : 
        'high, which can cause unpredictable delays and stuttering in real-time applications.'
      }`,
      
    "Packet Loss": `Packet loss occurs when data packets fail to reach their destination. 
      Your current packet loss rate is ${value}${unit}, which is ${
        status === 'success' ? 'minimal and shouldn\'t affect your online experience.' : 
        status === 'warning' ? 'noticeable and may cause occasional issues with online services.' : 
        'significant and likely causing disconnections, buffering, or other service disruptions.'
      }`,
      
    "DNS Delay": `DNS delay is the time it takes to convert website names to IP addresses. 
      Your current DNS delay is ${value}${unit}, which is ${
        status === 'success' ? 'very quick, allowing fast initial connections to websites.' : 
        status === 'warning' ? 'moderate and may cause slight delays when initially loading websites.' : 
        'slow, which can cause noticeable delays when accessing new websites.'
      }`,
      
    "Bandwidth": `Bandwidth represents your connection\'s data transfer capacity. 
      Your current bandwidth is ${value}${unit}, which is ${
        status === 'success' ? 'excellent and can support multiple high-bandwidth activities simultaneously.' : 
        status === 'warning' ? 'adequate for most online activities but may struggle with multiple simultaneous users.' : 
        'limited and may not support high-definition streaming or multiple users simultaneously.'
      }`
  };
  
  return metrics[title] || `${title} is currently measuring at ${value}${unit}.`;
};

export default MetricCard;
