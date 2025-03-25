import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import MissionPlanning from "../pages/MissionPlanning.jsx";
import FleetManagement from "../pages/FleetManagement.jsx";
import MissionMonitoring from "../pages/MissionMonitoring.jsx";
import Reports from "../pages/Reports.jsx";
import { Menu } from "lucide-react";
import Chatbot from "../components/Chatbot.jsx";

const AppRouter = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <Router>
      <div className="flex h-screen bg-gray-900">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center">
            <button
              onClick={toggleSidebar}
              className="text-gray-400 hover:text-white mr-4"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-blue-400">
              Drone Command System
            </h1>
          </div>
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/mission-planning" element={<MissionPlanning />} />
              <Route path="/fleet-management" element={<FleetManagement />} />
              <Route
                path="/mission-monitoring"
                element={<MissionMonitoring />}
              />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </main>
        </div>
        <Chatbot />
      </div>
    </Router>
  );
};

export default AppRouter;
