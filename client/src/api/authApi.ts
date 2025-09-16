import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Define the types for the API responses and request payloads
interface AuthResponse {
  _id: string;
  username: string;
  email: string;
  token: string;
}

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

// Create an instance of axios with a base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * @desc Registers a new user with the provided credentials.
 * @param payload - The user's registration data (username, email, password).
 * @returns A promise that resolves to the authenticated user and token.
 */
const registerUser = async (
  payload: RegisterPayload
): Promise<AuthResponse> => {
  try {
    const response = await api.post("/auth/register", payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Registration failed");
  }
};

/**
 * @desc Logs in a user with the provided email and password.
 * @param payload - The user's login data (email, password).
 * @returns A promise that resolves to the authenticated user and token.
 */
const loginUser = async (payload: LoginPayload): Promise<AuthResponse> => {
  try {
    const response = await api.post("/auth/login", payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

export const authApi = {
  registerUser,
  loginUser,
};
