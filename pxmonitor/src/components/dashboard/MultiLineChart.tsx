
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ExplanationPopover from "../ui/explanation-popover";
import ComponentExplanation from "../ui/component-explanation";

interface MultiLineChartProps {
  title: string;
  description: string;
  data: any[];
  lines: { id: string; name: string; color: string }[];
  height?: number;
  yAxisLabel?: string;
  className?: string;
}

const MultiLineChart = ({
  title,
  description,
  data,
  lines,
  height = 300,
  yAxisLabel,
  className,
}: MultiLineChartProps) => {
  // Format timestamp for tooltips
  const formatXAxis = (tickItem: number) => {
    return new Date(tickItem).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format tooltip value
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/90 backdrop-blur-sm border border-accent/20 shadow-lg shadow-accent/10 px-3 py-2 rounded-md">
          <p className="text-xs text-muted-foreground mb-1">
            {formatXAxis(label)}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={`tooltip-${index}`} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toFixed(2)}`}
            </p>
          ))}
        </div>
      );
    }

    return null;
  };

  // Calculate stats for the explanations
  const calculateStats = () => {
    if (!data || data.length === 0) return {};
    
    const stats: Record<string, any> = {};
    
    // Process each line's data
    lines.forEach(line => {
      if (data[0][line.id] !== undefined) {
        const values = data.map(item => item[line.id]);
        const sum = values.reduce((a, b) => a + b, 0);
        const average = sum / values.length;
        const max = Math.max(...values);
        const min = Math.min(...values);
        
        stats[line.id] = {
          average: average.toFixed(2),
          max: max.toFixed(2),
          min: min.toFixed(2),
          current: values[values.length - 1].toFixed(2)
        };
      }
    });
    
    return stats;
  };

  const stats = calculateStats();

  return (
    <Card className={`overflow-hidden network-card ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-montserrat">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex space-x-1">
            <ExplanationPopover componentName={title} metrics={stats} />
            <ComponentExplanation 
              componentName={title} 
              data={stats} 
              chart={
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart
                    data={data.slice(-15)} // Show last 15 points for clarity
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <XAxis 
                      dataKey="timestamp" 
                      type="number" 
                      domain={['dataMin', 'dataMax']} 
                      tickFormatter={formatXAxis} 
                      stroke="#888888"
                      fontSize={10}
                    />
                    <YAxis 
                      label={{ 
                        value: yAxisLabel, 
                        position: 'insideLeft',
                        angle: -90, 
                        style: { textAnchor: 'middle', fontSize: 10 }
                      }} 
                      stroke="#888888"
                      fontSize={10}
                    />
                    {lines.map((line) => (
                      <Line
                        key={line.id}
                        type="monotone"
                        dataKey={line.id}
                        stroke={line.color}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 1 }}
                        name={line.name}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              }
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                className="stroke-muted/30" 
              />
              <XAxis 
                dataKey="timestamp" 
                type="number" 
                domain={['dataMin', 'dataMax']} 
                tickFormatter={formatXAxis} 
                stroke="#888888"
              />
              <YAxis 
                label={{ 
                  value: yAxisLabel, 
                  position: 'insideLeft', 
                  angle: -90, 
                  style: { textAnchor: 'middle' } 
                }} 
                stroke="#888888"
              />
              <Tooltip content={<CustomTooltip />} />
              {lines.map((line) => (
                <Line
                  key={line.id}
                  type="monotone"
                  dataKey={line.id}
                  stroke={line.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 1 }}
                  name={line.name}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MultiLineChart;
