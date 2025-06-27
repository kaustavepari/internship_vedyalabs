import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Sector,
} from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import "./styles.css";

interface PeakTimeData {
  name: string;
  value: number;
  originalValue: number;
  peak_hour: number;
  peak_date: string;
}

// Chart type options
const chartTypes = [
  { value: "gauge", label: "Gauge" },
  { value: "pie", label: "Pie" },
  { value: "donut", label: "Donut" },
];

// Use CSS variables for consistent colors across the project
const PEAK_TIME_COLORS = [
  "var(--chart-1)", // Blue - Pedestrians
  "var(--chart-2)", // Green - Two-Wheelers
  "var(--chart-3)", // Orange - Four-Wheelers
  "var(--chart-4)", // Red - Trucks
];

const DARKER_PEAK_TIME_COLORS = [
  "#2563eb", // Darker blue
  "#059669", // Darker green
  "#d97706", // Darker orange
  "#dc2626", // Darker red
];

const CustomTooltip: React.FC<any> = ({ active, payload, coordinate }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as PeakTimeData;
    const peakHour =
      data.peak_hour !== undefined
        ? String(data.peak_hour).padStart(2, "0") + ":00"
        : "N/A";

    // Calculate radial position to avoid center overlap
    const chartCenter = { x: 200, y: 200 }; // Approximate chart center
    const mousePos = coordinate || { x: 0, y: 0 };

    // Calculate direction from center to mouse
    const dx = mousePos.x - chartCenter.x;
    const dy = mousePos.y - chartCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Normalize direction vector
    const dirX = dx / distance;
    const dirY = dy / distance;

    // Position tooltip radially outward (further from center)
    const tooltipDistance = Math.max(distance + 50, 150); // At least 150px from center
    const tooltipX = chartCenter.x + dirX * tooltipDistance;
    const tooltipY = chartCenter.y + dirY * tooltipDistance;

    return (
      <div
        className="tooltip"
        style={{
          position: "absolute",
          left: tooltipX,
          top: tooltipY,
          transform: "translate(-50%, -50%)",
          zIndex: 1000,
          pointerEvents: "none",
        }}
      >
        <div className="tooltip-label">{data.name}</div>
        <div className="tooltip-time">{`Peak Time: ${peakHour}`}</div>
      </div>
    );
  }
  return null;
};

interface ChartComponentProps {
  data: PeakTimeData[];
  hoveredCategory: string | null;
  setHoveredCategory: (category: string | null) => void;
}

// Gauge Chart
const PeakTimeGauge: React.FC<ChartComponentProps> = ({
  data,
  hoveredCategory,
  setHoveredCategory,
}) => {
  const currentPeakHour = hoveredCategory
    ? data.find((item) => item.name === hoveredCategory)?.peak_hour
    : data.find((item) => item.name === "Pedestrians")?.peak_hour;
  const currentPeakDate = hoveredCategory
    ? data.find((item) => item.name === hoveredCategory)?.peak_date
    : data.find((item) => item.name === "Pedestrians")?.peak_date;

  const displayTime =
    currentPeakHour !== null && currentPeakHour !== undefined
      ? String(currentPeakHour).padStart(2, "0") + ":00"
      : "00:00";
  const displayDate = currentPeakDate || "N/A";

  // Get the color for the hovered category or default to pedestrians
  const getOverlayColor = () => {
    if (hoveredCategory) {
      const categoryIndex = data.findIndex(
        (item) => item.name === hoveredCategory
      );
      return categoryIndex >= 0
        ? PEAK_TIME_COLORS[categoryIndex]
        : PEAK_TIME_COLORS[0];
    }
    return PEAK_TIME_COLORS[0]; // Default to pedestrians color
  };

  return (
    <div className="gauge-container">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            startAngle={180}
            endAngle={0}
            innerRadius={140}
            outerRadius={170}
            cornerRadius={6}
            dataKey="value"
            labelLine={false}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            {data.map((entry, index) => {
              const isHovered = entry.name === hoveredCategory;
              const color = isHovered
                ? DARKER_PEAK_TIME_COLORS[index]
                : PEAK_TIME_COLORS[index];
              return (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={color}
                  onMouseEnter={() => setHoveredCategory(entry.name)}
                />
              );
            })}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="gauge-overlay">
        <div className="gauge-time" style={{ color: getOverlayColor() }}>
          {displayTime}
        </div>
        <div
          className="gauge-date"
          style={{ fontSize: "12px", marginTop: "4px" }}
        >
          {displayDate}
        </div>
        <div className="gauge-label">
          {hoveredCategory
            ? `${hoveredCategory} Peak Value`
            : "Pedestrians Peak Value"}
        </div>
      </div>
    </div>
  );
};

// Pie Chart
const PeakTimePie: React.FC<ChartComponentProps> = ({
  data,
  hoveredCategory,
  setHoveredCategory,
}) => {
  return (
    <div className="gauge-container">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            innerRadius={0}
            outerRadius={170}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            {data.map((entry, index) => {
              const isHovered = entry.name === hoveredCategory;
              const color = isHovered
                ? DARKER_PEAK_TIME_COLORS[index]
                : PEAK_TIME_COLORS[index];
              return (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={color}
                  onMouseEnter={() => setHoveredCategory(entry.name)}
                />
              );
            })}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Donut Chart
const PeakTimeDonut: React.FC<ChartComponentProps> = ({
  data,
  hoveredCategory,
  setHoveredCategory,
}) => {
  const currentPeakHour = hoveredCategory
    ? data.find((item) => item.name === hoveredCategory)?.peak_hour
    : data.find((item) => item.name === "Pedestrians")?.peak_hour;
  const currentPeakDate = hoveredCategory
    ? data.find((item) => item.name === hoveredCategory)?.peak_date
    : data.find((item) => item.name === "Pedestrians")?.peak_date;

  const displayTime =
    currentPeakHour !== null && currentPeakHour !== undefined
      ? String(currentPeakHour).padStart(2, "0") + ":00"
      : "00:00";
  const displayDate = currentPeakDate || "N/A";

  // Get the color for the hovered category or default to pedestrians
  const getOverlayColor = () => {
    if (hoveredCategory) {
      const categoryIndex = data.findIndex(
        (item) => item.name === hoveredCategory
      );
      return categoryIndex >= 0
        ? PEAK_TIME_COLORS[categoryIndex]
        : PEAK_TIME_COLORS[0];
    }
    return PEAK_TIME_COLORS[0]; // Default to pedestrians color
  };

  return (
    <div className="gauge-container">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            innerRadius={100}
            outerRadius={160}
            dataKey="value"
            labelLine={false}
            onMouseLeave={() => setHoveredCategory(null)}
            activeIndex={data.findIndex(
              (item) => item.name === hoveredCategory
            )}
            activeShape={({
              cx,
              cy,
              innerRadius,
              outerRadius = 160,
              startAngle,
              endAngle,
              fill,
              ...props
            }: PieSectorDataItem) => (
              <Sector
                {...props}
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 10}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                style={{
                  transition: "all 0.3s ease-in-out",
                }}
              />
            )}
          >
            {data.map((entry, index) => {
              const isHovered = entry.name === hoveredCategory;
              const color = isHovered
                ? DARKER_PEAK_TIME_COLORS[index]
                : PEAK_TIME_COLORS[index];
              return (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={color}
                  onMouseEnter={() => setHoveredCategory(entry.name)}
                  style={{
                    transition: "all 0.3s ease-in-out",
                  }}
                />
              );
            })}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div
        className="gauge-overlay"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <div
          className="gauge-time"
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: getOverlayColor(),
          }}
        >
          {displayTime}
        </div>
        <div
          className="gauge-date"
          style={{
            fontSize: "12px",
            marginTop: "4px",
          }}
        >
          {displayDate}
        </div>
        <div
          className="gauge-label"
          style={{ fontSize: "12px", marginTop: "4px" }}
        >
          {hoveredCategory
            ? `${hoveredCategory} Peak Value`
            : "Pedestrians Peak Value"}
        </div>
      </div>
    </div>
  );
};

interface PeakTimeChartProps {
  data: PeakTimeData[];
}

const PeakTimeChart: React.FC<PeakTimeChartProps> = ({ data }) => {
  const [selectedChartType, setSelectedChartType] = useState<string>("gauge");
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const renderChart = () => {
    switch (selectedChartType) {
      case "gauge":
        return (
          <PeakTimeGauge
            data={data}
            hoveredCategory={hoveredCategory}
            setHoveredCategory={setHoveredCategory}
          />
        );
      case "pie":
        return (
          <PeakTimePie
            data={data}
            hoveredCategory={hoveredCategory}
            setHoveredCategory={setHoveredCategory}
          />
        );
      case "donut":
        return (
          <PeakTimeDonut
            data={data}
            hoveredCategory={hoveredCategory}
            setHoveredCategory={setHoveredCategory}
          />
        );
      default:
        return (
          <PeakTimeGauge
            data={data}
            hoveredCategory={hoveredCategory}
            setHoveredCategory={setHoveredCategory}
          />
        );
    }
  };

  return (
    <div className="peak-time-chart" data-chart-type={selectedChartType}>
      <div className="peak-time-chart-header">
        <div className="flex justify-between items-center w-full">
          <h3 className="w-[600px]">Peak Time</h3>
          <Select
            value={selectedChartType}
            onValueChange={setSelectedChartType}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Chart type" />
            </SelectTrigger>
            <SelectContent>
              {chartTypes.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <hr />
      {renderChart()}
      {/* ==================== LEGEND CODE STARTS HERE ==================== */}
      <div className="legend">
        {data.map((item, index) => {
          const isHovered = item.name === hoveredCategory;
          // Use normal colors when nothing is hovered, darker colors when this specific item is hovered
          const color = hoveredCategory
            ? isHovered
              ? DARKER_PEAK_TIME_COLORS[index]
              : "#9CA3AF" // Light grey for non-hovered
            : PEAK_TIME_COLORS[index];

          // Apply opacity to non-hovered items only when something is being hovered
          const opacity = hoveredCategory ? (isHovered ? 1 : 1) : 1; // Keep full opacity, use color instead
          const scale = isHovered ? 1.1 : 1;

          return (
            <div
              key={`legend-${item.name}-${index}`}
              className="legend-item"
              style={{
                opacity,
                transform: `scale(${scale})`,
                transition: "all 0.3s ease-in-out",
              }}
            >
              <h1 style={{ color }}>{item.value.toLocaleString()}</h1>
              <p style={{ color }}>{item.name}</p>
            </div>
          );
        })}
      </div>
      {/* ==================== LEGEND CODE ENDS HERE ==================== */}
    </div>
  );
};

export default PeakTimeChart;
