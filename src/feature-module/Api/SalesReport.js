import { BASE_BACKEND_URL } from "./config";
import axios from "axios";

export const getAllByXReports = async () => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      return [];
    }

    const response = await axios.get(`${BASE_BACKEND_URL}/salesReport/getAllByXReports`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.data.responseDto || !Array.isArray(response.data.responseDto)) {
      return [];
    }

    return response.data.responseDto;
  } catch (error) {
    return [];
  }
};

export const getAllByZReports = async () => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      return [];
    }

    const response = await axios.get(`${BASE_BACKEND_URL}/salesReport/getAllByZReports`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.data.responseDto || !Array.isArray(response.data.responseDto)) {
      return [];
    }

    return response.data.responseDto;
  } catch (error) {
    return [];
  }
};
