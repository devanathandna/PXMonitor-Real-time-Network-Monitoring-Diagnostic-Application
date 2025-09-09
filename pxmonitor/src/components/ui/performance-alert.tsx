
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PerformanceAlertProps {
  title: string;
  description: string;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  className?: string;
  onAction?: () => void;
  actionText?: string;
  onClose?: () => void;
}

const PerformanceAlert = ({
  title,
  description,
  variant = "default",
  className,
  onAction,
  actionText = "Fix Now",
  onClose
}: PerformanceAlertProps) => {
  const getIcon = () => {
    switch (variant) {
      case "destructive":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-limeGreen" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case "info":
        return <Info className="h-4 w-4 text-neonBlue" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };
  
  const getVariantClass = () => {
    switch (variant) {
      case "destructive":
        return "border-coralRed/50 bg-coralRed/10";
      case "success":
        return "border-limeGreen/50 bg-limeGreen/10";
      case "warning":
        return "border-yellow-400/50 bg-yellow-400/10";
      case "info":
        return "border-neonBlue/50 bg-neonBlue/10";
      default:
        return "";
    }
  };

  return (
    <Alert className={cn("relative", getVariantClass(), className)}>
      <div className="flex items-start">
        {getIcon()}
        <div className="ml-2">
          <AlertTitle className="text-sm font-medium">{title}</AlertTitle>
          <AlertDescription className="text-xs mt-1">{description}</AlertDescription>
        </div>
      </div>
      
      {onAction && (
        <div className="mt-2 flex items-center justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 px-2 py-1 text-xs" 
            onClick={onAction}
          >
            {actionText}
          </Button>
          
          {onClose && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 py-1 text-xs" 
              onClick={onClose}
            >
              Dismiss
            </Button>
          )}
        </div>
      )}
    </Alert>
  );
};

export { PerformanceAlert };
