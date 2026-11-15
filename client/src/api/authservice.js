import axiosClient from "./axios.client.js";

export const registerUser = async (formData) => {
    const response = await axiosClient.post("/auth/register", {
        ...formData,
        role: "customer",
    });
    return response.data;
};


export const loginUser = async (formData) => {
    const response = await axiosClient.post("/auth/login", formData);
    return response.data;
};



 export const verifyOtpWithApi = async ({code, emailValue}) => {


    const response = await axiosClient.post("/auth/verify-otp", {
      email: emailValue.trim(),
      otp: code,
    });

  
  
    if (!response?.data.success) {
      const msg =
        response?.data.message || "Invalid OTP. Please try again.";
      throw new Error(msg);
    }

    return response.data;
  };


