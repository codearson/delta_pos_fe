import { BASE_BACKEND_URL } from "./config";
import axios from "axios";

export const fetchUsers = async (pageNumber = 1, pageSize = 10) => {
    try {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            return { payload: [], totalRecords: 0 };
        }

        const decodedToken = decodeJwt(accessToken);
        const userRole = decodedToken?.roles[0]?.authority;

        if (userRole !== "ROLE_ADMIN") {
            return { payload: [], totalRecords: 0 };
        }

        const response = await axios.get(
            `${BASE_BACKEND_URL}/user/getAll?pageNumber=${pageNumber}&pageSize=${pageSize}`, 
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        // Match the actual API response structure
        return {
            payload: response.data.responseDto.payload || [],
            totalRecords: response.data.responseDto.totalRecords || 0
        };
    } catch (error) {
        console.error('Error fetching users:', error);
        return { payload: [], totalRecords: 0 };
    }
};

export const saveUser = async (userData) => {
    try {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            return null;
        }

        const decodedToken = decodeJwt(accessToken);
        const userRole = decodedToken?.roles[0]?.authority;

        if (userRole !== "ROLE_ADMIN") {
            return null;
        }

        const response = await axios.post(`${BASE_BACKEND_URL}/user/register`, userData, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        return response.data;
    } catch (error) {
        return null;
    }
};

export const updateUser = async (userData) => {
    try {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            return null;
        }

        const decodedToken = decodeJwt(accessToken);
        const userRole = decodedToken?.roles[0]?.authority;

        if (userRole !== "ROLE_ADMIN") {
            return null;
        }

        if (!userData.id) {
            return null;
        }

        const { ...updateData } = userData;
        const response = await axios.post(`${BASE_BACKEND_URL}/user/update`, updateData, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        return response.data;
    } catch (error) {
        return null;
    }
};

export const updateUserStatus = async (userId, status) => {
    try {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            return null;
        }

        const decodedToken = decodeJwt(accessToken);
        const userRole = decodedToken?.roles[0]?.authority;

        if (userRole !== "ROLE_ADMIN") {
            return null;
        }

        const response = await axios.put(
            `${BASE_BACKEND_URL}/user/updateStatus?userId=${userId}&status=${status}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;
    } catch (error) {
        return null;
    }
};

function decodeJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
        return null;
    }
}
