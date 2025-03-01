import { BASE_BACKEND_URL } from "./config";
import axios from "axios";

export const fetchSuppliers = async () => {
    try {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            //   console.error("No access token found. Please log in.");
            return [];
        }

        const decodedToken = decodeJwt(accessToken);
        const userRole = decodedToken?.roles[0]?.authority;

        if (userRole !== "ROLE_ADMIN") {
            //   console.error("Access denied. Only admins can fetch suppliers.");
            return [];
        }

        const response = await axios.get(`${BASE_BACKEND_URL}/supplier/getAll`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return response.data.responseDto || [];
    } catch (error) {
        // console.error("Error fetching suppliers:", {
        //   status: error.response?.status,
        //   data: error.response?.data,
        //   message: error.message,
        // });
        return [];
    }
};

export const saveSupplier = async (supplierData) => {
    try {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            //   console.error("No access token found. Please log in.");
            return null;
        }

        const decodedToken = decodeJwt(accessToken);
        const userRole = decodedToken?.roles[0]?.authority;

        if (userRole !== "ROLE_ADMIN") {
            //   console.error("Access denied. Only admins can save suppliers.");
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
        // console.error("Error saving supplier:", {
        //   status: error.response?.status,
        //   data: error.response?.data,
        //   message: error.message,
        // });
        return null;
    }
};

export const updateSupplier = async (supplierData) => {
    try {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            //   console.error("No access token found. Please log in.");
            return null;
        }

        const decodedToken = decodeJwt(accessToken);
        const userRole = decodedToken?.roles[0]?.authority;

        if (userRole !== "ROLE_ADMIN") {
            //   console.error("Access denied. Only admins can update suppliers.");
            return null;
        }

        if (!supplierData.id) {
            //   console.error("Supplier ID is missing in update data:", supplierData);
            return null;
        }

        // console.log("Updating supplier with data:", supplierData);

        const { ...updateData } = supplierData;
        const response = await axios.post(`${BASE_BACKEND_URL}/supplier/update`, updateData, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        // console.log("Update supplier response:", response.data);
        return response.data;
    } catch (error) {
        // console.error("Error updating supplier:", {
        //   status: error.response?.status,
        //   data: error.response?.data,
        //   message: error.message,
        //   config: error.config,
        // });
        return null;
    }
};

export const updateSupplierStatus = async (supplierId) => {
    try {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            // console.error("No access token found. Please log in.");
            return null;
        }

        const decodedToken = decodeJwt(accessToken);
        const userRole = decodedToken?.roles[0]?.authority;

        if (userRole !== "ROLE_ADMIN") {
            // console.error("Access denied. Only admins can update supplier status.");
            return null;
        }

        const response = await axios.put(
            `${BASE_BACKEND_URL}/supplier/updateStatus?supplierId=${supplierId}&status=0`,
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
        //   console.error("Error updating supplier status:", {
        //     status: error.response?.status,
        //     data: error.response?.data,
        //     message: error.message,
        //   });
        return null;
    }
};

export const getSuppliersByName = async (name) => {
    try {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            // console.error("No access token found. Please log in.");
            return [];
        }

        const decodedToken = decodeJwt(accessToken);
        const userRole = decodedToken?.roles[0]?.authority;

        if (userRole !== "ROLE_ADMIN") {
            // console.error("Access denied. Only admins can search suppliers.");
            return [];
        }

        const response = await axios.get(`${BASE_BACKEND_URL}/supplier/getByName?name=${name}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return response.data.responseDto || [];
    } catch (error) {
        //   console.error("Error searching suppliers by name:", {
        //     status: error.response?.status,
        //     data: error.response?.data,
        //     message: error.message,
        //   });
        return [];
    }
};


function decodeJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
        // console.error("Error decoding JWT:", error);
        return null;
    }
}