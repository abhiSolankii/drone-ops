import React, { useEffect, useState } from "react";
import apiService from "../services/apiService.js";
import {
  Activity,
  Battery,
  MapPin,
  AlertTriangle,
  Plane,
  Map,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

const Dashboard = () => {
  const {
    fetchDrones,
    fetchMissions,
    fetchMissionStats,
    fetchDroneStats,
    loading,
    error,
  } = apiService();
  const [drones, setDrones] = useState([]);
  const [missions, setMissions] = useState([]);
  const [missionStats, setMissionStats] = useState([]);
  const [droneStats, setDroneStats] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [droneData, missionData, missionStatsData, droneStatsData] =
          await Promise.all([
            fetchDrones(),
            fetchMissions(),
            fetchMissionStats(),
            fetchDroneStats(),
          ]);
        setDrones(droneData);
        setMissions(missionData);
        setMissionStats(missionStatsData);
        setDroneStats(droneStatsData);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        toast.error(`Failed to load dashboard data: ${err.message}`, {
          style: { background: "#1f2937", color: "#fff" },
        });
      }
    };
    loadData();
  }, []);

  // Calculate totals for stats cards
  const totalDrones = droneStats.reduce((sum, stat) => sum + stat.count, 0);
  const availableDrones =
    droneStats.find((stat) => stat._id === "available")?.count || 0;
  const totalMissions = missionStats.reduce((sum, stat) => sum + stat.count, 0);
  const inProgressMissions =
    missionStats.find((stat) => stat._id === "in-progress")?.count || 0;

  const stats = [
    {
      title: "Active Missions",
      value: inProgressMissions,
      icon: Activity,
      color: "bg-blue-500",
    },
    {
      title: "Fleet Status",
      value: `${availableDrones}/${totalDrones}`,
      icon: Battery,
      color: "bg-green-500",
    },
    {
      title: "Survey Sites",
      value: totalMissions,
      icon: MapPin,
      color: "bg-purple-500",
    },
    {
      title: "Alerts",
      value: drones.filter((d) => d.batteryLevel < 25).length,
      icon: AlertTriangle,
      color: "bg-red-500",
    },
  ];

  if (loading)
    return <div className="text-gray-300 text-center">Loading...</div>;
  if (error)
    return <div className="text-red-400 text-center">Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm">{stat.title}</h3>
                <p className="text-2xl font-semibold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mission Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Map className="mr-2 text-blue-500" size={20} />
          Mission Statistics
        </h2>
        {missionStats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-600">Total Missions: {totalMissions}</p>
              {missionStats.map((stat) => (
                <p key={stat._id} className="text-gray-600">
                  {stat._id.charAt(0).toUpperCase() + stat._id.slice(1)}:{" "}
                  {stat.count}
                </p>
              ))}
            </div>
            <div>
              {missionStats.map((stat) => (
                <p key={stat._id} className="text-gray-600">
                  Avg Progress ({stat._id}): {stat.avgProgress.toFixed(2)}%
                </p>
              ))}
            </div>
            <div>
              {missionStats.map((stat) => (
                <p key={stat._id} className="text-gray-600">
                  Avg ETA ({stat._id}): {stat.avgETA.toFixed(2)} minutes
                </p>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No mission statistics available.</p>
        )}
      </div>

      {/* Drone Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Plane className="mr-2 text-green-500" size={20} />
          Drone Statistics
        </h2>
        {droneStats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-600">Total Drones: {totalDrones}</p>
              {droneStats.map((stat) => (
                <p key={stat._id} className="text-gray-600">
                  {stat._id.charAt(0).toUpperCase() + stat._id.slice(1)}:{" "}
                  {stat.count}
                </p>
              ))}
            </div>
            <div>
              {droneStats.map((stat) => (
                <p key={stat._id} className="text-gray-600">
                  Avg Battery ({stat._id}): {stat.avgBattery.toFixed(2)}%
                </p>
              ))}
            </div>
            <div>
              {droneStats.map((stat) => (
                <p key={stat._id} className="text-gray-600">
                  Recent Updates ({stat._id}):{" "}
                  {new Date(stat.recentUpdates).toLocaleString()}
                </p>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No drone statistics available.</p>
        )}
      </div>

      {/* Active Missions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Activity className="mr-2 text-blue-500" size={20} />
          Active Missions
        </h2>
        {missions.filter((m) => m.status === "in-progress").length > 0 ? (
          <div className="space-y-4">
            {missions
              .filter((m) => m.status === "in-progress")
              .map((mission) => (
                <div key={mission._id} className="border-b pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-md font-medium">{mission.name}</h3>
                      <p className="text-sm text-gray-500">
                        Start:{" "}
                        {new Date(mission.schedule.startTime).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Progress: {mission.progress}%
                      </p>
                      <p className="text-sm text-gray-500">
                        Assigned Drone: {mission.assignedDrone?.name || "None"}
                      </p>
                    </div>
                    <div className="w-1/4 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${mission.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-gray-500">No active missions.</p>
        )}
      </div>

      {/* Drone Fleet */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Plane className="mr-2 text-green-500" size={20} />
          Drone Fleet
        </h2>
        {drones.length > 0 ? (
          <div className="space-y-4">
            {drones.map((drone) => (
              <div key={drone._id} className="border-b pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-md font-medium">{drone.name}</h3>
                    <p className="text-sm text-gray-500">
                      Status: {drone.status}
                    </p>
                    <p className="text-sm text-gray-500">
                      Battery: {drone.batteryLevel}%
                    </p>
                    <p className="text-sm text-gray-500">
                      Location:{" "}
                      {drone.location?.coordinates?.join(", ") || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Last Seen: {new Date(drone.lastSeen).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-1/4 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        drone.batteryLevel < 25 ? "bg-red-600" : "bg-green-600"
                      }`}
                      style={{ width: `${drone.batteryLevel}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No drones available.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
