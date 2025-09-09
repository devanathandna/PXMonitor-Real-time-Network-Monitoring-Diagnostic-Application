
import { X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AlertBannerProps {
  message: string;
  type: "warning" | "error" | "success" | "info";
  onClose?: () => void;
  onAction?: () => void;
  actionText?: string;
  className?: string;
}

const AlertBanner = ({ 
  message, 
  type, 
  onClose, 
  onAction, 
  actionText = "Fix Now", 
  className 
}: AlertBannerProps) => {
  const [visible, setVisible] = useState(true);
  
  if (!visible) return null;
  
  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };
  
  const getTypeStyles = () => {
    switch (type) {
      case "warning":
        return "bg-yellow-400/15 border-yellow-400 text-yellow-400";
      case "error":
        return "bg-coralRed/15 border-coralRed text-coralRed";
      case "success":
        return "bg-limeGreen/15 border-limeGreen text-limeGreen";
      case "info":
        return "bg-neonBlue/15 border-neonBlue text-neonBlue";
    }
  };
  
  return (
    <div 
      className={cn(
        "fixed top-4 left-1/2 transform -translate-x-1/2 w-auto max-w-sm rounded-lg border shadow-lg animate-fade-in z-50 py-2 px-3",
        getTypeStyles(),
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{message}</p>
        <div className="flex items-center gap-1 shrink-0">
          {onAction && (
            <button 
              onClick={onAction}
              className="px-2 py-1 rounded text-xs font-medium bg-neonBlue text-black hover:bg-neonBlue/80 transition-colors"
            >
              {actionText}
            </button>
          )}
          <button 
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertBanner;
