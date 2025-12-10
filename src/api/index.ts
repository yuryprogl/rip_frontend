import axios from "axios";

export const API_URL = "/api";

const $api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export default $api;
