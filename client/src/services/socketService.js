import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_BASE_URL);

export const joinMission = (missionId) =>
  socket.emit("join-mission", missionId);
export const sendDroneUpdate = (data) => socket.emit("drone-update", data);
export const sendChatMessage = (msg) => socket.emit("chat-message", msg);
export const onDronePosition = (callback) =>
  socket.on("drone-position", callback);
export const onChatResponse = (callback) =>
  socket.on("chat-response", callback);
export const disconnectSocket = () => socket.disconnect();
