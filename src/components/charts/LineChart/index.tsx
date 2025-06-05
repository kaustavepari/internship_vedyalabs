import React from "react";
import {
  LineChart as RechartsLineChart,
  Line,
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

interface LineChartProps {
  data: TrafficData[];
  chartType: string;
}

const LineChart: React.FC<LineChartProps> = ({ data, chartType }) => {
  const lineType = chartType === "line-monotone" ? "monotone" : "linear";
  
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLineChart {...commonChartProps} data={data}>
          <CartesianGrid stroke="#e3e9f0" vertical={true} horizontal={true} />
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Legend iconType="circle" iconSize={8} align="left" wrapperStyle={{ marginTop: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          <Line type={lineType} dataKey="Category1" stroke="#8884d8" dot={false} />
          <Line type={lineType} dataKey="Category2" stroke="#82ca9d" dot={false} />
          <Line type={lineType} dataKey="Category3" stroke="#ffc658" dot={false} />
          <Line type={lineType} dataKey="Category4" stroke="#ff8888" dot={false} />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart; 