import React from "react";
import { MapPin, Clock, Zap, Target, Navigation } from "lucide-react";

const getStatusBadge = (status) => {
  switch (status) {
    case "in-progress":
      return "bg-green-100 text-green-800";
    case "paused":
      return "bg-yellow-100 text-yellow-800";
    case "planned":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-gray-100 text-gray-800";
    case "aborted":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const MissionCard = ({ mission, onSelect, isSelected }) => {
  const { name, status, progress, assignedDrone, parameters, schedule } =
    mission;

  return (
    <div
      onClick={() => onSelect(mission)}
      className={`
        group cursor-pointer 
        rounded-xl border 
        transition-all duration-300 
        ${
          isSelected
            ? "border-blue-500 bg-blue-50/10 shadow-lg"
            : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/5"
        }
        p-4 space-y-3
      `}
    >
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg text-gray-800 group-hover:text-blue-600">
          {name}
        </h3>
        <span
          className={`
            px-2 py-1 rounded-full text-xs font-medium 
            ${getStatusBadge(status)}
          `}
        >
          {status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <Navigation size={16} className="text-blue-500" />
          <span>Drone: {assignedDrone?.name || "Unassigned"}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Target size={16} className="text-green-500" />
          <span>Progress: {progress}%</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock size={16} className="text-purple-500" />
          <span>{new Date(schedule.startTime).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Zap size={16} className="text-yellow-500" />
          <span>
            {parameters.altitude}m / {parameters.speed}m/s
          </span>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
        <div
          className="bg-blue-600 h-1.5 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default MissionCard;
