import React, { useEffect, useRef, useState } from "react";
import apiService from "../services/apiService.js";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { Style, Fill, Stroke } from "ol/style";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Draw from "ol/interaction/Draw";
import { fromLonLat, toLonLat } from "ol/proj";
import "ol/ol.css";
import toast from "react-hot-toast";
import { Info } from "lucide-react";

const MissionPlanning = () => {
  const { createMission, fetchDrones, loading, error } = apiService();
  const [params, setParams] = useState({
    altitude: 100,
    speed: 15,
    overlap: 75,
    pattern: "crosshatch",
  });
  const [schedule, setSchedule] = useState({
    startTime: "2025-03-30T10:00:00Z",
    isRecurring: false,
    frequency: "daily",
  });
  const [drones, setDrones] = useState([]);
  const [selectedDrone, setSelectedDrone] = useState("");
  const mapRef = useRef(null);
  const vectorSourceRef = useRef(null);

  // Use refs to store the latest state values
  const paramsRef = useRef(params);
  const scheduleRef = useRef(schedule);
  const selectedDroneRef = useRef(selectedDrone);

  // Update refs whenever state changes
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  useEffect(() => {
    scheduleRef.current = schedule;
  }, [schedule]);

  useEffect(() => {
    selectedDroneRef.current = selectedDrone;
  }, [selectedDrone]);

  // Load drones
  const loadDrones = async () => {
    try {
      const droneData = await fetchDrones();
      const availableDrones = droneData.filter((d) => d.status === "available");
      setDrones(availableDrones);
      toast.success("Drones loaded successfully", {
        style: { background: "#1f2937", color: "#fff" },
      });
    } catch (err) {
      console.error("Failed to load drones:", err);
      toast.error(`Failed to load drones: ${err.message}`, {
        style: { background: "#1f2937", color: "#fff" },
      });
    }
  };

  // Create mission
  const handleCreateMission = async (coordinates) => {
    try {
      // Ensure coordinates are in the correct format
      if (!Array.isArray(coordinates) || coordinates.length < 3) {
        throw new Error(
          "Invalid coordinates: At least 3 points required for a polygon"
        );
      }

      // Use the latest state values from refs
      const currentParams = paramsRef.current;
      const currentSchedule = scheduleRef.current;
      const currentSelectedDrone = selectedDroneRef.current;

      // Validation for all fields
      if (
        !currentParams.altitude ||
        typeof currentParams.altitude !== "number" ||
        currentParams.altitude <= 0
      ) {
        throw new Error("Altitude must be a positive number");
      }
      if (
        !currentParams.speed ||
        typeof currentParams.speed !== "number" ||
        currentParams.speed <= 0
      ) {
        throw new Error("Speed must be a positive number");
      }
      if (
        !currentParams.overlap ||
        typeof currentParams.overlap !== "number" ||
        currentParams.overlap < 0 ||
        currentParams.overlap > 100
      ) {
        throw new Error("Overlap must be between 0 and 100");
      }
      if (
        !currentParams.pattern ||
        !["crosshatch", "parallel", "perimeter"].includes(currentParams.pattern)
      ) {
        throw new Error(
          "Pattern must be one of: crosshatch, parallel, perimeter"
        );
      }
      if (!currentSchedule.startTime) {
        throw new Error("Start time is required");
      }
      const startTimeDate = new Date(currentSchedule.startTime);
      if (isNaN(startTimeDate.getTime())) {
        throw new Error("Invalid start time format");
      }
      if (currentSchedule.isRecurring && !currentSchedule.frequency) {
        throw new Error("Frequency is required for recurring missions");
      }
      if (
        currentSchedule.isRecurring &&
        !["daily", "weekly", "monthly"].includes(currentSchedule.frequency)
      ) {
        throw new Error("Frequency must be one of: daily, weekly, monthly");
      }
      // Require assignedDrone if drones are available
      if (drones.length > 0 && !currentSelectedDrone) {
        throw new Error("Please select a drone for the mission");
      }
      if (currentSelectedDrone && typeof currentSelectedDrone !== "string") {
        throw new Error("Assigned drone must be a valid ID string");
      }

      const missionData = {
        name: `Survey Area ${Date.now()}`,
        surveyArea: { type: "Polygon", coordinates: [coordinates] },
        parameters: currentParams,
        schedule: {
          startTime: currentSchedule.startTime,
          isRecurring: currentSchedule.isRecurring,
          frequency: currentSchedule.isRecurring
            ? currentSchedule.frequency
            : undefined,
        },
        assignedDrone: currentSelectedDrone || undefined,
      };
      console.log("Mission data being sent:", missionData);
      await createMission(missionData);
      toast.success("Mission created successfully", {
        style: { background: "#1f2937", color: "#fff" },
      });
      vectorSourceRef.current.clear();
    } catch (err) {
      console.error("Failed to create mission:", err);
      toast.error(`Failed to create mission: ${err.message}`, {
        style: { background: "#1f2937", color: "#fff" },
      });
    }
  };

  // Initialize map
  useEffect(() => {
    loadDrones();

    const vectorSource = new VectorSource();
    vectorSourceRef.current = vectorSource;

    const mapInstance = new Map({
      layers: [
        new TileLayer({
          source: new OSM({
            url: "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          }),
        }),
        new VectorLayer({ source: vectorSource }),
      ],
      view: new View({ center: fromLonLat([78.4867, 17.385]), zoom: 13 }),
    });

    // Ensure DOM is ready before setting target
    setTimeout(() => {
      mapInstance.setTarget(mapRef.current);
    }, 1000);

    const draw = new Draw({
      source: vectorSource,
      type: "Polygon",
      style: new Style({
        fill: new Fill({ color: "rgba(255, 255, 255, 0.2)" }),
        stroke: new Stroke({ color: "#3b82f6", width: 2 }),
      }),
    });
    mapInstance.addInteraction(draw);

    draw.on("drawend", (event) => {
      const rawCoordinates = event.target.sketchCoords_[0];
      const coordinates = rawCoordinates.map((coord) => toLonLat(coord));

      // Ensure the polygon is closed (first and last points should match)
      if (
        coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
        coordinates[0][1] !== coordinates[coordinates.length - 1][1]
      ) {
        coordinates.push(coordinates[0]); // Close the polygon
      }
      handleCreateMission(coordinates);
      draw.finishDrawing();
    });

    return () => {
      mapInstance.setTarget(null);
    };
  }, []);

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setParams((prev) => ({
      ...prev,
      [name]: name === "pattern" ? value : Number(value) || value,
    }));
  };

  const handleScheduleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSchedule((prev) => {
      const updatedSchedule = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
      // Ensure frequency is set to a default value when isRecurring is toggled on
      if (name === "isRecurring" && checked && !updatedSchedule.frequency) {
        updatedSchedule.frequency = "daily";
      }
      return updatedSchedule;
    });
  };

  const handleDroneChange = (e) => {
    const droneId = e.target.value;
    setSelectedDrone(droneId);
    const selectedDroneName =
      drones.find((d) => d._id === droneId)?.name || "None";
    toast.info(`Selected drone: ${selectedDroneName}`, {
      style: { background: "#1f2937", color: "#fff" },
    });
  };

  if (loading)
    return <div className="text-gray-300 text-center p-4">Loading...</div>;
  if (error)
    return <div className="text-red-400 text-center p-4">Error: {error}</div>;

  return (
    <div className="flex flex-col md:flex-row h-screen text-white">
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-gray-800 p-4 overflow-y-auto">
        <h2 className="text-xl md:text-2xl font-bold text-blue-400 mb-4">
          Mission Planning
        </h2>

        {/* Parameters */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Altitude (m)
            </label>
            <input
              name="altitude"
              value={params.altitude}
              onChange={handleParamChange}
              type="number"
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Altitude (m)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Speed (m/s)
            </label>
            <input
              name="speed"
              value={params.speed}
              onChange={handleParamChange}
              type="number"
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Speed (m/s)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Overlap (%)
            </label>
            <input
              name="overlap"
              value={params.overlap}
              onChange={handleParamChange}
              type="number"
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Overlap (%)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Pattern
            </label>
            <select
              name="pattern"
              value={params.pattern}
              onChange={handleParamChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="crosshatch">Crosshatch</option>
              <option value="parallel">Parallel</option>
              <option value="perimeter">Perimeter</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Start Time
            </label>
            <input
              name="startTime"
              value={schedule.startTime}
              onChange={handleScheduleChange}
              type="datetime-local"
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              name="isRecurring"
              type="checkbox"
              checked={schedule.isRecurring}
              onChange={handleScheduleChange}
              className="bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-300">
              Recurring
            </label>
          </div>

          {schedule.isRecurring && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Frequency
              </label>
              <select
                name="frequency"
                value={schedule.frequency}
                onChange={handleScheduleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Assign Drone
            </label>
            <select
              value={selectedDrone}
              onChange={handleDroneChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No Drone</option>
              {drones.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Info Messages */}
          <div className="space-y-2 mt-4">
            <div className="flex items-center gap-2 bg-yellow-500 text-black p-2 rounded-lg text-sm">
              <Info size={16} />
              <p>Close the polygon by clicking the first point again on map.</p>
            </div>
            <div className="flex items-center gap-2 bg-yellow-500 text-black p-2 rounded-lg text-sm">
              <Info size={16} />
              <p>Reload the page if map is not visible.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div ref={mapRef} className="flex-1 bg-gray-900 h-[50vh] md:h-auto"></div>
    </div>
  );
};

export default MissionPlanning;
