import { BASE_BACKEND_URL } from "./config";
import axios from "axios";

export const registerDevice = async (deviceData) => {
    try {
        console.log('%c 📤 Register Device Request:', 'color: #2196F3; font-weight: bold;', deviceData);
        
        const response = await axios.post(
            `${BASE_BACKEND_URL}/deviceAuth/register`,
            deviceData,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        console.log('%c ✅ Register Device Response:', 'color: #4CAF50; font-weight: bold;', response.data);
        return response.data;
    } catch (error) {
        console.error('%c ❌ Register Device Error:', 'color: #F44336; font-weight: bold;', error.response?.data || error.message);
        throw error;
    }
};

export const approveDevice = async (deviceId) => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
        return null;
    }

    const response = await axios.put(
        `${BASE_BACKEND_URL}/deviceAuth/approve?id=${deviceId}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        }
    );

    return response.data;
};

export const declineDevice = async (deviceId) => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
        return null;
    }

    const response = await axios.put(
        `${BASE_BACKEND_URL}/deviceAuth/decline?id=${deviceId}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        }
    );

    return response.data;
};

export const blockDevice = async (deviceId) => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
        return null;
    }

    const response = await axios.put(
        `${BASE_BACKEND_URL}/deviceAuth/block?id=${deviceId}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        }
    );

    return response.data;
};

export const loginDevice = async (deviceId) => {
    try {
        console.log('%c 📤 Login Device Request:', 'color: #2196F3; font-weight: bold;', { deviceId });
        
        const response = await axios.post(
            `${BASE_BACKEND_URL}/deviceAuth/login?tillId=${deviceId}`,
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        console.log('%c ✅ Login Device Response:', 'color: #4CAF50; font-weight: bold;', response.data);
        return response.data;
    } catch (error) {
        console.error('%c ❌ Login Device Error:', 'color: #F44336; font-weight: bold;', error.response?.data || error.message);
        throw error;
    }
};
