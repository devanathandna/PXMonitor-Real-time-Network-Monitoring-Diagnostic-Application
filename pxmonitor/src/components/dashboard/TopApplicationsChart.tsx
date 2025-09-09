
import React from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ExplanationPopover from "../ui/explanation-popover";
import ComponentExplanation from "../ui/component-explanation";
import { TooltipProps } from "recharts";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

interface AppData {
  name: string;
  value: number;
}

interface TopApplicationsChartProps {
  data: AppData[];
  className?: string;
}

// Custom tooltip content to show colored usage lines
const CustomTooltip = ({ 
  active, 
  payload
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const COLORS = ['#9b87f5', '#D946EF', '#F97316', '#0EA5E9', '#8B5CF6'];
    const app = payload[0];
    const value = app.value as number;
    const name = app.name as string;
    
    return (
      <div className="custom-tooltip bg-[rgba(26,31,44,0.95)] p-3 border border-[#000000] rounded-md shadow-lg">
        <p className="text-white font-medium mb-2">{name}</p>
        {COLORS.map((color, i) => (
          <div key={i} className="flex items-center mb-1.5">
            <div 
              className="w-3 h-3 mr-2 rounded-sm" 
              style={{ backgroundColor: color }} 
            />
            <p style={{ color }} className="text-xs">
              Usage : {(value / 1000).toFixed(1)}k bytes
            </p>
          </div>
        ))}
      </div>
    );
  }
  
  return null;
};

const TopApplicationsChart = ({ data, className }: TopApplicationsChartProps) => {
  // Colorful palette for the bars
  const COLORS = ['#9b87f5', '#D946EF', '#F97316', '#0EA5E9', '#8B5CF6'];
  
  return (
    <Card className={`network-card overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div>
            <CardTitle className="text-lg font-montserrat">Top Applications</CardTitle>
            <CardDescription>Applications using the most bandwidth</CardDescription>
          </div>
          <div className="flex space-x-1">
            <ExplanationPopover 
              componentName="Top Applications" 
              metrics={{ 
                appCount: data.length,
                topApp: data[0]?.name,
                topValue: data[0]?.value
              }}
            />
            <ComponentExplanation 
              componentName="Top Applications" 
              data={data}
              chart={
                <div className="h-[80px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={data} 
                      layout="vertical"
                      margin={{ top: 5, right: 10, left: 20, bottom: 5 }}
                    >
                      <XAxis 
                        type="number" 
                        stroke="#E0E0E0" 
                        fontSize={10}
                        hide
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        stroke="#E0E0E0" 
                        fontSize={10} 
                        width={50}
                      />
                      {data.map((entry, index) => (
                        <Bar 
                          key={`bar-${index}`} 
                          dataKey="value" 
                          data={[entry]} 
                          fill={COLORS[index % COLORS.length]} 
                          name={entry.name}
                          barSize={8}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              }
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              layout="vertical"
              margin={{ top: 5, right: 20, left: 60, bottom: 5 }}
              barGap={8}
              barCategoryGap={25}
            >
              <XAxis 
                type="number" 
                stroke="#E0E0E0" 
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                domain={[0, 'dataMax + 30000']}
                tickCount={5}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="#E0E0E0" 
                fontSize={12} 
                width={70}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
              />
              {data.map((entry, index) => {
                // Create a bar for each app but with a gradient of its specific color
                return (
                  <Bar 
                    key={`bar-${index}`} 
                    dataKey="value" 
                    data={[entry]} 
                    name={entry.name}
                    barSize={24}
                    background={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    className="cursor-pointer"
                    style={{
                      filter: `drop-shadow(0px 0px 8px ${COLORS[index % COLORS.length]}80)`
                    }}
                  >
                    {/* Create colored segments for each bar */}
                    {COLORS.map((color, colorIndex) => (
                      <rect
                        key={`rect-${index}-${colorIndex}`}
                        fill={color}
                        x={`${(colorIndex * 20)}%`}
                        width="20%"
                        height="100%"
                      />
                    ))}
                  </Bar>
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopApplicationsChart;
