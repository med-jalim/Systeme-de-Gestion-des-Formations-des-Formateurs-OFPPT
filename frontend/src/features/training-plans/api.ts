import axiosInstance from "@/lib/axios";
import type { TrainingPlan, CreateTrainingPlanPayload } from "./types";

const API_BASE = "/plans";

export const fetchPlans = async (): Promise<TrainingPlan[]> => {
  const response = await axiosInstance.get(API_BASE);
  return response.data;
};

export const fetchPlanById = async (id: number): Promise<TrainingPlan> => {
  const response = await axiosInstance.get(`${API_BASE}/${id}`);
  return response.data;
};

export const createPlan = async (data: CreateTrainingPlanPayload): Promise<TrainingPlan> => {
  const response = await axiosInstance.post(API_BASE, data);
  return response.data;
};

export const updatePlan = async (id: number, data: Partial<CreateTrainingPlanPayload>): Promise<TrainingPlan> => {
  const response = await axiosInstance.put(`${API_BASE}/${id}`, data);
  return response.data;
};

export const deletePlan = async (id: number): Promise<void> => {
  await axiosInstance.delete(`${API_BASE}/${id}`);
};
