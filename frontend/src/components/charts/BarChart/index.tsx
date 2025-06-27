"use client";

import React, { useMemo } from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { commonChartProps, xAxisProps, yAxisProps } from "../common/chartProps";

interface TrafficData {
  day: string;
  pedestrians: number;
  twoWheelers: number;
  fourWheelers: number;
  trucks: number;
}

interface BarChartProps {
  data: TrafficData[];
  chartType: string;
  selectedCategories: string[];
}

const chartConfig = {
  pedestrians: {
    label: "Pedestrians",
    color: "var(--chart-1)",
  },
  twoWheelers: {
    label: "Two-Wheelers",
    color: "var(--chart-2)",
  },
  fourWheelers: {
    label: "Four-Wheelers",
    color: "var(--chart-3)",
  },
  trucks: {
    label: "Trucks",
    color: "var(--chart-4)",
  },
};

const BarChart: React.FC<BarChartProps> = ({
  data,
  chartType,
  selectedCategories,
}) => {
  const barSize = 20;

  // Process data for horizontal chart
  const processedData = useMemo(() => {
    if (chartType !== "bar-horizontal") return data;

    // Group data by week if there are more than 7 days
    if (data.length > 7) {
      const weekGroups = new Map<string, TrafficData>();

      data.forEach((item) => {
        const weekNum = Math.floor(data.indexOf(item) / 7) + 1;
        const weekKey = `Week ${weekNum}`;

        if (!weekGroups.has(weekKey)) {
          weekGroups.set(weekKey, {
            day: weekKey,
            pedestrians: 0,
            twoWheelers: 0,
            fourWheelers: 0,
            trucks: 0,
          });
        }

        const weekData = weekGroups.get(weekKey)!;
        weekData.pedestrians += item.pedestrians;
        weekData.twoWheelers += item.twoWheelers;
        weekData.fourWheelers += item.fourWheelers;
        weekData.trucks += item.trucks;
      });

      // Calculate averages
      return Array.from(weekGroups.values()).map((week) => ({
        ...week,
        pedestrians: Math.round(week.pedestrians / 7),
        twoWheelers: Math.round(week.twoWheelers / 7),
        fourWheelers: Math.round(week.fourWheelers / 7),
        trucks: Math.round(week.trucks / 7),
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
                  {chartConfig[entry.dataKey as keyof typeof chartConfig].label}
                  : {entry.value.toLocaleString()}
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
                    <CartesianGrid
                      stroke="#e3e9f0"
                      vertical={true}
                      horizontal={true}
                    />
                    <XAxis
                      type="number"
                      tickFormatter={(value) => value.toLocaleString()}
                      domain={[0, "dataMax + 100"]}
                      tick={{
                        fill: "#B8C4CE",
                        fontWeight: 100,
                        fontFamily: "DM Sans",
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
                    {selectedCategories.map((cat) => (
                      <Bar
                        key={cat}
                        dataKey={cat}
                        name={
                          chartConfig[cat as keyof typeof chartConfig]?.label ||
                          cat
                        }
                        fill={
                          chartConfig[cat as keyof typeof chartConfig]?.color ||
                          "#8884d8"
                        }
                        radius={5}
                      />
                    ))}
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
          <Legend
            iconType="circle"
            iconSize={8}
            align="left"
            wrapperStyle={{ marginTop: 10 }}
          />
          <Tooltip content={renderTooltip} />
          {selectedCategories.map((cat, idx) => {
            let radius = [0, 0, 0, 0];
            if (chartType === "bar-stacked") {
              if (idx === 0 && selectedCategories.length === 1) {
                // Only one bar: round all corners
                radius = [4, 4, 4, 4];
              } else if (idx === 0) {
                // Topmost: round top corners
                radius = [0, 0, 4, 4];
              } else if (idx === selectedCategories.length - 1) {
                // Bottommost: round bottom corners
                radius = [4, 4, 0, 0];
              } else {
                // Middle: no rounding
                radius = [0, 0, 0, 0];
              }
            } else {
              radius = [4, 4, 4, 4];
            }
            return (
              <Bar
                key={cat}
                dataKey={cat}
                name={
                  chartConfig[cat as keyof typeof chartConfig]?.label || cat
                }
                fill={
                  chartConfig[cat as keyof typeof chartConfig]?.color ||
                  "#8884d8"
                }
                stackId={chartType === "bar-stacked" ? "stack" : undefined}
                radius={radius as [number, number, number, number]}
              />
            );
          })}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
