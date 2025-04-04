import axios from "axios";
import { BASE_BACKEND_URL } from "./config";

export const getAllManagerToggles = async () => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const response = await axios.get(`${BASE_BACKEND_URL}/managerToggle/getAll`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching manager toggles:", error);
    throw error;
  }
};

export const updateManagerToggleStatus = async (id, status) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const response = await axios.put(
      `${BASE_BACKEND_URL}/managerToggle/updateStatus?id=${id}&status=${status}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating manager toggle status:", error);
    throw error;
  }
};
