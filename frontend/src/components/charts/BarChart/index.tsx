"use client"

import React, { useMemo } from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";

import {
  Card,
  CardContent
} from "@/components/ui/card";
import {
  ChartContainer,
} from "@/components/ui/chart";
import { commonChartProps, xAxisProps, yAxisProps } from "../common/chartProps";

interface TrafficData {
  day: string;
  Category1: number;
  Category2: number;
  Category3: number;
  Category4: number;
}

interface BarChartProps {
  data: TrafficData[];
  chartType: string;
}

const chartConfig = {
  Category1: {
    label: "Pedestrians",
    color: "var(--chart-1)",
  },
  Category2: {
    label: "Two-Wheelers",
    color: "var(--chart-2)",
  },
  Category3: {
    label: "Four-Wheelers",
    color: "var(--chart-3)",
  },
  Category4: {
    label: "Heavy Vehicles",
    color: "var(--chart-4)",
  },
};

const BarChart: React.FC<BarChartProps> = ({ data, chartType }) => {
  const barSize = 20;

  // Process data for horizontal chart
  const processedData = useMemo(() => {
    if (chartType !== "bar-horizontal") return data;

    // Group data by week if there are more than 7 days
    if (data.length > 7) {
      const weekGroups = new Map<string, TrafficData>();
      
      data.forEach(item => {
        const weekNum = Math.floor(data.indexOf(item) / 7) + 1;
        const weekKey = `Week ${weekNum}`;
        
        if (!weekGroups.has(weekKey)) {
          weekGroups.set(weekKey, {
            day: weekKey,
            Category1: 0,
            Category2: 0,
            Category3: 0,
            Category4: 0,
          });
        }
        
        const weekData = weekGroups.get(weekKey)!;
        weekData.Category1 += item.Category1;
        weekData.Category2 += item.Category2;
        weekData.Category3 += item.Category3;
        weekData.Category4 += item.Category4;
      });

      // Calculate averages
      return Array.from(weekGroups.values()).map(week => ({
        ...week,
        Category1: Math.round(week.Category1 / 7),
        Category2: Math.round(week.Category2 / 7),
        Category3: Math.round(week.Category3 / 7),
        Category4: Math.round(week.Category4 / 7),
      }));
    }

    return data;
  }, [data, chartType]);

  const renderTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-sm">
          <div className="mb-2 font-medium">{label}</div>
          <div className="flex flex-col gap-2">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm">
                  {chartConfig[entry.dataKey as keyof typeof chartConfig].label}: {entry.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (chartType === "bar-horizontal") {
    return (
      <Card className="h-[430px]">
        <CardContent className="p-6">
          <ChartContainer config={chartConfig}>
            <div className="relative">
              <div className="absolute right-0 top-0 z-10">
                <Legend 
                  iconType="circle" 
                  iconSize={8} 
                  align="right" 
                  verticalAlign="top"
                  wrapperStyle={{ paddingBottom: 20 }}
                />
              </div>
              <div className="mt-8">
                <ResponsiveContainer width="100%" height={350}>
                  <RechartsBarChart 
                    data={processedData} 
                    layout="vertical" 
                    barSize={25}
                    barGap={2}
                    {...commonChartProps}
                  >
                    <CartesianGrid stroke="#e3e9f0" vertical={true} horizontal={true} />
                    <XAxis 
                      type="number" 
                      tickFormatter={(value) => value.toLocaleString()}
                      domain={[0, 'dataMax + 100']}
                      tick={{ 
                        fill: "#B8C4CE", 
                        fontWeight: 100, 
                        fontFamily: "DM Sans" 
                      }}
                      axisLine={{ stroke: "#B8C4CE", strokeWidth: 1 }}
                      tickLine={false}
                    />
                    <YAxis 
                      dataKey="day"
                      type="category"
                      {...yAxisProps}
                      tickMargin={20}
                      width={80}
                    />
                    <Tooltip content={renderTooltip} />
                    <Bar dataKey="Category1" fill="var(--chart-1)" radius={5} />
                    <Bar dataKey="Category2" fill="var(--chart-2)" radius={5} />
                    <Bar dataKey="Category3" fill="var(--chart-3)" radius={5} />
                    <Bar dataKey="Category4" fill="var(--chart-4)" radius={5} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={250}>
        <RechartsBarChart 
          data={data} 
          barSize={barSize} 
          barGap={chartType === "bar-stacked" ? 0 : 2}
          {...commonChartProps}
        >
          <CartesianGrid vertical={false} />
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Legend iconType="circle" iconSize={8} align="left" wrapperStyle={{ marginTop: 10 }} />
          <Tooltip content={renderTooltip} />
          <Bar 
            dataKey="Category1" 
            fill="var(--chart-1)" 
            stackId={chartType === "bar-stacked" ? "stack" : undefined} 
            radius={chartType === "bar-stacked" ? [0, 0, 4, 4] : [4, 4, 4, 4]} 
          />
          <Bar 
            dataKey="Category2" 
            fill="var(--chart-2)" 
            stackId={chartType === "bar-stacked" ? "stack" : undefined} 
            radius={chartType === "bar-stacked" ? 0 : [4, 4, 4, 4]} 
          />
          <Bar 
            dataKey="Category3" 
            fill="var(--chart-3)" 
            stackId={chartType === "bar-stacked" ? "stack" : undefined} 
            radius={chartType === "bar-stacked" ? 0 : [4, 4, 4, 4]} 
          />
          <Bar 
            dataKey="Category4" 
            fill="var(--chart-4)" 
            stackId={chartType === "bar-stacked" ? "stack" : undefined} 
            radius={chartType === "bar-stacked" ? [4, 4, 0, 0] : [4, 4, 4, 4]} 
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart; 