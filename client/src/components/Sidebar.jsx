import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  Bone as Drone,
  Radio,
  BarChart3,
  X,
  Menu,
} from "lucide-react";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const menuItems = [
    { path: "/", icon: LayoutDashboard, text: "Dashboard" },
    { path: "/mission-planning", icon: MapPin, text: "Mission Planning" },
    { path: "/fleet-management", icon: Drone, text: "Fleet Command" },
    { path: "/mission-monitoring", icon: Radio, text: "Mission Monitoring" },
    { path: "/reports", icon: BarChart3, text: "Reports" },
  ];

  return (
    <div
      className={`bg-gray-900 text-white w-64 space-y-6 py-7 px-2 fixed inset-y-0 left-0 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out z-50`}
    >
      <div className="flex items-center justify-between px-4 mb-8">
        <div className="flex items-center">
          <Drone className="h-8 w-8 text-blue-500" />
          <span className="text-xl font-bold ml-2 text-blue-400">DroneOps</span>
        </div>
        <button
          onClick={toggleSidebar}
          className="text-gray-400 hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-2 py-2.5 px-4 rounded transition duration-200 ${
                isActive
                  ? "bg-blue-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`
            }
            onClick={toggleSidebar}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.text}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
