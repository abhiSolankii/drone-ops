import React, { useEffect, useState } from "react";
import apiService from "../services/apiService.js";
import DroneCard from "../components/DroneCard.jsx";
import AddDroneModal from "../components/AddDroneModal.jsx";
import { Pagination } from "antd";

const FleetManagement = () => {
  const { fetchDrones, createDrone, updateDroneStatus, loading, error } =
    apiService();
  const [drones, setDrones] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadDrones = async () => {
      try {
        const data = await fetchDrones();
        setDrones(data);
      } catch (err) {
        console.error("Failed to load drones:", err);
      }
    };
    loadDrones();
  }, []);

  const handleAddDrone = async (newDrone) => {
    try {
      await createDrone(newDrone);
      const updatedDrones = await fetchDrones();
      setDrones(updatedDrones);
    } catch (err) {
      console.error("Failed to add drone:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateDroneStatus(id, status);
      const updatedDrones = await fetchDrones();
      setDrones(updatedDrones);
    } catch (err) {
      console.error("Failed to update drone status:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleDetails = (id) => console.log(`Details for drone ${id}`);

  if (loading)
    return <div className="text-gray-300 text-center">Loading...</div>;
  if (error)
    return <div className="text-red-400 text-center">Error: {error}</div>;

  return (
    <div className="space-y-6 text-white">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-400">Fleet Command</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 transition-colors"
        >
          Deploy New Drone
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drones.map((drone) => (
          <DroneCard
            key={drone._id}
            drone={drone}
            handleStatusChange={handleStatusChange}
            onDetails={handleDetails}
          />
        ))}
      </div>
      <AddDroneModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddDrone={handleAddDrone}
      />
      {/* <div className="w-full flex justify-center items-center text-white">
        <div className="bg-gray-800 p-2 rounded-lg">
          <Pagination defaultCurrent={1} total={40} />
        </div>
      </div> */}
    </div>
  );
};

export default FleetManagement;
