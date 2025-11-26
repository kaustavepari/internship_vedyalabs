import { useState, useEffect, useRef } from "react";
import ChatInterface from "@/components/ChatInterface";
import { useDashboard, type VehicleCategory } from "@/contexts/DashboardContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";

import "./styles.css";
import PeakTimeChart from "../../components/PeakTimeChart";
import TrafficVolumeChart from "../../components/charts/TrafficVolumeChart";
import LoadingSpinner from "../../components/LoadingSpinner";

// Icons
const INCREASE_ICON =
  "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747331119/icons_dc9ugb.png";
const DECREASE_ICON =
  "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747331119/icons_1_ntef5v.png";

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

interface TrafficChartData {
  day: string;
  pedestrians: number;
  twoWheelers: number;
  fourWheelers: number;
  trucks: number;
}

interface PeakTimeChartData {
  name: string;
  value: number;
  originalValue: number;
  peak_hour: number;
  peak_date: string;
}

const CHART_OPTIONS: ChartOption[] = [
  { value: "line-monotone", label: "Line Chart (Monotone)" },
  { value: "line-linear", label: "Line Chart (Linear)" },
  { value: "bar-simple", label: "Bar Chart (Simple)" },
  { value: "bar-stacked", label: "Bar Chart (Stacked)" },
  { value: "bar-horizontal", label: "Bar Chart (Horizontal)" },
];

const TIME_RANGES = [
  { label: "Last 2 days", value: 2 },
  { label: "Last 7 days", value: 7 },
  { label: "Last 15 days", value: 15 },
  { label: "Last 30 days", value: 30 },
  { label: "Custom Range", value: "custom" },
] as const;

type TimeRange = (typeof TIME_RANGES)[number]["value"];

// Default metrics data to show while loading
const DEFAULT_METRICS: MetricData[] = [
  {
    title: "Total Pedestrians",
    value: "0",
    trend: "increase",
    changePercent: 0,
    color: "#e0efff",
    icon: "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747327106/Frame_1171275857_owiu91.png",
  },
  {
    title: "Two-Wheelers",
    value: "0",
    trend: "increase",
    changePercent: 0,
    color: "#e5fff1",
    icon: "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747327086/Frame_1171275856_rigqxv.png",
  },
  {
    title: "Four-Wheelers",
    value: "0",
    trend: "increase",
    changePercent: 0,
    color: "#fff2dc",
    icon: "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747327067/Frame_1171275859_z6wi01.png",
  },
  {
    title: "Trucks",
    value: "0",
    trend: "increase",
    changePercent: 0,
    color: "#ffffe5",
    icon: "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747327039/Frame_1171275858_rf1oym.png",
  },
];

const CATEGORY_OPTIONS: Array<{
  key: VehicleCategory;
  label: string;
  color: string;
}> = [
  { key: "pedestrians", label: "Pedestrians", color: "var(--chart-1)" },
  { key: "twoWheelers", label: "Two-Wheelers", color: "var(--chart-2)" },
  { key: "fourWheelers", label: "Four-Wheelers", color: "var(--chart-3)" },
  { key: "trucks", label: "Trucks", color: "var(--chart-4)" },
];

const Dashboard = () => {
  const { dashboardState } = useDashboard();
  const [selectedRange, setSelectedRange] = useState<TimeRange>(7);
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [metricsData, setMetricsData] = useState<MetricData[]>(DEFAULT_METRICS);
  const [trafficChartData, setTrafficChartData] = useState<TrafficChartData[]>([]);
  const [peakTimeData, setPeakTimeData] = useState<PeakTimeChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "pedestrians",
    "twoWheelers",
    "fourWheelers",
    "trucks",
  ]);

  // Polling state
  const [lastDataTimestamp, setLastDataTimestamp] = useState<string | null>(
    null
  );
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dataCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const PIE_CHARTS = ["pie", "donut", "gauge"]

  // Function to check for new data
  const checkForNewData = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/latest-data-info/"
      );
      const { latest_timestamp, has_data } = response.data;

      if (has_data && latest_timestamp !== lastDataTimestamp) {
        console.log("New data detected, refreshing dashboard...");
        setLastDataTimestamp(latest_timestamp);
        // Refresh all data
        await fetchCardData();
        await fetchTrafficChartData();
        await fetchPeakTimeData();
      }
    } catch (err) {
      console.error("Error checking for new data:", err);
    }
  };

  // Function to start polling
  const startPolling = () => {
    // Check for new data every 30 seconds
    dataCheckIntervalRef.current = setInterval(checkForNewData, 30000);

    // Full refresh every 5 minutes
    pollingIntervalRef.current = setInterval(async () => {
      console.log("Performing full data refresh...");
      await fetchCardData();
      await fetchTrafficChartData();
      await fetchPeakTimeData();
    }, 300000); // 5 minutes
  };

  // Function to stop polling
  const stopPolling = () => {
    if (dataCheckIntervalRef.current) {
      clearInterval(dataCheckIntervalRef.current);
      dataCheckIntervalRef.current = null;
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const fetchCardData = async () => {
    try {
      setLoading(true);
      setError(null);
      setWarning(null);

      let url = `http://127.0.0.1:8000/card-data/`;
      if (selectedRange === "custom") {
        if (!customStartDate || !customEndDate) {
          setWarning("Please select both start and end dates");
          return;
        }
        url += `?start_date=${customStartDate}&end_date=${customEndDate}`;
      } else {
        url += `?period=${selectedRange}`;
      }

      const response = await axios.get(url);

      // Transform the backend response to match MetricData[] format
      const rawData = response.data;
      const transformedMetrics: MetricData[] = [
        {
          title: "Total Pedestrians",
          value: String(rawData.pedestrians.current),
          trend: rawData.pedestrians.percentage >= 0 ? "increase" : "decrease",
          changePercent: Math.round(rawData.pedestrians.percentage),
          color: "#e0efff",
          icon: "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747327106/Frame_1171275857_owiu91.png",
        },
        {
          title: "Two-Wheelers",
          value: String(rawData.twoWheelers.current),
          trend: rawData.twoWheelers.percentage >= 0 ? "increase" : "decrease",
          changePercent: Math.round(rawData.twoWheelers.percentage),
          color: "#e5fff1",
          icon: "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747327086/Frame_1171275856_rigqxv.png",
        },
        {
          title: "Four-Wheelers",
          value: String(rawData.fourWheelers.current),
          trend: rawData.fourWheelers.percentage >= 0 ? "increase" : "decrease",
          changePercent: Math.round(rawData.fourWheelers.percentage),
          color: "#fff2dc",
          icon: "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747327067/Frame_1171275859_z6wi01.png",
        },
        {
          title: "Trucks",
          value: String(rawData.trucks.current),
          trend: rawData.trucks.percentage >= 0 ? "increase" : "decrease",
          changePercent: Math.round(rawData.trucks.percentage),
          color: "#ffffe5",
          icon: "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747327039/Frame_1171275858_rf1oym.png",
        },
      ];

      setMetricsData(transformedMetrics);
    } catch (err) {
      setError("Failed to fetch metrics data");
      console.error("Error fetching card data:", err);
      setMetricsData(DEFAULT_METRICS);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrafficChartData = async () => {
    try {
      let url = `http://127.0.0.1:8000/traffic-volume-data/`;
      if (selectedRange === "custom") {
        if (!customStartDate || !customEndDate) {
          setWarning("Please select both start and end dates");
          return;
        }
        url += `?start_date=${customStartDate}&end_date=${customEndDate}`;
      } else {
        url += `?period=${selectedRange}`;
      }

      const response = await axios.get(url);
      if (response.data?.data) {
        const transformedData = response.data.data.map((item: any) => ({
          day: item.day,
          pedestrians: item.pedestrians,
          twoWheelers: item.twoWheelers,
          fourWheelers: item.fourWheelers,
          trucks: item.trucks,
        }));
        setTrafficChartData(transformedData);
      } else {
        console.error("Invalid traffic chart data format received from server");
        setTrafficChartData([]);
      }
    } catch (err) {
      console.error("Error fetching traffic chart data:", err);
      setTrafficChartData([]);
    }
  };

  const fetchPeakTimeData = async () => {
    try {
      let url = `http://127.0.0.1:8000/peak-time-data/`;
      if (selectedRange === "custom") {
        if (!customStartDate || !customEndDate) {
          setWarning("Please select both start and end dates");
          return;
        }
        url += `?start_date=${customStartDate}&end_date=${customEndDate}`;
      } else {
        url += `?period=${selectedRange}`;
      }

      const response = await axios.get(url);
      if (response.data?.data) {
        // Use the actual peak values directly from backend (no percentage calculation needed)
        const processedData = response.data.data.map(
          (item: PeakTimeChartData) => ({
            ...item,
            value: item.value, // Keep the actual peak value as is
          })
        );
        setPeakTimeData(processedData);
      } else {
        console.error("Invalid peak time data format received from server");
        setPeakTimeData([]);
      }
    } catch (err) {
      console.error("Error fetching peak time data:", err);
      setPeakTimeData([]);
    }
  };

  useEffect(() => {
    // Initial data fetch
    fetchCardData();
    fetchTrafficChartData();
    fetchPeakTimeData();

    // Start polling after initial load
    startPolling();

    // Cleanup function
    return () => {
      stopPolling();
    };
  }, [selectedRange, customStartDate, customEndDate]);

  const handleRangeChange = (value: string) => {
    if (value === "custom") {
      setSelectedRange("custom");
    } else {
      const numValue = Number(value);
      if (
        numValue === 2 ||
        numValue === 7 ||
        numValue === 15 ||
        numValue === 30
      ) {
        setSelectedRange(numValue as TimeRange);
      }
    }
  };

  // Filter trafficChartData to only include selected categories
  const filteredTrafficChartData = trafficChartData.map((item) => {
    const filtered: any = { day: item.day };
    selectedCategories.forEach((cat) => {
      filtered[cat] = item[cat as keyof typeof item];
    });
    return filtered;
  });

  return (
    <div className="dashboard-body">
      <div className="header">
        <h2>Overview</h2>

        <Select
          value={selectedRange.toString()}
          onValueChange={handleRangeChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            {TIME_RANGES.map((range) => (
              <SelectItem key={range.value} value={range.value.toString()}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedRange === "custom" && (
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.9rem" }}>Start Date: </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                style={{
                  padding: "0.3rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.9rem" }}>End Date: </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                style={{
                  padding: "0.3rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      {warning && <div className="warning-message">{warning}</div>}

      <div className="metrics">
        {metricsData.map((item) => (
          <div
            key={item.title}
            className="card"
            style={{ background: item.color }}
          >
            <img
              src={item.icon}
              alt={item.title}
              style={{ width: "40px", height: "40px" }}
            />
            <p className="metrics-title">{item.title}</p>
            {loading ? (
              <div className="card-loading">
                <LoadingSpinner size="small" color="#64748b" />
              </div>
            ) : (
              <>
                <h2 className="metrics-value">{item.value}</h2>
                <p className="metrics-change">
                  <img
                    src={
                      item.trend === "increase" ? INCREASE_ICON : DECREASE_ICON
                    }
                    alt={item.trend}
                    style={{
                      width: "12px",
                      height: "12px",
                      marginRight: "6px",
                      verticalAlign: "middle",
                    }}
                  />
                  {`${item.changePercent}% ${item.trend} from last ${selectedRange} days`}
                </p>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="charts-container">
  {dashboardState.charts.map((chart) => {
    const isPeakTimeChart = PIE_CHARTS.includes(chart.type);

    return isPeakTimeChart ? (
      <PeakTimeChart 
        key={chart.title}
        data={peakTimeData}
        chartType={chart.type}
      />
    ) : (
      <TrafficVolumeChart
        key={chart.title}
        chart={chart}
        filteredTrafficChartData={filteredTrafficChartData}
        initialSelectedCategories={chart.category}
        onCategoryToggle={(category) => {
          setSelectedCategories((prev) =>
            prev.includes(category)
              ? prev.filter((c) => c !== category)
              : [...prev, category]
          );
        }}
        categoryOptions={CATEGORY_OPTIONS}
      />
    );
  })}
</div>
      <hr />
      <ChatInterface />
    </div>
  );
};

export default Dashboard;
