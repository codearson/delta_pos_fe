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

export const fetchProducts = async () => {
  try {
    const response = await fetch(`${BASE_BACKEND_URL}/product/getAll`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};