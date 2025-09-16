import axios from "axios";
import useAuthStore from "@/store/authStore";

const API_URL = import.meta.env.VITE_API_URL;

// Create an axios instance with a base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach the JWT to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().user?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Define the type for a user
interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  token?: string;
}

// Define the type for upload avatar response
interface UploadAvatarResponse {
  message: string;
  avatar: string;
}

/**
 * @desc Fetches a list of all users.
 * @returns A promise that resolves to an array of user objects.
 */
const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get("/users");
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: { message?: string } } };
    throw new Error(err.response?.data?.message || "Failed to fetch users");
  }
};

/**
 * @desc Fetches the profile of the currently logged-in user.
 * @returns A promise that resolves to the user's profile object.
 */
const getUserProfile = async (): Promise<User> => {
  try {
    const response = await api.get("/users/profile");
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: { message?: string } } };
    throw new Error(
      err.response?.data?.message || "Failed to fetch user profile"
    );
  }
};

const uploadAvatar = async (
  formData: FormData
): Promise<{ message: string; avatar: string }> => {
  try {
    const response = await api.post("/users/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: { message?: string } } };
    throw new Error(err.response?.data?.message || "Failed to upload avatar");
  }
};

export const userApi = {
  getAllUsers,
  getUserProfile,
  uploadAvatar,
};
