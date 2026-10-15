export const API_BASE_URL = "http://localhost:5000/api";

export const getToken = () => localStorage.getItem("nagrikai_token");

export const saveSession = (token) => {
  localStorage.setItem("nagrikai_token", token);
};

export const clearSession = () => {
  localStorage.removeItem("nagrikai_token");
};