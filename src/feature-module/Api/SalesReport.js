import { BASE_BACKEND_URL } from "./config";
import axios from "axios";

export const getAllByZReports = async () => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      return [];
    }

    const response = await axios.get(`${BASE_BACKEND_URL}/salesReport/getAllByZReports`, {
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

export const getAllByZReportsPages = async (pageNumber = 1, pageSize = 10) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      console.log('No access token found');
      return { content: [], totalElements: 0 };
    }

    console.log('Making API request with:', { pageNumber, pageSize });
    const response = await axios.get(
      `${BASE_BACKEND_URL}/salesReport/getAllByZReportsPage?pageNumber=${pageNumber}&pageSize=${pageSize}`, 
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log('Raw API response:', response.data);

    if (!response.data) {
      console.log('No response data received');
      return { content: [], totalElements: 0 };
    }

    if (!Array.isArray(response.data.responseDto)) {
      console.log('responseDto is not an array');
      return { content: [], totalElements: 0 };
    }

    const content = response.data.responseDto;
    const totalElements = response.data.totalRecords || content.length;

    console.log('Processed response:', {
      contentLength: content.length,
      totalElements,
      pageNumber,
      pageSize
    });

    return {
      content,
      totalElements,
      pageNumber,
      pageSize
    };
  } catch (error) {
    console.error('Error fetching Z reports:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    return { content: [], totalElements: 0 };
  }
};