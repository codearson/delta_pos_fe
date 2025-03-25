import { BASE_BACKEND_URL } from "./config";
import axios from "axios";

// Save Api
export const saveProductCategory = async (categoryName) => {
    try {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            //console.error("No access token found. Please log in.");
            return null;
        }

        const categoryData = {
            productCategoryName: categoryName,
            isActive: true,
        };

        const response = await axios.post(`${BASE_BACKEND_URL}/productCategory/save`, categoryData, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        return response.data;
    } catch (error) {
        //console.error("Error saving product category:", error.response?.status, error.response?.data);
        return null;
    }
};

// Get All Api
export const fetchProductCategories = async () => {
    try {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            //console.error("No access token found. Please log in.");
            return [];
        }

        const response = await axios.get(`${BASE_BACKEND_URL}/productCategory/getAll`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return response.data.responseDto || [];
    } catch (error) {
        //console.error("Error fetching product categories:", error.response?.status, error.response?.data);
        return [];
    }
};

// Update Product Category Api
export const updateProductCategory = async (categoryId, updatedData) => {
    try {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            //console.error("No access token found. Please log in.");
            return null;
        }

        const response = await axios.put(`${BASE_BACKEND_URL}/productCategory/update`, 
            { id: categoryId, ...updatedData }, 
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;
    } catch (error) {
        //console.error("Error updating product category:", error.response?.status, error.response?.data);
        return null;
    }
};

// Update Product Category Status Api
export const updateProductCategoryStatus = async (categoryId, status = 0) => {
    try {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            //console.error("No access token found. Please log in.");
            return null;
        }

        const response = await axios.put(
            `${BASE_BACKEND_URL}/productCategory/updateStatus?id=${categoryId}&status=${status}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        //console.error("Error updating product category status:", error.response?.status, error.response?.data);
        return null;
    }
};

// Get Product Category By Name Api
export const getProductCategoryByName = async (categoryName) => {
    try {
        const accessToken = localStorage.getItem("accessToken");

        // Check if access token exists
        if (!accessToken) {
            //console.error("No access token found. Please log in.");
            return null;
        }

        const response = await axios.get(
            `${BASE_BACKEND_URL}/productCategory/getByName?productCategoryName=${categoryName}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        //console.error("Error fetching product category by name:", error.response?.status, error.response?.data);
        return null;
    }
};