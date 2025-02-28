import { BASE_BACKEND_URL } from "./config";
import axios from "axios";

// Save Api
export const saveTax = async (tax) => {
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
            console.error("Access denied. Only admins can save tax.");
            return null;
        }

        const taxData = {
            taxPercentage: Number(tax),
            isActive: true,
        };
        const response = await axios.post(`${BASE_BACKEND_URL}/tax/save`, taxData, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error saving tax:", error.response?.status, error.response?.data);
        return null;
    }
};

// Get All Api
export const fetchTaxes = async () => {
    try {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            console.error("No access token found. Please log in.");
            return [];
        }

        const response = await axios.get(`${BASE_BACKEND_URL}/tax/getAll`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return response.data.responseDto || [];
    } catch (error) {
        console.error("Error fetching taxes:", error.response?.status, error.response?.data);
        return [];
    }
};

// Token Convert
function decodeJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1])); // Decode the token payload
    } catch (error) {
        console.error("Error decoding JWT:", error);
        return null;
    }
}
