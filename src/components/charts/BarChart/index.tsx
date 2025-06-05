import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";
import { CustomTooltip } from "../common/CustomTooltip";
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

const BarChart: React.FC<BarChartProps> = ({ data, chartType }) => {
  const barSize = 20;
  const barGap = 0;

  if (chartType === "bar-horizontal") {
    return (
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <RechartsBarChart {...commonChartProps} data={data} layout="vertical" barSize={barSize} barGap={barGap}>
            <CartesianGrid stroke="#e3e9f0" vertical={true} horizontal={true} />
            <XAxis type="number" {...yAxisProps} />
            <YAxis type="category" {...xAxisProps} />
            <Legend iconType="circle" iconSize={8} align="left" wrapperStyle={{ marginTop: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Category1" fill="#8884d8" />
            <Bar dataKey="Category2" fill="#82ca9d" />
            <Bar dataKey="Category3" fill="#ffc658" />
            <Bar dataKey="Category4" fill="#ff8888" />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <RechartsBarChart {...commonChartProps} data={data} barSize={barSize} barGap={barGap}>
          <CartesianGrid stroke="#e3e9f0" vertical={true} horizontal={true} />
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Legend iconType="circle" iconSize={8} align="left" wrapperStyle={{ marginTop: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="Category1" fill="#8884d8" stackId={chartType === "bar-stacked" ? "stack" : undefined} />
          <Bar dataKey="Category2" fill="#82ca9d" stackId={chartType === "bar-stacked" ? "stack" : undefined} />
          <Bar dataKey="Category3" fill="#ffc658" stackId={chartType === "bar-stacked" ? "stack" : undefined} />
          <Bar dataKey="Category4" fill="#ff8888" stackId={chartType === "bar-stacked" ? "stack" : undefined} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart; 