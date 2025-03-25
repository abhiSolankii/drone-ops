import React from "react";
import {
  Battery,
  Wifi,
  Hammer,
  AlertTriangle,
  ArrowDownNarrowWide,
  ChevronDown,
} from "lucide-react";

const DroneCard = ({ drone, handleStatusChange, onDetails }) => {
  const getStatusColor = (status) =>
    ({
      available: "bg-green-900 text-green-300",
      "in-mission": "bg-blue-900 text-blue-300",
      maintenance: "bg-yellow-900 text-yellow-300",
      charging: "bg-purple-900 text-purple-300",
    }[status] || "bg-gray-700 text-gray-300");

  const getBatteryIcon = (level) => {
    if (level > 75) return <Battery className="h-5 w-5 text-green-400" />;
    if (level > 25) return <Battery className="h-5 w-5 text-yellow-400" />;
    return <Battery className="h-5 w-5 text-red-400" />;
  };

  return (
    <div className="bg-gray-800 text-white rounded-lg shadow-lg p-6 border border-gray-700 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-blue-300">{drone.name}</h3>
          <p className="text-sm text-gray-400">{drone.serialNumber}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
            drone.status
          )}`}
        >
          {drone.status}
        </span>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getBatteryIcon(drone.batteryLevel)}
            <span className="ml-2 text-gray-300">{drone.batteryLevel}%</span>
          </div>
          <div className="flex items-center">
            <Wifi className="h-5 w-5 text-green-400" />
            <span className="ml-2 text-gray-300">Connected</span>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            Specifications
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              <p className="text-gray-500">Flight Time</p>
              <p>{drone.specifications.maxFlightTime} min</p>
            </div>
            <div>
              <p className="text-gray-500">Speed</p>
              <p>{drone.specifications.maxSpeed} m/s</p>
            </div>
            <div>
              <p className="text-gray-500">Altitude</p>
              <p>{drone.specifications.maxAltitude} m</p>
            </div>
            <div>
              <p className="text-gray-500">Sensors</p>
              <p>{drone.specifications.sensors.join(", ")}</p>
            </div>
          </div>
        </div>
        <div className="flex space-x-2 mt-4">
          <div className="flex items-center bg-yellow-900 text-yellow-300 py-2 px-3 rounded-md hover:bg-yellow-800 focus:ring-2 focus:ring-yellow-500">
            <select
              value={drone.status}
              onChange={(e) => handleStatusChange(drone._id, e.target.value)}
              className="w-full flex items-center justify-center appearance-none"
            >
              {["available", "maintenance", "charging", "in-mission"].map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                    className="bg-gray-800 text-white"
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                )
              )}
            </select>
            <ChevronDown size={30} />
          </div>

          <button
            onClick={() => onDetails(drone._id)}
            className="flex-1 bg-blue-900 text-blue-300 py-2 rounded-md hover:bg-blue-800 flex items-center justify-center"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default DroneCard;
