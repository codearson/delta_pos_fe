import { BASE_BACKEND_URL } from "./config";
import axios from "axios";

export const fetchSuppliers = async () => {
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

        const response = await axios.get(`${BASE_BACKEND_URL}/supplier/getAll`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return response.data.responseDto || [];
    } catch (error) {
        return [];
    }
};

export const saveSupplier = async (supplierData) => {
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

        const response = await axios.post(`${BASE_BACKEND_URL}/supplier/save`, supplierData, {
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

export const updateSupplier = async (supplierData) => {
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

        if (!supplierData.id) {
            return null;
        }

        const { ...updateData } = supplierData;
        const response = await axios.post(`${BASE_BACKEND_URL}/supplier/update`, updateData, {
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

export const updateSupplierStatus = async (supplierId, status) => {
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
            `${BASE_BACKEND_URL}/supplier/updateStatus?supplierId=${supplierId}&status=${status}`,
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