import { BASE_BACKEND_URL } from "./config";
import axios from "axios";

export const saveBanking = async (bankingData) => {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    return null;
  }

  try {
    const response = await axios.post(
      `${BASE_BACKEND_URL}/banking/save`,
      bankingData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error saving banking data:", error);
    throw error;
  }
};