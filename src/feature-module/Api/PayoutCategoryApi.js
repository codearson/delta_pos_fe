import { BASE_BACKEND_URL } from "./config";
import axios from "axios";

export const fetchPayoutCategories = async () => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      console.error("No access token found. Please log in.");
      return [];
    }

    const response = await axios.get(`${BASE_BACKEND_URL}/payoutCategory/getAll`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data.responseDto || [];
  } catch (error) {
    console.error("Error fetching payout categories:", error.response?.status, error.response?.data);
    return [];
  }
};

export const savePayoutCategory = async (categoryData) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      console.error("No access token found. Please log in.");
      return null;
    }

    const response = await axios.post(`${BASE_BACKEND_URL}/payoutCategory/save`, categoryData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error saving payout category:", error.response?.status, error.response?.data);
    return null;
  }
};

export const updatePayoutCategory = async (categoryData) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      console.error("No access token found. Please log in.");
      return null;
    }

    const response = await axios.post(`${BASE_BACKEND_URL}/payoutCategory/update`, categoryData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating payout category:", error.response?.status, error.response?.data);
    return null;
  }
};

export const updatePayoutCategoryStatus = async (categoryId, status = 0) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      return null;
    }

    const response = await axios.put(
      `${BASE_BACKEND_URL}/payoutCategory/updateStatus?categoryId=${categoryId}&status=${status}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating payout category status:", error.response?.status, error.response?.data);
    return null;
  }
};
