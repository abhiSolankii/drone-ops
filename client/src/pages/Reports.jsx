import React, { useEffect, useState } from "react";
import apiService from "../services/apiService.js";
import ReportCard from "../components/ReportCard.jsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import toast from "react-hot-toast";

const Reports = () => {
  const {
    fetchReports,
    generateReport,
    deleteReport,
    fetchMissionStats,
    fetchDroneStats,
    fetchMissions,
    loading,
    error,
  } = apiService();
  const [reports, setReports] = useState([]);
  const [missionStats, setMissionStats] = useState([]);
  const [droneStats, setDroneStats] = useState([]);
  const [missions, setMissions] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [reportData, missionStatData, droneStatData, missionData] =
          await Promise.all([
            fetchReports(),
            fetchMissionStats(),
            fetchDroneStats(),
            fetchMissions(),
          ]);
        // Transform missionStats and droneStats for BarChart
        const transformedMissionStats = Object.entries(missionStatData).map(
          ([key, value]) => ({
            _id: key,
            count: value.count || 0,
            avgProgress: value.avgProgress || 0,
          })
        );
        const transformedDroneStats = Object.entries(droneStatData).map(
          ([key, value]) => ({
            _id: key,
            count: value.count || 0,
            avgBattery: value.avgBattery || 0,
          })
        );
        setReports(reportData);
        setMissionStats(transformedMissionStats);
        setDroneStats(transformedDroneStats);
        setMissions(missionData);
      } catch (err) {
        console.error("Failed to load reports data:", err);
        toast.error(`Failed to load data: ${err.message}`, {
          style: { background: "#1f2937", color: "#fff" },
        });
      }
    };
    loadData();
  }, []);

  const handleGenerate = async () => {
    try {
      const completedMission = missions.find((m) => m.status === "completed");
      if (!completedMission) {
        throw new Error("No completed missions available to generate a report");
      }
      const reportData = {
        missionId: completedMission._id,
        images: ["mock.jpg"], // Replace with actual image data if needed
      };
      await generateReport(reportData);
      const updatedReports = await fetchReports();
      setReports(updatedReports);
      toast.success("Report generated successfully", {
        style: { background: "#1f2937", color: "#fff" },
      });
    } catch (err) {
      console.error("Failed to generate report:", err);
      toast.error(`Failed to generate report: ${err.message}`, {
        style: { background: "#1f2937", color: "#fff" },
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteReport(id);
      const updatedReports = await fetchReports();
      setReports(updatedReports);
      toast.success("Report deleted successfully", {
        style: { background: "#1f2937", color: "#fff" },
      });
    } catch (err) {
      console.error("Failed to delete report:", err);
      toast.error(`Failed to delete report: ${err.message}`, {
        style: { background: "#1f2937", color: "#fff" },
      });
    }
  };

  const handleDownload = (reportId) => {
    // Simulate downloading a report (replace with actual download logic)
    const report = reports.find((r) => r._id === reportId);
    if (report) {
      console.log(
        `Downloading report for mission: ${report.missionId?.name || "Unknown"}`
      );
      toast.success("Report download initiated", {
        style: { background: "#1f2937", color: "#fff" },
      });
      // Example: Trigger a file download
      // const url = window.URL.createObjectURL(new Blob([JSON.stringify(report)]));
      // const link = document.createElement("a");
      // link.href = url;
      // link.setAttribute("download", `report-${reportId}.json`);
      // document.body.appendChild(link);
      // link.click();
      // link.remove();
    } else {
      toast.error("Report not found", {
        style: { background: "#1f2937", color: "#fff" },
      });
    }
  };

  if (loading)
    return <div className="text-gray-300 text-center p-4">Loading...</div>;
  if (error)
    return <div className="text-red-400 text-center p-4">Error: {error}</div>;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-white">
          Survey Reports
        </h1>
        <button
          onClick={handleGenerate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto"
        >
          Generate Report
        </button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Mission Statistics</h2>
          {missionStats.length > 0 ? (
            <div className="overflow-x-auto">
              <BarChart
                width={Math.min(500, window.innerWidth - 40)}
                height={300}
                data={missionStats}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3B82F6" name="Mission Count" />
                <Bar
                  dataKey="avgProgress"
                  fill="#10B981"
                  name="Avg Progress (%)"
                />
              </BarChart>
            </div>
          ) : (
            <p className="text-gray-500">No mission statistics available.</p>
          )}
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Drone Statistics</h2>
          {droneStats.length > 0 ? (
            <div className="overflow-x-auto">
              <BarChart
                width={Math.min(500, window.innerWidth - 40)}
                height={300}
                data={droneStats}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8B5CF6" name="Drone Count" />
                <Bar
                  dataKey="avgBattery"
                  fill="#F59E0B"
                  name="Avg Battery (%)"
                />
              </BarChart>
            </div>
          ) : (
            <p className="text-gray-500">No drone statistics available.</p>
          )}
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Reports</h2>
        {reports.length === 0 ? (
          <p className="text-gray-500">No reports available.</p>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <ReportCard
                key={report._id}
                report={report}
                onDownload={() => handleDownload(report._id)}
                onDelete={() => handleDelete(report._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
