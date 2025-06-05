import React, { useState, useRef, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import './styles.css';

interface TimeMapping {
  [key: string]: string;
}

interface PeakTimeData {
  name: string;
  value: number;
  originalValue: number;
}

interface ChartProps {
  hoveredCategory: string | null;
  setHoveredCategory: (category: string | null) => void;
}

// Time mappings for each category
const hoveredLabelToTime: TimeMapping = {
  'Pedestrians': '08:00',
  'Two-Wheelers': '10:30',
  'Four-Wheelers': '15:20',
  'Trucks': '17:45'
};

// Data processing
const processPeakTimeData = (data: { name: string; value: number }[]): PeakTimeData[] => {
  const filteredData = data.filter(item => item.name !== 'Empty');
  const totalValue = filteredData.reduce((sum, item) => sum + item.value, 0);
  return filteredData.map(item => ({
    name: item.name,
    value: parseFloat(((item.value / totalValue) * 100).toFixed(2)),
    originalValue: item.value
  }));
};

// Raw Data
const rawPeakTimeData = [
  { name: 'Pedestrians', value: 95 },
  { name: 'Two-Wheelers', value: 26 },
  { name: 'Four-Wheelers', value: 35 },
  { name: 'Trucks', value: 35 }
];

const peakTimeData = processPeakTimeData(rawPeakTimeData);

// Colors
const PEAK_TIME_COLORS = [
  '#10B981', '#3B82F6', '#F59E0B', '#EF4444'
];

// Darker shades for hover highlight
const DARKER_PEAK_TIME_COLORS = [
  '#0e9e6f', '#276ace', '#d38707', '#c53c3c'
];

// Chart type options
const chartTypes = [
  { value: 'gauge', label: 'Gauge Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'donut', label: 'Donut Chart' }
];

// Custom Tooltip component
const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="tooltip">
        <div className="tooltip-label">{data.name}</div>
        <div className="tooltip-value">{`${data.value.toFixed(1)}%`}</div>
        <div className="tooltip-time">{`Peak Time: ${hoveredLabelToTime[data.name]}`}</div>
      </div>
    );
  }
  return null;
};

// Gauge chart
const PeakTimeGauge: React.FC<ChartProps> = ({ hoveredCategory, setHoveredCategory }) => (
  <div className="gauge-container">
    <ResponsiveContainer>
      <PieChart>
        <Pie
          data={peakTimeData}
          startAngle={180}
          endAngle={0}
          innerRadius={160}
          outerRadius={170}
          paddingAngle={0}
          dataKey="value"
          labelLine={false}
          onMouseLeave={() => setHoveredCategory(null)}
        >
          {peakTimeData.map((entry, index) => {
            const isHovered = entry.name === hoveredCategory;
            const color = isHovered
              ? DARKER_PEAK_TIME_COLORS[index % DARKER_PEAK_TIME_COLORS.length]
              : PEAK_TIME_COLORS[index % PEAK_TIME_COLORS.length];
            return (
              <Cell
                key={`cell-${index}`}
                fill={color}
                onMouseEnter={() => setHoveredCategory(entry.name)}
              />
            );
          })}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>

    {/* Time overlay */}
    <div className="gauge-overlay">
      <div className="gauge-time">
        {hoveredCategory ? hoveredLabelToTime[hoveredCategory] : '13:00'}
      </div>
      <div className="gauge-label">
        {hoveredCategory ? `${hoveredCategory} Peak Time` : 'Peak Time'}
      </div>
    </div>
  </div>
);

// Pie chart
const PeakTimePie: React.FC<ChartProps> = ({ hoveredCategory, setHoveredCategory }) => (
  <div className="gauge-container">
    <ResponsiveContainer>
      <PieChart>
        <Pie
          data={peakTimeData}
          innerRadius={0}
          outerRadius={170}
          paddingAngle={2}
          dataKey="value"
          labelLine={false}
          onMouseLeave={() => setHoveredCategory(null)}
        >
          {peakTimeData.map((entry, index) => {
            const isHovered = entry.name === hoveredCategory;
            const color = isHovered
              ? DARKER_PEAK_TIME_COLORS[index % DARKER_PEAK_TIME_COLORS.length]
              : PEAK_TIME_COLORS[index % PEAK_TIME_COLORS.length];
            return (
              <Cell
                key={`cell-${index}`}
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

// Donut chart
const PeakTimeDonut: React.FC<ChartProps> = ({ hoveredCategory, setHoveredCategory }) => (
  <div className="gauge-container">
    <ResponsiveContainer>
      <PieChart>
        <Pie
          data={peakTimeData}
          innerRadius={80}
          outerRadius={170}
          paddingAngle={2}
          dataKey="value"
          labelLine={false}
          onMouseLeave={() => setHoveredCategory(null)}
        >
          {peakTimeData.map((entry, index) => {
            const isHovered = entry.name === hoveredCategory;
            const color = isHovered
              ? DARKER_PEAK_TIME_COLORS[index % DARKER_PEAK_TIME_COLORS.length]
              : PEAK_TIME_COLORS[index % PEAK_TIME_COLORS.length];
            return (
              <Cell
                key={`cell-${index}`}
                fill={color}
                onMouseEnter={() => setHoveredCategory(entry.name)}
              />
            );
          })}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>

    {/* Time overlay */}
    <div className="gauge-overlay" style={{ 
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      pointerEvents: 'none'
    }}>
      <div className="gauge-time" style={{ fontSize: '24px', fontWeight: 'bold' }}>
        {hoveredCategory ? hoveredLabelToTime[hoveredCategory] : '13:00'}
      </div>
      <div className="gauge-label" style={{ fontSize: '14px', marginTop: '4px' }}>
        {hoveredCategory ? `${hoveredCategory} Peak Time` : 'Peak Time'}
      </div>
    </div>
  </div>
);

const PeakTimeChart: React.FC = () => {
  const [selectedChartType, setSelectedChartType] = useState<string>('gauge');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const gaugeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gaugeRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    observer.observe(gaugeRef.current);

    return () => observer.disconnect();
  }, []);

  // Calculate center dynamically
  const centerX = size.width / 2;
  const centerY = size.height / 2;
  
  // Radius relative to container width or height
  const r = Math.min(size.width, size.height) / 2 + 5;

  const renderChart = () => {
    switch (selectedChartType) {
      case 'gauge':
        return <PeakTimeGauge hoveredCategory={hoveredCategory} setHoveredCategory={setHoveredCategory} />;
      case 'pie':
        return <PeakTimePie hoveredCategory={hoveredCategory} setHoveredCategory={setHoveredCategory} />;
      case 'donut':
        return <PeakTimeDonut hoveredCategory={hoveredCategory} setHoveredCategory={setHoveredCategory} />;
      default:
        return <PeakTimeGauge hoveredCategory={hoveredCategory} setHoveredCategory={setHoveredCategory} />;
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
              {chartTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="gauge-container" ref={gaugeRef} style={{ position: 'relative' }}>
        {renderChart()}

        {/* Numbers positioned relative to dynamic center and radius - only for gauge chart */}
        {selectedChartType === 'gauge' && Array.from({ length: 5 }).map((_, i) => {
          const value = i * 25;
          const angle = (36 * i) * (Math.PI / 180) + 60;

          // x and y relative to center and radius
          const x = centerX + r * Math.cos(angle);
          const y = centerY + r * Math.sin(angle);

          return (
            <p
              key={i}
              style={{
                position: "absolute",
                top: `${y}px`,
                left: `${x}px`,
                transform: "translate(-50%, -50%)",
                color: "black",
                fontSize: "12px",
                fontWeight: "bold",
                margin: 0,
                pointerEvents: 'none',
              }}
            >
              {value}
            </p>
          );
        })}
      </div>

      {/* Legend */}
      <div className="legend">
        {peakTimeData.map((data, index) => {
          const isHovered = data.name === hoveredCategory;
          const color = isHovered
            ? DARKER_PEAK_TIME_COLORS[index % DARKER_PEAK_TIME_COLORS.length]
            : PEAK_TIME_COLORS[index % PEAK_TIME_COLORS.length];
          return (
            <div key={data.name} className="legend-item">
              <h1 style={{ color }}>{data.value.toFixed(1)}%</h1>
              <p style={{ color }}>{data.name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PeakTimeChart; 