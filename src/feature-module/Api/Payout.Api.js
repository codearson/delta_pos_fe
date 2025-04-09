import { BASE_BACKEND_URL } from "./config";
import axios from "axios";

export const fetchPayouts = async () => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      console.error("No access token found. Please log in.");
      return [];
    }

    const response = await axios.get(`${BASE_BACKEND_URL}/payout/getAll`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data.responseDto || [];
  } catch (error) {
    console.error("Error fetching payouts:", error.response?.status, error.response?.data);
    return [];
  }
};

export const savePayout = async (payoutData) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      console.error("No access token found. Please log in.");
      return null;
    }

    const response = await axios.post(`${BASE_BACKEND_URL}/payout/save`, payoutData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error saving payout:", error.response?.status, error.response?.data);
    return null;
  }
};

export const updatePayout = async (payoutData) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      console.error("No access token found. Please log in.");
      return null;
    }

    const response = await axios.post(`${BASE_BACKEND_URL}/payout/update`, payoutData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating payout:", error.response?.status, error.response?.data);
    return null;
  }
};

export const updatePayoutStatus = async (payoutId, status = 0) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      return null;
    }

    const response = await axios.put(
      `${BASE_BACKEND_URL}/payout/updateStatus?payoutId=${payoutId}&status=${status}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating payout status:", error.response?.status, error.response?.data);
    return null;
  }
};
