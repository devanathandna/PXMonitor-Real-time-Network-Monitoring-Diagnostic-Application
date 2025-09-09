
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DataPoint {
  timestamp: number;
  value: number;
}

interface LiveChartProps {
  title: string;
  data: DataPoint[];
  yAxisLabel: string;
  color?: string;
  height?: number;
  className?: string;
}

const LiveChart = ({ 
  title, 
  data, 
  yAxisLabel,
  color = "#00B7EB",
  height = 200, 
  className 
}: LiveChartProps) => {
  const [pathD, setPathD] = useState("");
  
  // Format timestamp for x-axis
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  };
  
  useEffect(() => {
    if (data.length === 0) return;
    
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 1000 - margin.left - margin.right;
    const graphHeight = height - margin.top - margin.bottom;
    
    // Find min and max values for scaling
    const minValue = Math.min(...data.map(d => d.value));
    const maxValue = Math.max(...data.map(d => d.value));
    const valueRange = maxValue - minValue;
    
    // Ensure we have a reasonable range
    const yMin = minValue - (valueRange * 0.1) || 0;
    const yMax = maxValue + (valueRange * 0.1) || 10;
    
    const timeRange = data[data.length - 1].timestamp - data[0].timestamp;
    
    // Scale functions
    const xScale = (time: number) => {
      return ((time - data[0].timestamp) / timeRange) * width;
    };
    
    const yScale = (value: number) => {
      const range = yMax - yMin;
      if (range === 0) return graphHeight / 2; // Default to middle if range is zero
      return graphHeight - ((value - yMin) / range) * graphHeight;
    };
    
    // Create path
    let pathString = "";
    data.forEach((d, i) => {
      const x = xScale(d.timestamp);
      const y = yScale(d.value);
      pathString += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
    
    setPathD(pathString);
  }, [data, height]);
  
  return (
    <div className={cn("network-card", className)}>
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      
      {data.length > 0 ? (
        <div className="w-full" style={{ height: `${height}px` }}>
          <svg width="100%" height="100%" viewBox={`0 0 1000 ${height}`} preserveAspectRatio="none">
            {/* Grid lines */}
            <g className="grid-lines">
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                <line
                  key={i}
                  x1="50"
                  y1={20 + ratio * (height - 50)}
                  x2="980"
                  y2={20 + ratio * (height - 50)}
                  stroke="#6B7280"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                  opacity="0.3"
                />
              ))}
            </g>
            
            {/* Y axis */}
            <line x1="50" y1="20" x2="50" y2={height - 30} stroke="#6B7280" strokeWidth="1" />
            
            {/* X axis */}
            <line x1="50" y1={height - 30} x2="980" y2={height - 30} stroke="#6B7280" strokeWidth="1" />
            
            {/* Chart line */}
            <path
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Y-axis label */}
            <text x="10" y={height / 2} transform={`rotate(-90, 10, ${height / 2})`} fill="#F5F6F5" fontSize="12">
              {yAxisLabel}
            </text>
            
            {/* X-axis labels - just show a few time points */}
            {data.length > 0 && 
              [0, Math.floor(data.length / 2), data.length - 1].map((idx, i) => (
                <text 
                  key={i}
                  x={idx === 0 ? 50 : (idx === data.length - 1 ? 950 : 500)}
                  y={height - 10}
                  fill="#F5F6F5"
                  fontSize="12"
                  textAnchor={idx === 0 ? "start" : (idx === data.length - 1 ? "end" : "middle")}
                >
                  {formatTime(data[idx].timestamp)}
                </text>
              ))
            }
          </svg>
        </div>
      ) : (
        <div 
          className="flex items-center justify-center" 
          style={{ height: `${height - 30}px` }}
        >
          <p className="text-muted-foreground">No data available</p>
        </div>
      )}
    </div>
  );
};

export default LiveChart;
