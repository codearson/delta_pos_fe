import axios from "axios";
import { BASE_BACKEND_URL } from "./config";

export const saveHoliday = async (holidayData) => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) return null;

  const response = await axios.post(
    `${BASE_BACKEND_URL}/staffLeave/save`,
    holidayData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const fetchHolidays = async () => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) return [];

  const response = await axios.get(`${BASE_BACKEND_URL}/staffLeave/getAll`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data.responseDto || [];
};

export const updateHoliday = async (holidayData) => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) return null;

  const response = await axios.put(
    `${BASE_BACKEND_URL}/staffLeave/update`,
    holidayData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const updateHolidayStatus = async (holidayId, status) => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) return null;

  const response = await axios.put(
    `${BASE_BACKEND_URL}/staffLeave/updateStatus?id=${holidayId}&status=${status}`,
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

export const sendEmail = async (to, subject, body) => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) return null;

  const response = await axios.post(
    `${BASE_BACKEND_URL}/staffLeave/sendEmail`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      params: {
        to,
        subject,
        body,
      },
    }
  );
  return response.data;
};