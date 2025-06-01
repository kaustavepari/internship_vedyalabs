import React, { useState, useRef, useEffect, useLayoutEffect} from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import './styles.css'; 

// Time mappings for each category
const hoveredLabelToTime = {
  'Pedestrians': '08:00',
  'Two-Wheelers': '10:30',
  'Four-Wheelers': '15:20',
  'Trucks': '17:45'
};

// Data processing
const processPeakTimeData = (data) => {
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

// Gauge chart
const PeakTimeGauge = ({ hoveredCategory, setHoveredCategory }) => (
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

// Main chart component


const PeakTimeChart = () => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const gaugeRef = useRef(null);

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
  // You can tweak this as needed
  const r = Math.min(size.width, size.height) / 2 + 5;

  return (
    <div className="peak-time-chart">
      <h3>Peak Time</h3>

      <div className="gauge-container" ref={gaugeRef} style={{ position: 'relative' }}>
        <PeakTimeGauge 
          hoveredCategory={hoveredCategory} 
          setHoveredCategory={setHoveredCategory} 
        />

        {/* Numbers positioned relative to dynamic center and radius */}
        {Array.from({ length: 5 }).map((_, i) => {
          const value = i * 25;
          const angle = (36 * i) * (Math.PI / 180) + 60; // same as your original

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
                pointerEvents: 'none', // so they don’t interfere with mouse events
              }}
            >
              {value}
            </p>
          );
        })}
      </div>

      {/* Legend remains unchanged */}
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
