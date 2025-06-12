import React from "react";
import "./CustomTooltip.css";

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

export const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((entry, index) => (
          <p
            key={`item-${index}`}
            className="tooltip-item"
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