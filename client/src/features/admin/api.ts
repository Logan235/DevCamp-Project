import axios from "axios";

const API_URL = import.meta.env.BACKEND_URL || "http://localhost:3000";
const EXERCISE_URL = `${API_URL}/exercises`;
const api = axios.create({
  baseURL: EXERCISE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const getAllExercisesApi = () => api.get("");
export const createExerciseApi = (data: any) => api.post("", data);
export const updateExerciseApi = (id: string, data: any) =>
  api.put(`/${id}`, data);
export const deleteExerciseApi = (id: string) => api.delete(`/${id}`);

export const getTestCasesByChallengeApi = (challengeId: string) =>
  api.get(`/${challengeId}/testcases`);

export const getAllCategoriesApi = () => api.get("/categories");
