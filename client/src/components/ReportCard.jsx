import React from "react";
import { FileText, Download, Trash2 } from "lucide-react";

const ReportCard = ({ report, onDownload, onDelete }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
    <div className="flex items-center">
      <FileText className="h-6 w-6 text-blue-500 mr-3" />
      <div>
        <h3 className="font-medium">
          Report for {report.missionId?.name || "Unknown"}
        </h3>
        <p className="text-sm text-gray-500">
          Generated on {new Date(report.generatedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
    <div className="flex space-x-2">
      <button
        onClick={() => onDownload(report._id)}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
      >
        <Download className="h-5 w-5" />
      </button>
      <button
        onClick={() => onDelete(report._id)}
        className="p-2 text-red-600 hover:bg-red-50 rounded"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  </div>
);

export default ReportCard;
