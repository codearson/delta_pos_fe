import { BASE_BACKEND_URL } from "./config";
import axios from "axios";

export const fetchTransactions = async () => {
    try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            console.error("No access token found in localStorage");
            return [];
        }

        const decodedToken = decodeJwt(accessToken);
        if (!decodedToken) {
            console.error("Failed to decode JWT token");
            return [];
        }

        const userRole = decodedToken?.roles[0]?.authority;
        if (userRole !== "ROLE_ADMIN") {
            return [];
        }

        const response = await axios.get(`${BASE_BACKEND_URL}/transaction/getAll`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.data.responseDto || !Array.isArray(response.data.responseDto)) {
            return [];
        }

        return response.data.responseDto;
    } catch (error) {
        return [];
    }
};

function decodeJwt(token) {
    try {
        return JSON.parse(atob(token.split(".")[1]));
    } catch (error) {
        return null;
    }
}