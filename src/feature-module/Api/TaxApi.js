import { BASE_BACKEND_URL } from "./config";
import axios from "axios";
  
// Save Api
export const saveTax = async (tax) => {
    try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            //console.error("No access token found. Please log in.");
            return null;
        }

        const decodedToken = decodeJwt(accessToken);
        const userRole = decodedToken?.roles[0]?.authority;
        if (userRole !== "ROLE_ADMIN") {
            //console.error("Access denied. Only admins can save tax.");
            return null;
        }

        const taxData = {
            taxPercentage: Number(tax),
            isActive: true,
        };
        //console.log("Saving tax with payload:", taxData); // Debug payload

        const response = await axios.post(`${BASE_BACKEND_URL}/tax/save`, taxData, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });
        //console.log("Save tax response:", response.data); // Debug response
        return response.data;
    } catch (error) {
        //console.error("Error saving tax:", error.response?.status, error.response?.data || error.message);
        return null;
    }
};

// Get All Api
export const fetchTaxes = async () => {
    try {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            //console.error("No access token found. Please log in.");
            return [];
        }

        const response = await axios.get(`${BASE_BACKEND_URL}/tax/getAll`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return response.data.responseDto || [];
    } catch (error) {
        //console.error("Error fetching taxes:", error.response?.status, error.response?.data);
        return [];
    }
};

// Get Tax By Name Api
export const getTaxByName = async (taxPercentage) => {
    try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            //console.error("No access token found. Please log in.");
            return null;
        }

        const decodedToken = decodeJwt(accessToken);
        const userRole = decodedToken?.roles[0]?.authority;
        if (userRole !== "ROLE_ADMIN") {
            //console.error("Access denied. Only admins can perform this action.");
            return null;
        }

        const response = await axios.get(
            `${BASE_BACKEND_URL}/tax/getByName?taxPercentage=${taxPercentage}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        //console.error("Error fetching tax by percentage:", error.response?.status, error.response?.data);
        return null;
    }
};

// Update Tax Api
export const updateTax = async (taxId, updatedData) => {
    try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            console.error("No access token found. Please log in.");
            return null;
        }

        const decodedToken = decodeJwt(accessToken);
        const userRole = decodedToken?.roles[0]?.authority;
        if (userRole !== "ROLE_ADMIN") {
            console.error("Access denied. Only admins can update taxes.");
            return null;
        }

        //console.log("Updating tax with ID:", taxId, "and payload:", updatedData); // Debug payload
        const response = await axios.put(
            `${BASE_BACKEND_URL}/tax/update`,
            { id: taxId, ...updatedData },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );
        //console.log("Update tax response:", response.data); // Debug response
        return response.data;
    } catch (error) {
        //console.error("Error updating tax:", error.response?.status, error.response?.data || error.message);
        return null;
    }
};

// Update Tax Status Api
export const updateTaxStatus = async (taxId, status = 0) => {
    try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            //console.error("No access token found. Please log in.");
            return null;
        }

        const decodedToken = decodeJwt(accessToken);
        const userRole = decodedToken?.roles[0]?.authority;
        if (userRole !== "ROLE_ADMIN") {
            //console.error("Access denied. Only admins can update tax status.");
            return null;
        }

        const response = await axios.put(
            `${BASE_BACKEND_URL}/tax/updateStatus?id=${taxId}&status=${status}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        //console.error("Error updating tax status:", error.response?.status, error.response?.data);
        return null;
    }
};

// Token Convert
function decodeJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1])); // Decode the token payload
    } catch (error) {
        //console.error("Error decoding JWT:", error);
        return null;
    }
}
