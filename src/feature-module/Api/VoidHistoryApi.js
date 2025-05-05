import { BASE_BACKEND_URL } from "./config";
import axios from "axios";

export const saveVoidHistory = async (voidData) => {
    try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) throw new Error("Authentication required");
        const response = await axios.post(
            `${BASE_BACKEND_URL}/voidHistory/save`,
            voidData,
            { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } }
        );
        return response.data;
    } catch (error) {
        console.error('Error saving void history:', error);
        throw error;
    }
}; 