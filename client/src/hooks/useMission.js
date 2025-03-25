import { useState } from "react";
import { createMission, updateMissionProgress } from "../services/apiService";
import useApi from "./useApi";

const useMission = () => {
  const [mission, setMission] = useState(null);
  const { execute: create } = useApi(createMission);
  const { execute: updateProgress } = useApi(updateMissionProgress);

  const planMission = async (missionData) => {
    const newMission = await create(missionData);
    setMission(newMission);
    return newMission;
  };

  const updateMissionStatus = async (id, progress) => {
    const updated = await updateProgress(id, progress);
    setMission(updated);
    return updated;
  };

  return { mission, planMission, updateMissionStatus };
};

export default useMission;
