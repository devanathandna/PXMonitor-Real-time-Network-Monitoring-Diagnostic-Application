
import React, { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { getComponentExplanation } from "@/services/gemini-service";

interface ExplanationPopoverProps {
  componentName: string;
  metrics?: Record<string, any>;
  className?: string;
}

const ExplanationPopover = ({ componentName, metrics, className }: ExplanationPopoverProps) => {
  const [explanation, setExplanation] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchExplanation = async () => {
    setLoading(true);
    try {
      // Call our gemini service, passing both component name and metrics
      const result = await getComponentExplanation(componentName, metrics);
      setExplanation(result);
      setLoading(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Explanation Failed",
        description: "Unable to fetch explanation from Gemini API.",
      });
      setLoading(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`rounded-full opacity-70 hover:opacity-100 hover:bg-accent/30 ${className}`}
          onClick={(e) => {
            // Prevent the popover from opening on first click
            if (!explanation) {
              e.preventDefault();
              fetchExplanation();
            }
          }}
        >
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Explain {componentName}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 backdrop-blur-md bg-card/95 border-accent/30 shadow-lg shadow-accent/20"
        sideOffset={5}
      >
        <div className="space-y-2">
          <h4 className="font-medium text-sm gradient-text">About {componentName}</h4>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-accent animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">Loading explanation...</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">{explanation}</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ExplanationPopover;
