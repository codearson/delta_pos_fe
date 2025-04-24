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
      return { content: [], totalElements: 0 };
    }

    const response = await axios.get(`${BASE_BACKEND_URL}/salesReport/getAllByZReportsPage`, {
      params: {
        pageNumber,
        pageSize
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.data || !response.data.responseDto) {
      return { content: [], totalElements: 0 };
    }

    return {
      content: response.data.responseDto.content || [],
      totalElements: response.data.responseDto.totalElements || 0
    };
  } catch (error) {
    console.error('Error fetching Z reports:', error);
    return { content: [], totalElements: 0 };
  }
};


