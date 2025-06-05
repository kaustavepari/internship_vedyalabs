import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import "./styles.css";
import PeakTimeChart from "../../components/PeakTimeChart";
import ChartContainer from "../../components/charts/ChartContainer";


// Icons
const increaseIcon = "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747331119/icons_dc9ugb.png";
const decreaseIcon = "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747331119/icons_1_ntef5v.png";

interface MetricData {
  title: string;
  value: string;
  trend: "increase" | "decrease";
  changePercent: number;
  color: string;
  icon: string;
}

interface ChartOption {
  value: string;
  label: string;
}

const baseMetricsData: MetricData[] = [
  {
    title: "Total Pedestrians",
    value: "53,00989",
    trend: "increase",
    changePercent: 12,
    color: "#e0efff",
    icon: "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747327106/Frame_1171275857_owiu91.png",
  },
  {
    title: "Two-Wheelers",
    value: "95",
    trend: "decrease",
    changePercent: 10,
    color: "#e5fff1",
    icon: "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747327086/Frame_1171275856_rigqxv.png",
  },
  {
    title: "Four-Wheelers",
    value: "1022",
    trend: "increase",
    changePercent: 8,
    color: "#fff2dc",
    icon: "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747327067/Frame_1171275859_z6wi01.png",
  },
  {
    title: "Resources",
    value: "101 /120",
    trend: "increase",
    changePercent: 2,
    color: "#ffffe5",
    icon: "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747327039/Frame_1171275858_rf1oym.png",
  },
];

const chartOptions: ChartOption[] = [
  { value: "line-monotone", label: "Line Chart (Monotone)" },
  { value: "line-linear", label: "Line Chart (Linear)" },
  { value: "bar-simple", label: "Bar Chart (Simple)" },
  { value: "bar-stacked", label: "Bar Chart (Stacked)" },
  { value: "bar-horizontal", label: "Bar Chart (Horizontal)" },
];

const Dashboard: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<string>("Last 15 days");
  const [selectedChartType, setSelectedChartType] = useState<string>("line-monotone");

  return (
    <div className="dashboard-body">
      <div className="header">
        <h2>Overview</h2>
        
        <Select value={selectedRange} onValueChange={setSelectedRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Last 30 days">Last 30 days</SelectItem>
            <SelectItem value="Last 15 days">Last 15 days</SelectItem>
            <SelectItem value="Last week">Last week</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="metrics">
        {baseMetricsData.map((item, i) => (
          <div key={i} className="card" style={{ background: item.color }}>
            <img
              src={item.icon}
              alt={item.title}
              style={{ width: "40px", height: "40px" }}
            />
            <p className="metrics-title">{item.title}</p>
            <h2 className="metrics-value">{item.value}</h2>
            <p className="metrics-change">
              <img
                src={item.trend === "increase" ? increaseIcon : decreaseIcon}
                alt={item.trend}
                style={{
                  width: "12px",
                  height: "12px",
                  marginRight: "6px",
                  verticalAlign: "middle",
                }}
              />
              {`${item.changePercent}% ${item.trend} from ${selectedRange.toLowerCase()}`}
            </p>
          </div>
        ))}
      </div>

      <div className="charts-container">
        <div className="traffic-volume">
          <div className="traffic-volume-header">
            <h3>Traffic Volume</h3>
            <Select value={selectedChartType} onValueChange={setSelectedChartType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                {chartOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <hr/>
          <ChartContainer chartType={selectedChartType} />
        </div>
        <PeakTimeChart />
      </div>
    </div>
  );
};

export default Dashboard; 