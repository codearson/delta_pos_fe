import { BASE_BACKEND_URL } from "./config";
import axios from "axios";

export const saveTransaction = async (transactionData) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      return { success: false, error: "No access token" };
    }

    const response = await axios.post(
      `${BASE_BACKEND_URL}/transaction/save`,
      transactionData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const fetchTransactions = async () => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      return [];
    }

    const response = await axios.get(`${BASE_BACKEND_URL}/transaction/getAll`, {
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

export const fetchZReport = async () => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      return { success: false, error: "No access token" };
    }

    // Get userId from localStorage or your auth state management
    const userId = localStorage.getItem("userId"); // Adjust this based on where you store the userId
    
    const response = await axios.get(`${BASE_BACKEND_URL}/transaction/zReport`, {
      params: { userId },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const fetchXReport = async () => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      return { success: false, error: "No access token" };
    }

    // Get userId from localStorage or your auth state management
    const userId = localStorage.getItem("userId"); // Adjust this based on where you store the userId

    const response = await axios.get(`${BASE_BACKEND_URL}/transaction/xReport`, {
      params: { userId },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};