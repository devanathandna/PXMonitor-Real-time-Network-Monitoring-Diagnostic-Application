
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ExplanationPopover from '../ui/explanation-popover';
import ComponentExplanation from '../ui/component-explanation';

interface ProtocolData {
  name: string;
  value: number;
}

interface ProtocolDistributionProps {
  data: ProtocolData[];
  className?: string;
}

const ProtocolDistribution = ({ data, className }: ProtocolDistributionProps) => {
  // Enhanced vibrant color palette for the chart segments
  const COLORS = ['#9b87f5', '#D946EF', '#F97316', '#0EA5E9', '#8B5CF6', '#33C3F0'];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const color = COLORS[payload[0].dataKey % COLORS.length];
      return (
        <div className="bg-card/90 backdrop-blur-sm border border-accent/20 shadow-lg shadow-accent/10 px-3 py-2 rounded-md">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: color }}
            />
            <p className="text-sm font-medium">{`${data.name}`}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{`${data.value} packets (${data.percentage}%)`}</p>
        </div>
      );
    }

    return null;
  };

  // Calculate total to get percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Prepare data for the chart to include percentages
  const chartData = data.map(item => ({
    ...item,
    percentage: ((item.value / total) * 100).toFixed(1)
  }));

  return (
    <Card className={`network-card overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div>
            <CardTitle className="text-lg font-montserrat">Protocol Distribution</CardTitle>
            <CardDescription>Network traffic by protocol type</CardDescription>
          </div>
          <div className="flex space-x-1">
            <ExplanationPopover 
              componentName="Protocol Distribution" 
              metrics={{
                protocolCount: data.length,
                topProtocol: data[0]?.name,
                totalPackets: total
              }}
            />
            <ComponentExplanation 
              componentName="Protocol Distribution" 
              data={{
                protocols: data,
                total: total,
                topProtocol: data[0]?.name,
                topValue: data[0]?.value,
                topPercentage: ((data[0]?.value / total) * 100).toFixed(1)
              }}
              chart={
                <div className="h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={40}
                        dataKey="value"
                        strokeWidth={1}
                        stroke="#1a1f2c"
                      >
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                            className="drop-shadow-md"
                            style={{ filter: `drop-shadow(0px 0px 8px ${COLORS[index % COLORS.length]}80)` }}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              }
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[270px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                dataKey="value"
                strokeWidth={2}
                stroke="#1a1f2c"
                paddingAngle={2}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    className="drop-shadow-md"
                    style={{ filter: `drop-shadow(0px 0px 10px ${COLORS[index % COLORS.length]}90)` }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                wrapperStyle={{ paddingLeft: '20px' }}
                iconSize={10}
                formatter={(value, entry) => {
                  const { color } = entry;
                  const item = entry.payload as any;
                  return (
                    <span style={{ color }} className="text-xs font-medium">
                      {item.name} ({item.percentage}%)
                    </span>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProtocolDistribution;
