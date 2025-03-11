import { BASE_BACKEND_URL } from "./config";
import axios from "axios";

export const fetchUserRoles = async () => {
    try {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            return [];
        }

        const decodedToken = decodeJwt(accessToken);
        const userRole = decodedToken?.roles[0]?.authority;

        if (userRole !== "ROLE_ADMIN") {
            return [];
        }

        const response = await axios.get(`${BASE_BACKEND_URL}/userRole/getAll`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return response.data.responseDto || [];
    } catch (error) {
        console.error('Error fetching user roles:', error);
        return [];
    }
};

function decodeJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
        return null;
    }
}
