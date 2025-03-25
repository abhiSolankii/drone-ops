import React, { useState } from "react";

const AddDroneModal = ({ isOpen, onClose, onAddDrone }) => {
  const [formData, setFormData] = useState({
    name: "",
    serialNumber: "",
    batteryLevel: 100,
    maxFlightTime: 30,
    maxSpeed: 15,
    maxAltitude: 120,
    sensors: "camera",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newDrone = {
      name: formData.name || `Drone ${Date.now()}`,
      serialNumber: formData.serialNumber || `SN${Date.now()}`,
      status: "available",
      batteryLevel: Number(formData.batteryLevel),
      location: { type: "Point", coordinates: [78.4867, 17.385] },
      specifications: {
        maxFlightTime: Number(formData.maxFlightTime),
        maxSpeed: Number(formData.maxSpeed),
        maxAltitude: Number(formData.maxAltitude),
        sensors: formData.sensors.split(",").map((s) => s.trim()),
      },
    };
    onAddDrone(newDrone);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-lg p-6 w-full max-w-md shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-blue-400">Add New Drone</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Shadow Wing"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Serial Number
            </label>
            <input
              type="text"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., SN12345"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Battery Level (%)
            </label>
            <input
              type="number"
              name="batteryLevel"
              value={formData.batteryLevel}
              onChange={handleChange}
              min="0"
              max="100"
              className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Max Flight Time (min)
            </label>
            <input
              type="number"
              name="maxFlightTime"
              value={formData.maxFlightTime}
              onChange={handleChange}
              min="1"
              className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Max Speed (m/s)
            </label>
            <input
              type="number"
              name="maxSpeed"
              value={formData.maxSpeed}
              onChange={handleChange}
              min="1"
              className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Max Altitude (m)
            </label>
            <input
              type="number"
              name="maxAltitude"
              value={formData.maxAltitude}
              onChange={handleChange}
              min="1"
              className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Sensors (comma-separated)
            </label>
            <input
              type="text"
              name="sensors"
              value={formData.sensors}
              onChange={handleChange}
              className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., camera, lidar"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
            >
              Add Drone
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDroneModal;
