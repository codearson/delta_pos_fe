import { BASE_BACKEND_URL } from "./config";
import axios from "axios";

// Save Branch API
export const saveBranch = async (branchData) => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
        throw new Error("No access token found. Please log in.");
    }

    const decodedToken = decodeJwt(accessToken);
    const userRole = decodedToken?.roles[0]?.authority;

    if (userRole !== "ROLE_ADMIN") {
        throw new Error("Access denied. Only admins can perform this action.");
    }

    const response = await axios.post(`${BASE_BACKEND_URL}/branch/save`, branchData, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    });

    return response.data;
};

// Update Branch API
export const updateBranch = async (branchData) => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
        throw new Error("No access token found. Please log in.");
    }

    const decodedToken = decodeJwt(accessToken);
    const userRole = decodedToken?.roles[0]?.authority;

    if (userRole !== "ROLE_ADMIN") {
        throw new Error("Access denied. Only admins can perform this action.");
    }

    const response = await axios.post(`${BASE_BACKEND_URL}/branch/update`, branchData, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    });

    return response.data;
};

// Update Branch Status API
export const updateBranchStatus = async (branchId, status = 0) => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
        throw new Error("No access token found. Please log in.");
    }

    const decodedToken = decodeJwt(accessToken);
    const userRole = decodedToken?.roles[0]?.authority;

    if (userRole !== "ROLE_ADMIN") {
        throw new Error("Access denied. Only admins can perform this action.");
    }

    const response = await axios.put(
        `${BASE_BACKEND_URL}/branch/updateStatus?branchId=${branchId}&status=${status}`,
        null,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.data.status) {
        throw new Error(response.data.errorDescription || "Failed to update branch status");
    }

    return response.data.responseDto;
};

function decodeJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
        return null;
    }
}