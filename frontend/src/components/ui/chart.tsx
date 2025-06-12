import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface ChartProps {
  data: any[];
  title: string;
  dataKey: string;
  nameKey: string;
}

export function Chart({ data, title, dataKey, nameKey }: ChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={nameKey} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={dataKey} fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

interface ChartContainerProps {
  children: React.ReactNode;
  config: ChartConfig;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ children }) => {
  return (
    <div className="w-full h-[300px]">
      {children}
    </div>
  );
};

interface ChartTooltipProps {
  children?: React.ReactNode;
  cursor?: boolean;
  content?: React.ReactNode;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({ children, content }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface ChartTooltipContentProps {
  indicator?: "solid" | "dashed";
  hideLabel?: boolean;
}

export const ChartTooltipContent: React.FC<ChartTooltipContentProps> = () => {
  return (
    <div className="p-2">
      {/* Tooltip content will be rendered by Recharts */}
    </div>
  );
};

interface ChartLegendProps {
  content: React.ReactNode;
}

export const ChartLegend: React.FC<ChartLegendProps> = ({ content }) => {
  return (
    <div className="flex items-center justify-center gap-4 mt-4">
      {content}
    </div>
  );
};

interface ChartLegendContentProps {
  config?: ChartConfig;
}

export const ChartLegendContent: React.FC<ChartLegendContentProps> = ({ config }) => {
  if (!config) return null;
  
  return (
    <>
      {Object.entries(config).map(([key, { label, color }]) => (
        <div key={key} className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm">{label}</span>
        </div>
      ))}
    </>
  );
}; 