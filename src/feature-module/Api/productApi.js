import { BASE_BACKEND_URL_P, BASE_BACKEND_URL } from "./config";
import axios from "axios";

export const createProduct = async (productData) => {
  try {
    const response = await axios.post(`${BASE_BACKEND_URL_P}/product/save`, productData);
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

export const fetchProducts = async () => {
  try {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      console.error("No access token found. Please log in.");
      return [];
    }

    // Decode the JWT token and check the role
    const decodedToken = decodeJwt(accessToken);
    const userRole = decodedToken?.roles[0]?.authority;

    if (userRole !== "ROLE_ADMIN") {
      console.log("Access Denied: Only admins can fetch products.");
      return []; 
    }

    const response = await axios.get(`${BASE_BACKEND_URL}/product/getAll`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log("Fetched Products:", response.data);
    return response.data.responseDto || [];
  } catch (error) {
    console.error("Error fetching products:", error.response?.status, error.response?.data);
    return [];
  }
};

function decodeJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1])); // Decode the token payload
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}
