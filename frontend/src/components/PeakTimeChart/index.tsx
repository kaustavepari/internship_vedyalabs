import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Sector
} from 'recharts';
import { PieSectorDataItem } from 'recharts/types/polar/Pie';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import './styles.css';

interface PeakTimeData {
  name: string;
  value: number;
  originalValue: number;
  peak_hour: number;
}

const PEAK_TIME_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];
const DARKER_PEAK_TIME_COLORS = ['#0e9e6f', '#276ace', '#d38707', '#c53c3c'];

const chartTypes = [
  { value: 'gauge', label: 'Gauge Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'donut', label: 'Donut Chart' }
];

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as PeakTimeData;
    const peakHour = data.peak_hour !== undefined ? String(data.peak_hour).padStart(2, '0') + ':00' : 'N/A';
    return (
      <div className="tooltip">
        <div className="tooltip-label">{data.name}</div>
        <div className="tooltip-value">{`${data.value.toFixed(1)}%`}</div>
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
const PeakTimeGauge: React.FC<ChartComponentProps> = ({ data, hoveredCategory, setHoveredCategory }) => {
  const currentPeakHour = hoveredCategory ? data.find(item => item.name === hoveredCategory)?.peak_hour : null;
  const displayTime = currentPeakHour !== null ? String(currentPeakHour).padStart(2, '0') + ':00' : '13:00';
  
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
            const color = isHovered ? DARKER_PEAK_TIME_COLORS[index] : PEAK_TIME_COLORS[index];
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
      <div className="gauge-time">
          {displayTime}
      </div>
      <div className="gauge-label">
        {hoveredCategory ? `${hoveredCategory} Peak Time` : 'Peak Time'}
      </div>
    </div>
  </div>
);
};

// Pie Chart
const PeakTimePie: React.FC<ChartComponentProps> = ({ data, hoveredCategory, setHoveredCategory }) => {
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
            const color = isHovered ? DARKER_PEAK_TIME_COLORS[index] : PEAK_TIME_COLORS[index];
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
const PeakTimeDonut: React.FC<ChartComponentProps> = ({ data, hoveredCategory, setHoveredCategory }) => {
  const currentPeakHour = hoveredCategory ? data.find(item => item.name === hoveredCategory)?.peak_hour : null;
  const displayTime = currentPeakHour !== null ? String(currentPeakHour).padStart(2, '0') + ':00' : '13:00';

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
            activeIndex={data.findIndex(item => item.name === hoveredCategory)}
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
                transition: 'all 0.3s ease-in-out'
              }}
            />
          )}
        >
            {data.map((entry, index) => {
            const isHovered = entry.name === hoveredCategory;
            const color = isHovered ? DARKER_PEAK_TIME_COLORS[index] : PEAK_TIME_COLORS[index];
            return (
              <Cell
                  key={`cell-${entry.name}`}
                fill={color}
                onMouseEnter={() => setHoveredCategory(entry.name)}
                style={{
                  transition: 'all 0.3s ease-in-out'
                }}
              />
            );
          })}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
    <div className="gauge-overlay" style={{ 
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      pointerEvents: 'none'
    }}>
      <div className="gauge-time" style={{ fontSize: '24px', fontWeight: 'bold' }}>
          {displayTime}
      </div>
      <div className="gauge-label" style={{ fontSize: '12px', marginTop: '4px' }}>
        {hoveredCategory ? `${hoveredCategory} Peak Time` : 'Peak Time'}
      </div>
    </div>
  </div>
);
};

interface PeakTimeChartProps {
  data: PeakTimeData[];
}

const PeakTimeChart: React.FC<PeakTimeChartProps> = ({ data }) => {
  const [selectedChartType, setSelectedChartType] = useState<string>('gauge');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const renderChart = () => {
    switch (selectedChartType) {
      case 'gauge':
        return <PeakTimeGauge data={data} hoveredCategory={hoveredCategory} setHoveredCategory={setHoveredCategory} />;
      case 'pie':
        return <PeakTimePie data={data} hoveredCategory={hoveredCategory} setHoveredCategory={setHoveredCategory} />;
      case 'donut':
        return <PeakTimeDonut data={data} hoveredCategory={hoveredCategory} setHoveredCategory={setHoveredCategory} />;
      default:
        return <PeakTimeGauge data={data} hoveredCategory={hoveredCategory} setHoveredCategory={setHoveredCategory} />;
    }
  };

  return (
    <div className="peak-time-chart" data-chart-type={selectedChartType}>
      <div className="peak-time-chart-header">
        <div className="flex justify-between items-center w-full">
          <h3>Peak Time</h3>
          <Select value={selectedChartType} onValueChange={setSelectedChartType}>
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
      <div className="legend">
        {data.map((item, index) => {
          const isHovered = item.name === hoveredCategory;
          const color = isHovered ? DARKER_PEAK_TIME_COLORS[index] : PEAK_TIME_COLORS[index];
          return (
            <div key={`legend-${item.name}-${index}`} className="legend-item">
              <h1 style={{ color }}>{`${item.value.toFixed(1)}%`}</h1>
              <p style={{ color }}>{item.name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PeakTimeChart;
