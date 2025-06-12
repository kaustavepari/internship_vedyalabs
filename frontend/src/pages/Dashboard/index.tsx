import { useState, useEffect } from "react";
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
import ChartContainer from "../../components/charts/ChartContainer";
import LoadingSpinner from "../../components/LoadingSpinner";

// Icons
const INCREASE_ICON = "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747331119/icons_dc9ugb.png";
const DECREASE_ICON = "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747331119/icons_1_ntef5v.png";

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
  Category1: number;
  Category2: number;
  Category3: number;
  Category4: number;
}

interface PeakTimeChartData {
  name: string;
  value: number;
  originalValue: number;
  peak_hour: number;
}

const CHART_OPTIONS: ChartOption[] = [
  { value: "line-monotone", label: "Line Chart (Monotone)" },
  { value: "line-linear", label: "Line Chart (Linear)" },
  { value: "bar-simple", label: "Bar Chart (Simple)" },
  { value: "bar-stacked", label: "Bar Chart (Stacked)" },
  { value: "bar-horizontal", label: "Bar Chart (Horizontal)" },
];

const TIME_RANGES = [
  {label: "Last 2 days", value: 2},
  { label: "Last 7 days", value: 7 },
  { label: "Last 15 days", value: 15 },
  { label: "Last 30 days", value: 30 }
] as const;

type TimeRange = typeof TIME_RANGES[number]["value"];

// Default metrics data to show while loading
const DEFAULT_METRICS: MetricData[] = [
  {
    title: "Total Pedestrians",
    value: "0",
    trend: "increase",
    changePercent: 0,
    color: "#e0efff",
    icon: "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747327106/Frame_1171275857_owiu91.png"
  },
  {
    title: "Two-Wheelers",
    value: "0",
    trend: "increase",
    changePercent: 0,
    color: "#e5fff1",
    icon: "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747327086/Frame_1171275856_rigqxv.png"
  },
  {
    title: "Four-Wheelers",
    value: "0",
    trend: "increase",
    changePercent: 0,
    color: "#fff2dc",
    icon: "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747327067/Frame_1171275859_z6wi01.png"
  },
  {
    title: "Heavy Vehicles",
    value: "0/100",
    trend: "increase",
    changePercent: 0,
    color: "#ffffe5",
    icon: "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747327039/Frame_1171275858_rf1oym.png"
  }
];

const Dashboard = () => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>(7);
  const [selectedChartType, setSelectedChartType] = useState<string>("line-monotone");
  const [metricsData, setMetricsData] = useState<MetricData[]>(DEFAULT_METRICS);
  const [trafficChartData, setTrafficChartData] = useState<TrafficChartData[]>([]);
  const [peakTimeData, setPeakTimeData] = useState<PeakTimeChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        setLoading(true);
        setError(null);
        setWarning(null);
        const response = await axios.get(`http://127.0.0.1:8000/card-data/?period=${selectedRange}`);
        
        // Transform the backend response to match MetricData[] format
        const rawData = response.data;
        const transformedMetrics: MetricData[] = [
          {
            title: "Total Pedestrians",
            value: String(rawData.pedestrians.current),
            trend: rawData.pedestrians.percentage >= 0 ? "increase" : "decrease",
            changePercent: Math.round(rawData.pedestrians.percentage),
            color: "#e0efff",
            icon: "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747327106/Frame_1171275857_owiu91.png"
          },
          {
            title: "Two-Wheelers",
            value: String(rawData.two_wheelers.current),
            trend: rawData.two_wheelers.percentage >= 0 ? "increase" : "decrease",
            changePercent: Math.round(rawData.two_wheelers.percentage),
            color: "#e5fff1",
            icon: "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747327086/Frame_1171275856_rigqxv.png"
          },
          {
            title: "Four-Wheelers",
            value: String(rawData.four_wheelers.current),
            trend: rawData.four_wheelers.percentage >= 0 ? "increase" : "decrease",
            changePercent: Math.round(rawData.four_wheelers.percentage),
            color: "#fff2dc",
            icon: "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747327067/Frame_1171275859_z6wi01.png"
          },
          {
            title: "Heavy Vehicles",
            value: `${rawData.heavy_vehicles.current}/100`,
            trend: rawData.heavy_vehicles.percentage >= 0 ? "increase" : "decrease",
            changePercent: Math.round(rawData.heavy_vehicles.percentage),
            color: "#ffffe5",
            icon: "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747327039/Frame_1171275858_rf1oym.png"
          }
        ];

        setMetricsData(transformedMetrics);

      } catch (err) {
        setError('Failed to fetch metrics data');
        console.error('Error fetching card data:', err);
        setMetricsData(DEFAULT_METRICS);
      } finally {
        setLoading(false);
      }
    };

    const fetchTrafficChartData = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/traffic-volume-data/?period=${selectedRange}`);
        if (response.data?.data) {
          setTrafficChartData(response.data.data);
        } else {
          console.error('Invalid traffic chart data format received from server');
          setTrafficChartData([]);
        }
      } catch (err) {
        console.error('Error fetching traffic chart data:', err);
        setTrafficChartData([]);
      }
    };

    const fetchPeakTimeData = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/peak-time-data/?period=${selectedRange}`);
        if (response.data?.data) {
          const total = response.data.data.reduce((sum: number, item: PeakTimeChartData) => sum + item.value, 0);
          const processedData = response.data.data.map((item: PeakTimeChartData) => ({
            ...item,
            value: parseFloat(((item.value / total) * 100).toFixed(2)) // Calculate percentage here
          }));
          setPeakTimeData(processedData);
        } else {
          console.error('Invalid peak time data format received from server');
          setPeakTimeData([]);
        }
      } catch (err) {
        console.error('Error fetching peak time data:', err);
        setPeakTimeData([]);
      }
    };

    fetchCardData();
    fetchTrafficChartData();
    fetchPeakTimeData();
  }, [selectedRange]);

  const handleRangeChange = (value: string) => {
    const numValue = Number(value);
    if (numValue === 2 || numValue === 7 || numValue === 15 || numValue === 30) {
      setSelectedRange(numValue as TimeRange);
    }
  };

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
      </div>

      {error && <div className="error-message">{error}</div>}
      {warning && <div className="warning-message">{warning}</div>}

      <div className="metrics">
        {metricsData.map((item) => (
          <div key={item.title} className="card" style={{ background: item.color }}>
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
                    src={item.trend === "increase" ? INCREASE_ICON : DECREASE_ICON}
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
        <div className={`traffic-volume ${selectedChartType === "bar-horizontal" ? "h-[515px]" : "h-[380px]"}`}>
          <div className="traffic-volume-header">
            <h3>Traffic Volume</h3>
            <Select value={selectedChartType} onValueChange={setSelectedChartType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                {CHART_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <hr/>
          <ChartContainer chartType={selectedChartType} data={trafficChartData} />
        </div>
        <PeakTimeChart data={peakTimeData} />
      </div>
    </div>
  );
};

export default Dashboard; 