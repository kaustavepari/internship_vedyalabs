export interface ChartData {
  name: string;
  value: number;
  originalValue: number;
}

export interface ChartProps {
  hoveredCategory: string | null;
  setHoveredCategory: (category: string | null) => void;
  lockedCategory: string | null;
  setLockedCategory: (category: string | null) => void;
  onMouseEnter: (category: string) => void;
  onMouseLeave: () => void;
  onClick: (category: string) => void;
}

export interface TimeMapping {
  [key: string]: string;
}

export interface ChartType {
  value: string;
  label: string;
}

export interface ChartColors {
  primary: string[];
  darker: string[];
} 