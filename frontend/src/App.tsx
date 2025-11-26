import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Header from "./components/Header/Header";
import { DashboardProvider } from "./contexts/DashboardContext";

const App: React.FC = () => {
  return (
    <DashboardProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          {/* Add more routes as needed */}
        </Routes>
      </BrowserRouter>
    </DashboardProvider>
  );
}

export default App;