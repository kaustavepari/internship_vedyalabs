import React from "react";
import LineChart from "../LineChart";
import BarChart from "../BarChart";

interface ChartContainerProps {
  chartType: string;
  data: {
    day: string;
    pedestrians: number;
    twoWheelers: number;
    fourWheelers: number;
    trucks: number;
  }[];
  selectedCategories: string[];
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  chartType,
  data,
  selectedCategories,
}) => {
  if (chartType.startsWith("line")) {
    return (
      <LineChart
        data={data}
        chartType={chartType}
        selectedCategories={selectedCategories}
      />
    );
  }

  return (
    <BarChart
      data={data}
      chartType={chartType}
      selectedCategories={selectedCategories}
    />
  );
};

export default ChartContainer;
