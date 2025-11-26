import { createContext, useContext, useState, ReactNode } from 'react';

// Define chart type literals
export type ChartType = 
  | 'pie' 
  | 'donut' 
  | 'gauge'
  | 'bar-simple'
  | 'bar-horizontal'
  | 'bar-stacked'
  | 'line-monotone'
  | 'line-linear';

// Define category literals
export type VehicleCategory = 'pedestrians' | 'twoWheelers' | 'fourWheelers' | 'trucks';

// Define date range literals
export type DateRange = 
  | 'LAST_2_DAYS'
  | 'LAST_7_DAYS'
  | 'LAST_15_DAYS'
  | 'LAST_30_DAYS'
  | 'CUSTOM';

// Chart options interface
export interface ChartOptions {
  smooth_lines: boolean;
  stacked: boolean;
  color_scheme: 'auto';
}

// Chart configuration interface
export interface ChartConfig {
  type: ChartType;
  category: VehicleCategory[];
  title: string;
  options: ChartOptions;
}

// Main dashboard state interface
export interface DashboardState {
  date_range: DateRange;
  charts: ChartConfig[];
}

interface DashboardContextType {
  dashboardState: DashboardState;
  updateDashboardState: (newState: Partial<DashboardState>) => void;
  // Add any additional utility functions here if needed
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    date_range: 'LAST_7_DAYS', // Default date range
    charts: []
  });

  const updateDashboardState = (newState: Partial<DashboardState>) => {
    setDashboardState(prevState => ({
      ...prevState,
      ...newState
    }));
  };

  return (
    <DashboardContext.Provider value={{ dashboardState, updateDashboardState }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

