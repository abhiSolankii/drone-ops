import React, { useState } from "react";
import {
  Edit,
  Save,
  X,
  Play,
  Pause,
  StopCircle,
  Trash2,
  Map,
  Clock,
  Settings,
  Navigation,
} from "lucide-react";
import toast from "react-hot-toast";

const MissionDetails = ({ mission, onUpdate, onControl, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: mission.name,
    parameters: { ...mission.parameters },
    schedule: { ...mission.schedule },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes("parameters.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        parameters: {
          ...prev.parameters,
          [field]: type === "number" ? Number(value) : value,
        },
      }));
    } else if (name.includes("schedule.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          [field]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate form data based on schema
      if (!formData.name || typeof formData.name !== "string") {
        throw new Error("Name is required and must be a string");
      }
      if (
        !formData.parameters.altitude ||
        formData.parameters.altitude <= 0 ||
        typeof formData.parameters.altitude !== "number"
      ) {
        throw new Error("Altitude must be a positive number");
      }
      if (
        !formData.parameters.speed ||
        formData.parameters.speed <= 0 ||
        typeof formData.parameters.speed !== "number"
      ) {
        throw new Error("Speed must be a positive number");
      }
      if (
        !formData.parameters.overlap ||
        formData.parameters.overlap < 0 ||
        formData.parameters.overlap > 100 ||
        typeof formData.parameters.overlap !== "number"
      ) {
        throw new Error("Overlap must be between 0 and 100");
      }
      if (
        !formData.parameters.pattern ||
        !["crosshatch", "parallel", "perimeter"].includes(
          formData.parameters.pattern
        )
      ) {
        throw new Error(
          "Pattern must be one of: crosshatch, parallel, perimeter"
        );
      }
      if (!formData.schedule.startTime) {
        throw new Error("Start time is required");
      }
      const startTimeDate = new Date(formData.schedule.startTime);
      if (isNaN(startTimeDate.getTime())) {
        throw new Error("Invalid start time format");
      }
      if (formData.schedule.isRecurring && !formData.schedule.frequency) {
        throw new Error("Frequency is required for recurring missions");
      }
      if (
        formData.schedule.isRecurring &&
        !["daily", "weekly", "monthly"].includes(formData.schedule.frequency)
      ) {
        throw new Error("Frequency must be one of: daily, weekly, monthly");
      }

      await onUpdate({
        name: formData.name,
        parameters: formData.parameters,
        schedule: formData.schedule,
      });
      setIsEditing(false);
      toast.success("Mission updated successfully");
    } catch (error) {
      toast.error(`Failed to update mission: ${error.message}`);
    }
  };

  const renderMissionActions = () => {
    const actionMap = {
      "in-progress": [
        {
          icon: <Pause />,
          label: "Pause",
          action: () => onControl(mission._id, "pause"),
        },
        {
          icon: <StopCircle />,
          label: "Abort",
          action: () => onControl(mission._id, "abort"),
          className: "text-red-500 hover:bg-red-50",
        },
      ],
      paused: [
        {
          icon: <Play />,
          label: "Resume",
          action: () => onControl(mission._id, "resume"),
        },
        {
          icon: <StopCircle />,
          label: "Abort",
          action: () => onControl(mission._id, "abort"),
          className: "text-red-500 hover:bg-red-50",
        },
      ],
    };

    return (
      <div className="flex space-x-2">
        {actionMap[mission.status]?.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`
              p-2 rounded-full hover:bg-gray-100 
              transition-colors duration-300
              ${action.className || ""}
            `}
          >
            {action.icon}
            <span className="sr-only">{action.label}</span>
          </button>
        ))}
        {isEditing ? (
          <>
            <button
              onClick={handleSubmit}
              className="p-2 rounded-full text-green-500 hover:bg-green-50"
            >
              <Save />
              <span className="sr-only">Save</span>
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-50"
            >
              <X />
              <span className="sr-only">Cancel</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 rounded-full text-blue-500 hover:bg-blue-50"
          >
            <Edit />
            <span className="sr-only">Edit</span>
          </button>
        )}
        <button
          onClick={() => onDelete(mission._id)}
          className="p-2 rounded-full text-red-500 hover:bg-red-50"
        >
          <Trash2 />
          <span className="sr-only">Delete</span>
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white shadow-xl rounded-xl p-6 space-y-6">
      <div className="flex justify-between items-center">
        {isEditing ? (
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="text-2xl font-bold text-gray-800 border-b border-gray-300 focus:outline-none focus:border-blue-500"
          />
        ) : (
          <h2 className="text-2xl font-bold text-gray-800">{mission.name}</h2>
        )}
        <div className="flex items-center space-x-2">
          <span
            className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${
                mission.status === "in-progress"
                  ? "bg-green-100 text-green-800"
                  : mission.status === "paused"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }
            `}
          >
            {mission.status}
          </span>
          {renderMissionActions()}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <h3 className="flex items-center font-semibold text-gray-600">
            <Navigation className="mr-2 text-blue-500" size={18} />
            Mission Parameters
          </h3>
          {isEditing ? (
            <>
              <p>
                Altitude:{" "}
                <input
                  name="parameters.altitude"
                  value={formData.parameters.altitude}
                  onChange={handleChange}
                  type="number"
                  className="border-b border-gray-300 focus:outline-none focus:border-blue-500"
                />
                m
              </p>
              <p>
                Speed:{" "}
                <input
                  name="parameters.speed"
                  value={formData.parameters.speed}
                  onChange={handleChange}
                  type="number"
                  className="border-b border-gray-300 focus:outline-none focus:border-blue-500"
                />
                m/s
              </p>
              <p>
                Overlap:{" "}
                <input
                  name="parameters.overlap"
                  value={formData.parameters.overlap}
                  onChange={handleChange}
                  type="number"
                  className="border-b border-gray-300 focus:outline-none focus:border-blue-500"
                />
                %
              </p>
              <p>
                Pattern:{" "}
                <select
                  name="parameters.pattern"
                  value={formData.parameters.pattern}
                  onChange={handleChange}
                  className="border-b border-gray-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="crosshatch">Crosshatch</option>
                  <option value="parallel">Parallel</option>
                  <option value="perimeter">Perimeter</option>
                </select>
              </p>
            </>
          ) : (
            <>
              <p>Altitude: {mission.parameters.altitude}m</p>
              <p>Speed: {mission.parameters.speed}m/s</p>
              <p>Overlap: {mission.parameters.overlap}%</p>
              <p>Pattern: {mission.parameters.pattern}</p>
            </>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="flex items-center font-semibold text-gray-600">
            <Clock className="mr-2 text-purple-500" size={18} />
            Schedule
          </h3>
          {isEditing ? (
            <>
              <p>
                Start:{" "}
                <input
                  name="schedule.startTime"
                  value={formData.schedule.startTime}
                  onChange={handleChange}
                  type="datetime-local"
                  className="border-b border-gray-300 focus:outline-none focus:border-blue-500"
                />
              </p>
              <p>
                Recurring:{" "}
                <input
                  name="schedule.isRecurring"
                  type="checkbox"
                  checked={formData.schedule.isRecurring}
                  onChange={handleChange}
                  className="ml-2"
                />
              </p>
              {formData.schedule.isRecurring && (
                <p>
                  Frequency:{" "}
                  <select
                    name="schedule.frequency"
                    value={formData.schedule.frequency}
                    onChange={handleChange}
                    className="border-b border-gray-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </p>
              )}
            </>
          ) : (
            <>
              <p>
                Start: {new Date(mission.schedule.startTime).toLocaleString()}
              </p>
              <p>Recurring: {mission.schedule.isRecurring ? "Yes" : "No"}</p>
              {mission.schedule.isRecurring && (
                <p>Frequency: {mission.schedule.frequency}</p>
              )}
            </>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="flex items-center font-semibold text-gray-600">
            <Map className="mr-2 text-green-500" size={18} />
            Survey Area
          </h3>
          <p>Type: {mission.surveyArea.type}</p>
          <p>Coordinates: {mission.surveyArea.coordinates[0].length} points</p>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
        <div
          className="bg-blue-600 h-2 rounded-full"
          style={{ width: `${mission.progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default MissionDetails;
