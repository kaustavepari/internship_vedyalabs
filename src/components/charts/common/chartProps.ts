interface ChartMargin {
  top: number;
  right: number;
  left: number;
  bottom: number;
}

interface AxisProps {
  dataKey?: string;
  tick: {
    fill: string;
    fontWeight: number;
    fontFamily: string;
    dx?: number;
  };
  axisLine: {
    stroke: string;
    strokeWidth: number;
  };
  tickLine: boolean;
}

export const commonChartProps: { margin: ChartMargin } = {
  margin: { top: 20, right: 30, left: 20, bottom: 5 },
};

export const xAxisProps: AxisProps = {
  dataKey: "day",
  tick: { fill: "#B8C4CE", fontWeight: 100, fontFamily: "DM Sans" },
  axisLine: { stroke: "#B8C4CE", strokeWidth: 1 },
  tickLine: false,
};

export const yAxisProps: AxisProps = {
  tick: {
    fill: "#B8C4CE",
    fontWeight: 100,
    fontFamily: "DM Sans",
    dx: -10,
  },
  tickLine: false,
  axisLine: { stroke: "#B8C4CE", strokeWidth: 1 },
}; 