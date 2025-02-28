import { BASE_BACKEND_URL } from "./config";
import axios from "axios";

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
      console.error("Access denied. Only admins can fetch products.");
      return [];
    }

    const response = await axios.get(`${BASE_BACKEND_URL}/product/getAll`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data.responseDto || [];
  } catch (error) {
    console.error("Error fetching products:", error.response?.status, error.response?.data);
    return [];
  }
};

export const saveProduct = async (productData) => {
  try {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      console.error("No access token found. Please log in.");
      return null;
    }

    // Decode the JWT token and check the role
    const decodedToken = decodeJwt(accessToken);
    const userRole = decodedToken?.roles[0]?.authority;

    if (userRole !== "ROLE_ADMIN") {
      console.error("Access denied. Only admins can save products.");
      return null;
    }

    const response = await axios.post(`${BASE_BACKEND_URL}/product/save`, productData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error saving product:", error.response?.status, error.response?.data);
    return null;
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
