import React , { useState , useEffect } from "react";
import ChartContainer from "../ChartContainer";

interface CategoryOption {
  key: string;
  label: string;
  color: string;
}

interface TrafficVolumeChartProps {
  chart: {
    type: string;
    title: string;
    category: string[];
  };
  filteredTrafficChartData: any[];
  initialSelectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  categoryOptions: CategoryOption[];
}

const TrafficVolumeChart: React.FC<TrafficVolumeChartProps> = ({
  chart,
  filteredTrafficChartData,
  initialSelectedCategories,
  categoryOptions,
}) => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>(initialSelectedCategories);
    console.log("The initial categories receivied by the bar and line charts are :",initialSelectedCategories)
    
    useEffect(() => {
      setSelectedCategories(initialSelectedCategories);
    }, [initialSelectedCategories]);
    
    const handleCategoryToggle = (category: string) => {
      setSelectedCategories(prev => 
        prev.includes(category)
          ? prev.filter(c => c !== category)
          : [...prev, category]
      );
    };
  return (
    <div
      className={`traffic-volume ${
        chart.type === "bar-horizontal" ? "h-[515px]" : "h-[380px]"
      }`}
    >
      <div className="traffic-volume-header">
        <h3>{chart.title}</h3>
      </div>
      
      {/* Category Selector */}
      <div className="checkbox-group">
        {categoryOptions.map((cat) => (
          <label key={cat.key} className="checkbox-label">
            <span
              className={`custom-checkbox${
                selectedCategories.includes(cat.key) ? " checked" : ""
              }`}
              style={{
                ["--checkbox-color" as any]: cat.color,
              }}
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.key)}
                onChange={() => handleCategoryToggle(cat.key)}
                style={{ display: "none" }}
              />
              {selectedCategories.includes(cat.key) && (
                <span className="checkmark">
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 8.5L7 11.5L12 5.5"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </span>
            {cat.label}
          </label>
        ))}
      </div>
      <hr />
      <ChartContainer
        chartType={chart.type}
        data={filteredTrafficChartData}
        selectedCategories={selectedCategories}
      />
    </div>
  );
};

export default TrafficVolumeChart;
