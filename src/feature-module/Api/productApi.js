import { BASE_BACKEND_URL } from "./config";
import axios from "axios";

export const createProduct = async (productData) => {
  try {
    const response = await axios.post(`${BASE_BACKEND_URL}/product/save`, productData);
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

