import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// const BASE_URL = 'http://localhost:3000/api';
const BASE_URL = "http://192.168.1.4:3000/api"; // my local ip

const client = axios.create({
  baseURL: BASE_URL,
});

// Add token to requests
client.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers["x-auth-token"] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default client;
