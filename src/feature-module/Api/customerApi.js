import { BASE_BACKEND_URL } from "./config"; 
import axios from "axios";

export const saveCustomer = async (customerData) => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      return null;
    }

    const response = await axios.post(`${BASE_BACKEND_URL}/customer/save`, customerData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  
};

export const fetchCustomers = async () => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      return [];
    }

    const response = await axios.get(`${BASE_BACKEND_URL}/customer/getAll`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data.responseDto || [];
  
};

export const updateCustomer = async (customerData) => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      return null;
    }

    const response = await axios.post(`${BASE_BACKEND_URL}/customer/update`, customerData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  
};

export const updateCustomerStatus = async (customerId, status) => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      return null;
    }

    const response = await axios.put(
      `${BASE_BACKEND_URL}/customer/updateStatus?customerId=${customerId}&status=${status}`,
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