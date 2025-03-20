import axios from "axios";

export const BASE_BACKEND_URL = "https://delta_pos_be.railway.internal";
// export const BASE_BACKEND_URL = "http://localhost:8080";

export const getAccessToken = async (username, password) => {
  try {
    const response = await axios.post(`${BASE_BACKEND_URL}/user/login`, {
      username,
      password,
    });

    if (response.data.responseDto?.accessToken) {
      const accessToken = response.data.responseDto.accessToken;
      localStorage.setItem("accessToken", accessToken);
      return { success: true, token: accessToken };
    }

    const errorMessage = response.data.responseDto || response.data.errorDescription;

    if (errorMessage) {
      if (errorMessage.toLowerCase().includes("not exists")) {
        return { success: false, error: "email_not_found" };
      } else if (errorMessage.toLowerCase().includes("bad credentials")) {
        return { success: false, error: "incorrect_password" };
      }
    }

    return { success: false, error: "general_error" };
  } catch (err) {
    return { success: false, error: "general_error" };
  }
};

export const getUserByEmail = async (email) => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    return null;
  }
  
  const response = await axios.get(
    `${BASE_BACKEND_URL}/user/getByEmailAddress?emailAddress=${email}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  
  if (response.data.responseDto?.length > 0) {
    return response.data.responseDto[0];
  }
  return null;
};

export const forgotPassword = async (email) => {
  const response = await axios.post(
    `${BASE_BACKEND_URL}/auth/forgot-password`,
    { email },
    {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
    }
  );
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await axios.post(
    `${BASE_BACKEND_URL}/auth/reset-password`,
    { token, newPassword },
    {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
    }
  );
  return response.data;
};
