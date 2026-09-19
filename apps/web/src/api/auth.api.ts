import axios from "./axios";
import { setToken, removeToken } from "../utils/auth";

export async function signup(username: string, password: string) {
  const response = await axios.post("/auth/signup", {
    username,
    password,
  });

  localStorage.setItem("username", username);

  return response.data;
}

export async function signin(username: string, password: string) {
  const response = await axios.post("/auth/signin", {
    username,
    password,
  });

  setToken(response.data.token);
  localStorage.setItem("username", username);

  return response.data;
}

export function logout() {
  removeToken();
  localStorage.removeItem("username");
}