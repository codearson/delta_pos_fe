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

export const updateProduct = async (productData) => {
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
      console.error("Access denied. Only admins can update products.");
      return null;
    }

    const response = await axios.post(`${BASE_BACKEND_URL}/product/update`, productData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error updating product:", error.response?.status, error.response?.data);
    return null;
  }
};

export const updateProductStatus = async (productId, status = 0) => {
  try {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      return null;
    }

    // Decode the JWT token and check the role
    const decodedToken = decodeJwt(accessToken);
    const userRole = decodedToken?.roles[0]?.authority;

    if (userRole !== "ROLE_ADMIN") {
      return null;
    }

    const response = await axios.put(
      `${BASE_BACKEND_URL}/product/updateStatus?productId=${productId}&status=${status}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error updating product status:", error.response?.status, error.response?.data);
    return null;
  }
};

export const getProductByName = async (name) => {
    try {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            console.error("No access token found. Please log in.");
            return null;
        }

        const decodedToken = decodeJwt(accessToken);
        const userRole = decodedToken?.roles[0]?.authority;


        if (userRole !== "ROLE_ADMIN") {
            console.error("Access denied. Only admins can perform this action.");
            return null;
        }

        const response = await axios.get(
            `${BASE_BACKEND_URL}/product/getByName?name=${name}&isActive=1`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error fetching product by name:", error.response?.status, error.response?.data);
        return null;
    }
};

export const getProductByBarcode = async (barcode) => {
    try {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            console.error("No access token found. Please log in.");
            return null;
        }

        const decodedToken = decodeJwt(accessToken);
        const userRole = decodedToken?.roles[0]?.authority;

        if (userRole !== "ROLE_ADMIN") {
            console.error("Access denied. Only admins can perform this action.");
            return null;
        }

        const response = await axios.get(
            `${BASE_BACKEND_URL}/product/getByBarcode?barcode=${barcode}&isActive=1`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error fetching product by barcode:", error.response?.status, error.response?.data);
        return null;
    }
};

function decodeJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}
