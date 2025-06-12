import React from "react";
import LineChart from "../LineChart";
import BarChart from "../BarChart";

interface TrafficData {
  day: string;
  Category1: number;
  Category2: number;
  Category3: number;
  Category4: number;
}

interface ChartContainerProps {
  chartType: string;
  data: TrafficData[];
}

const trafficVolume: TrafficData[] = [
  { day: "Mon", Category1: 20, Category2: 55, Category3: 40, Category4: 25 },
  { day: "Tue", Category1: 50, Category2: 35, Category3: 70, Category4: 30 },
  { day: "Wed", Category1: 35, Category2: 70, Category3: 30, Category4: 60 },
  { day: "Thu", Category1: 75, Category2: 45, Category3: 65, Category4: 20 },
  { day: "Fri", Category1: 40, Category2: 80, Category3: 50, Category4: 55 },
  { day: "Sat", Category1: 85, Category2: 30, Category3: 75, Category4: 35 },
  { day: "Sun", Category1: 55, Category2: 90, Category3: 45, Category4: 70 },
];

const ChartContainer: React.FC<ChartContainerProps> = ({ chartType, data }) => {
  if (chartType.startsWith("line")) {
    return <LineChart data={data} chartType={chartType} />;
  }
  
  return <BarChart data={data} chartType={chartType} />;
};

export default ChartContainer; 