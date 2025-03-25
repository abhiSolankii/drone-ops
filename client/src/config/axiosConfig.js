import axios from "axios";

const instance = axios.create({
  //import base url from environment variables for vite using import.meta.env
  baseURL: import.meta.env.VITE_BASE_URL + "/api",
});
export default instance; //export the instance
