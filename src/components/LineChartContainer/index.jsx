import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";
import "./LineChartContainer.css";

const trafficVolume = [
  { day: "Mon", Category1: 20, Category2: 55, Category3: 40, Category4: 25 },
  { day: "Tue", Category1: 50, Category2: 35, Category3: 70, Category4: 30 },
  { day: "Wed", Category1: 35, Category2: 70, Category3: 30, Category4: 60 },
  { day: "Thu", Category1: 75, Category2: 45, Category3: 65, Category4: 20 },
  { day: "Fri", Category1: 40, Category2: 80, Category3: 50, Category4: 55 },
  { day: "Sat", Category1: 85, Category2: 30, Category3: 75, Category4: 35 },
  { day: "Sun", Category1: 55, Category2: 90, Category3: 45, Category4: 70 },
];

const lineTypes = [
  { value: "monotone", label: "Monotone" },
  { value: "linear", label: "Linear" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-md">
        <p className="font-medium text-gray-900 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p
            key={`item-${index}`}
            className="text-sm m-0.5"
            style={{ color: entry.color }}
          >
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const LineChartContainer = () => {
  const [selectedType, setSelectedType] = useState("monotone");

  return (
    <div className="relative w-full h-[340px]">
      {/* Type Selector */}
      <div className="absolute top-0 right-0 z-10">
        <select
          className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trafficVolume}>
          <CartesianGrid stroke="#e3e9f0" vertical={true} horizontal={true} />
          <XAxis
            dataKey="day"
            tick={{ fill: "#B8C4CE", fontWeight: 100, fontFamily: "DM Sans" }}
            axisLine={{ stroke: "#B8C4CE", strokeWidth: 1 }}
            tickLine={false}
          />
          <YAxis
            tick={{
              fill: "#B8C4CE",
              fontWeight: 100,
              fontFamily: "DM Sans",
              dx: -10,
            }}
            axisLine={{ stroke: "#B8C4CE", strokeWidth: 1 }}
            tickLine={false}
          />
          <Legend iconType="circle" iconSize={8} align="left" wrapperStyle={{ marginTop: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          <Line type={selectedType} dataKey="Category1" stroke="#8884d8" dot={false} />
          <Line type={selectedType} dataKey="Category2" stroke="#82ca9d" dot={false} />
          <Line type={selectedType} dataKey="Category3" stroke="#ffc658" dot={false} />
          <Line type={selectedType} dataKey="Category4" stroke="#ff8888" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartContainer;
