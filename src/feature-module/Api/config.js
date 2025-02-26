import axios from "axios";

export const BASE_BACKEND_URL = "http://localhost:8080";
export const BASE_BACKEND_URL_P = "http://localhost:6000";

export const getAccessToken = async (username, password) => {
  try {
    const response = await axios.post(`${BASE_BACKEND_URL}/user/login`, {
      username,
      password,
    });

    if (response.data.responseDto?.accessToken) {
      const accessToken = response.data.responseDto.accessToken;
      localStorage.setItem("accessToken", accessToken);
      console.log("New Access Token:", accessToken);
      return accessToken;
    }
  } catch (err) {
    console.error("Login Error:", err.message);
    return null;
  }
};

export const getUserByEmail = async (email) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
  
      if (!accessToken) {
        console.error("No access token found.");
        return null;
      }
  
      console.log(" Using Access Token:", accessToken);
  
      const response = await axios.get(
        `${BASE_BACKEND_URL}/user/getByEmailAddress?emailAddress=${email}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      console.log("User API Response:", response.data);
  
      if (response.data.responseDto?.length > 0) {
        return response.data.responseDto[0];
      }
  
      return null;
    } catch (err) {
      console.error("Error fetching user details:", err.response?.status, err.response?.data);
      return null;
    }
  };
  
