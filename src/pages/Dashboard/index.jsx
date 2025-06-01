import React, { useState } from "react";

import "./styles.css";
import PeakTimeChart from "../../components/PeakTimeChart";
import LineChartContainer from "../../components/LineChartContainer";

// Icons
const increaseIcon = "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747331119/icons_dc9ugb.png";
const decreaseIcon = "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747331119/icons_1_ntef5v.png";

const baseMetricsData = [
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

const lineTypes = [
  { value: "monotone", label: "Monotone" },
  { value: "linear", label: "Linear" },
];

const Dashboard = () => {
  const [selectedRange, setSelectedRange] = useState("Last 15 days");
  const [selectedType, setSelectedType] = useState("monotone");

  return (
    <div className="dashboard-body">
      <div className="header">
        <h2>Overview</h2>
        <select
          className="duration"
          value={selectedRange}
          onChange={(e) => setSelectedRange(e.target.value)}
        >
          <option>Last 30 days</option>
          <option>Last 15 days</option>
          <option>Last week</option>
        </select>
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
                  verticalAlign: "middle"
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
            <select
              className="type-dropdown"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {lineTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <hr/>
          <LineChartContainer selectedType={selectedType}/>
        </div>
        <PeakTimeChart />
      </div>
    </div>
  );
};

export default Dashboard;