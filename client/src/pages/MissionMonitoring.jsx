import React, { useState, useEffect, useRef } from "react";
import apiService from "../services/apiService";
import { joinMission, sendDroneUpdate } from "../services/socketService";
import useSocket from "../hooks/useSocket";
import MissionCard from "../components/MissionCard";
import MissionDetails from "../components/MissionDetails";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { fromLonLat } from "ol/proj";
import "ol/ol.css";
import toast from "react-hot-toast";

const MissionMonitoring = () => {
  const { fetchMissions, updateMission, deleteMission, fetchMissionStats } =
    apiService();

  const { dronePosition } = useSocket();
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [missionStats, setMissionStats] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const loadData = async () => {
    try {
      const [missionsData, statsData] = await Promise.all([
        fetchMissions(),
        fetchMissionStats(),
      ]);
      setMissions(missionsData);
      setMissionStats(statsData);
    } catch (error) {
      toast.error("Failed to load mission data");
    }
  };

  useEffect(() => {
    loadData();
    initializeMap();
  }, []);

  const initializeMap = () => {
    mapInstanceRef.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        new VectorLayer({ source: new VectorSource() }),
      ],
      view: new View({
        center: fromLonLat([78.4867, 17.385]),
        zoom: 13,
      }),
    });
  };

  const handleMissionControl = async (missionId, action) => {
    try {
      const mission = missions.find((m) => m._id === missionId);
      const updateData = {
        status:
          action === "pause"
            ? "paused"
            : action === "resume"
            ? "in-progress"
            : "aborted",
      };

      await updateMission(missionId, updateData);
      await loadData();
      toast.success(`Mission ${action}d successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} mission`);
    }
  };

  const handleDeleteMission = async (missionId) => {
    try {
      await deleteMission(missionId);
      await loadData();
      setSelectedMission(null);
      toast.success("Mission deleted successfully");
    } catch (error) {
      toast.error("Failed to delete mission");
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/3 p-6 bg-gray-50 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Mission Control
        </h2>
        {/* 
        {missionStats && (
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-600 mb-2">
              Mission Overview
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>Total Missions: {missionStats.totalMissions}</div>
              <div>In Progress: {missionStats.inProgress}</div>
              <div>Completed: {missionStats.completed}</div>
              <div>Aborted: {missionStats.aborted}</div>
            </div>
          </div>
        )} */}

        <div className="space-y-4">
          {missions.map((mission) => (
            <MissionCard
              key={mission._id}
              mission={mission}
              onSelect={setSelectedMission}
              isSelected={selectedMission?._id === mission._id}
            />
          ))}
        </div>
      </div>

      <div className="w-2/3 flex flex-col">
        <div ref={mapRef} className="h-1/2 bg-gray-200 overflow-clip" />

        {selectedMission && (
          <div className="h-1/2 p-6 overflow-y-auto">
            <MissionDetails
              mission={selectedMission}
              onUpdate={async (updatedMission) => {
                try {
                  await updateMission(selectedMission._id, updatedMission);
                  await loadData();
                  toast.success("Mission updated successfully");
                } catch (error) {
                  toast.error("Failed to update mission");
                }
              }}
              onControl={handleMissionControl}
              onDelete={handleDeleteMission}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MissionMonitoring;
