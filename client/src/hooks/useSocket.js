import { useEffect, useState } from "react";
import {
  onDronePosition,
  onChatResponse,
  disconnectSocket,
} from "../services/socketService";

const useSocket = () => {
  const [dronePosition, setDronePosition] = useState(null);
  const [chatResponse, setChatResponse] = useState(null);

  useEffect(() => {
    onDronePosition((data) => setDronePosition(data));
    onChatResponse((msg) => setChatResponse(msg));

    return () => disconnectSocket();
  }, []);

  return { dronePosition, chatResponse };
};

export default useSocket;
