import { BASE_BACKEND_URL } from "./config";
import axios from "axios";

// Save Api
export const saveNonScanProduct = async (productData) => {
    try {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            //console.error("No access token found. Please log in.");
            return null;
        }

        const response = await axios.post(`${BASE_BACKEND_URL}/nonScanProduct/save`, productData, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        return response.data;
    } catch (error) {
        //console.error("Error saving non-scan product:", error.response?.status, error.response?.data);
        return null;
    }
};

// Update Api
export const updateNonScanProduct = async (productId, updatedData) => {
    try {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            //console.error("No access token found. Please log in.");
            return null;
        }

        const response = await axios.put(`${BASE_BACKEND_URL}/nonScanProduct/update`, 
            { id: productId, ...updatedData }, 
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;
    } catch (error) {
        //console.error("Error updating non-scan product:", error.response?.status, error.response?.data);
        return null;
    }
};

// Update Status Api
export const updateNonScanProductStatus = async (productId, status = 0) => {
    try {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            //console.error("No access token found. Please log in.");
            return null;
        }

        const response = await axios.put(
            `${BASE_BACKEND_URL}/nonScanProduct/updateStatus?id=${productId}&status=${status}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        //console.error("Error updating non-scan product status:", error.response?.status, error.response?.data);
        return null;
    }
};

// Get Non-Scan Product By Name Api
export const getNonScanProductByName = async (productName) => {
    try {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            //console.error("No access token found. Please log in.");
            return null;
        }

        const response = await axios.get(
            `${BASE_BACKEND_URL}/nonScanProduct/getByName?nonScanProduct=${productName}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        //console.error("Error fetching non-scan product by name:", error.response?.status, error.response?.data);
        return null;
    }
};

// Get All Non-Scan Products with Pagination Api
export const getAllNonScanProductsPage = async (pageNumber = 0, pageSize = 10) => {
    try {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            //console.error("No access token found. Please log in.");
            return null;
        }

        const response = await axios.get(
            `${BASE_BACKEND_URL}/nonScanProduct/getAllPage?pageNumber=${pageNumber}&pageSize=${pageSize}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        //console.error("Error fetching non-scan products with pagination:", error.response?.status, error.response?.data);
        return null;
    }
}; 