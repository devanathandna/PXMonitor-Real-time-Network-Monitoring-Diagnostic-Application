
import { cn } from "@/lib/utils";
import ExplanationPopover from "../ui/explanation-popover";
import ComponentExplanation from "../ui/component-explanation";

interface NetworkHealthGaugeProps {
  score: number;
  className?: string;
}

const NetworkHealthGauge = ({ score, className }: NetworkHealthGaugeProps) => {
  // Map the score (0-100) to the angle (0-180 degrees)
  const angle = (score / 100) * 180;
  
  // Determine label based on score
  let label = "Poor";
  if (score > 70) label = "Excellent";
  else if (score > 50) label = "Good";
  else if (score > 30) label = "Fair";
  
  // Calculate the SVG path for the colored progress arc
  const calculateArc = (value: number) => {
    const radius = 85;
    const strokeWidth = 12;
    const startAngle = -180; // Start from left side (in degrees)
    const endAngle = startAngle + (value / 100) * 180; // Up to 0 degrees maximum (right side)
    
    // Convert to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    // Calculate start and end points
    const startX = 100 + radius * Math.cos(startRad);
    const startY = 100 + radius * Math.sin(startRad);
    const endX = 100 + radius * Math.cos(endRad);
    const endY = 100 + radius * Math.sin(endRad);
    
    // Flag for arc drawing (1 for arcs greater than 180 degrees)
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    // Create arc path
    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
  };

  // Calculate stroke dash for the needle
  const needleLength = 75;
  
  // Generate a gradient ID that's unique for this component instance
  const gradientId = `networkHealthGradient-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className={cn("network-card flex flex-col items-center relative", className)}>
      <div className="flex justify-between items-center w-full mb-2">
        <h3 className="text-lg font-medium font-montserrat">Network Health</h3>
        <div className="flex space-x-1">
          <ExplanationPopover 
            componentName="Network Health" 
            metrics={{ score, label }}
          />
          <ComponentExplanation
            componentName="Network Health"
            data={{ score, label }}
          />
        </div>
      </div>
      
      <div className="relative w-full max-w-[220px] h-[140px]">
        {/* Gauge background with gradient */}
        <svg className="absolute inset-0" viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef5350" />
              <stop offset="50%" stopColor="#ffb74d" />
              <stop offset="100%" stopColor="#66bb6a" />
            </linearGradient>
            
            {/* Shadow filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          {/* Track background - hollow semisphere */}
          <path 
            d="M 15 100 A 85 85 0 0 1 185 100" 
            fill="none" 
            strokeWidth="12" 
            className="stroke-muted/20"
            strokeLinecap="round"
          />
          
          {/* Active gauge path with gradient */}
          <path 
            d={calculateArc(score)} 
            fill="none" 
            strokeWidth="12" 
            stroke={`url(#${gradientId})`}
            strokeLinecap="round"
            filter="url(#glow)"
          />
          
          {/* Gauge needle with shadow */}
          <line 
            x1="100" y1="100" 
            x2={100 + needleLength * Math.cos((angle - 180) * Math.PI / 180)} 
            y2={100 + needleLength * Math.sin((angle - 180) * Math.PI / 180)} 
            strokeWidth="3" 
            className="stroke-white" 
            strokeLinecap="round"
            filter="url(#glow)"
          />
          
          {/* Needle center point with glow */}
          <circle cx="100" cy="100" r="6" className="fill-white filter-blur-sm" />
          <circle cx="100" cy="100" r="3" className="fill-white" />
          
          {/* Score indicators */}
          <text x="20" y="125" fontSize="8" className="fill-muted-foreground">0</text>
          <text x="100" y="125" fontSize="8" className="fill-muted-foreground">50</text>
          <text x="180" y="125" fontSize="8" className="fill-muted-foreground">100</text>
        </svg>
      </div>
      
      {/* Score display - removed gradient color from numerical value */}
      <div className="mt-2 text-center">
        <h4 className="text-4xl font-bold font-montserrat relative z-10">
          {score}
        </h4>
        <p className={`font-medium font-montserrat mt-1 
          ${score > 70 ? "text-limeGreen" : score > 50 ? "text-yellow-400" : "text-coralRed"}`}>
          {label}
        </p>
      </div>
    </div>
  );
};

export default NetworkHealthGauge;
