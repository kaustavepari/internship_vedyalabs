import React from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { CustomTooltip } from "../common/CustomTooltip";
import { commonChartProps, xAxisProps, yAxisProps } from "../common/chartProps";

interface TrafficData {
  day: string;
  pedestrians: number;
  twoWheelers: number;
  fourWheelers: number;
  trucks: number;
}

interface LineChartProps {
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

const LineChart: React.FC<LineChartProps> = ({
  data,
  chartType,
  selectedCategories,
}) => {
  const lineType = chartType === "line-monotone" ? "monotone" : "linear";

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={250}>
        <RechartsLineChart {...commonChartProps} data={data}>
          <CartesianGrid stroke="#e3e9f0" vertical={true} horizontal={true} />
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Legend
            iconType="circle"
            iconSize={8}
            align="left"
            wrapperStyle={{ marginTop: 10 }}
          />
          <Tooltip content={<CustomTooltip />} />
          {selectedCategories.map((cat) => (
            <Line
              key={cat}
              type={lineType}
              dataKey={cat}
              name={chartConfig[cat as keyof typeof chartConfig]?.label || cat}
              stroke={
                chartConfig[cat as keyof typeof chartConfig]?.color || "#8884d8"
              }
              dot={false}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
