import useApiRequest from "../hooks/useApiRequest.js";

//import from env file using import.meta.env
const BASE_URL = import.meta.env.VITE_BASE_URL + "/api";

const apiService = () => {
  const { apiRequest, loading, error } = useApiRequest();

  const fetchDrones = async () => apiRequest("GET", `${BASE_URL}/drones`);
  const createDrone = async (data) =>
    apiRequest("POST", `${BASE_URL}/drones`, data);
  const updateDrone = async (id, data) =>
    apiRequest("PATCH", `${BASE_URL}/drones/${id}`, data);
  const deleteDrone = async (id) =>
    apiRequest("DELETE", `${BASE_URL}/drones/${id}`);
  const updateDroneStatus = async (id, status) =>
    apiRequest("PATCH", `${BASE_URL}/drones/${id}/status`, { status });
  const updateDroneLocation = async (id, coordinates) =>
    apiRequest("PATCH", `${BASE_URL}/drones/${id}/location`, { coordinates });
  const fetchDroneStats = async () =>
    apiRequest("GET", `${BASE_URL}/drones/statistics`);

  const fetchMissions = async () => apiRequest("GET", `${BASE_URL}/missions`);
  const createMission = async (data) =>
    apiRequest("POST", `${BASE_URL}/missions`, data);
  const updateMission = async (id, data) =>
    apiRequest("PATCH", `${BASE_URL}/missions/${id}`, data);
  const deleteMission = async (id) =>
    apiRequest("DELETE", `${BASE_URL}/missions/${id}`);
  const updateMissionProgress = async (id, progress) =>
    apiRequest("PATCH", `${BASE_URL}/missions/${id}/progress`, { progress });
  const fetchMissionStats = async () =>
    apiRequest("GET", `${BASE_URL}/missions/statistics`);

  const fetchReports = async () => apiRequest("GET", `${BASE_URL}/reports`);
  const generateReport = async (data) =>
    apiRequest("POST", `${BASE_URL}/reports/generate`, data);
  const deleteReport = async (id) =>
    apiRequest("DELETE", `${BASE_URL}/reports/${id}`);

  return {
    fetchDrones,
    createDrone,
    updateDrone,
    deleteDrone,
    updateDroneStatus,
    updateDroneLocation,
    fetchDroneStats,
    fetchMissions,
    createMission,
    updateMission,
    deleteMission,
    updateMissionProgress,
    fetchMissionStats,
    fetchReports,
    generateReport,
    deleteReport,
    loading,
    error,
  };
};

export default apiService;
