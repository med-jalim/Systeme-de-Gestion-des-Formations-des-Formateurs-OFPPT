import axiosInstance from "@/lib/axios";
import type { TrainingPlan, CreateTrainingPlanPayload, TrainingSession, Absence } from "./types";

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

export const approvePlan = async (id: number, data: { status: 'approuve' | 'rejete', rejection_reason?: string }): Promise<TrainingPlan> => {
  const response = await axiosInstance.post(`${API_BASE}/${id}/approve`, data);
  return response.data;
};

export const fetchSessions = async (planId: number): Promise<TrainingSession[]> => {
  const response = await axiosInstance.get(`/sessions?plan_id=${planId}`);
  return response.data;
};

export const createSession = async (data: any): Promise<TrainingSession> => {
  const response = await axiosInstance.post(`/sessions`, data);
  return response.data;
};

export const updateSession = async (id: number, data: any): Promise<TrainingSession> => {
  const response = await axiosInstance.put(`/sessions/${id}`, data);
  return response.data;
};

export const deleteSession = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/sessions/${id}`);
};

export const fetchAbsences = async (sessionId: number): Promise<Absence[]> => {
  const response = await axiosInstance.get(`/absences?session_id=${sessionId}`);
  return response.data;
};

export const updateAbsencesBatch = async (data: { training_session_id: number; absences: any[] }): Promise<void> => {
  await axiosInstance.post(`/absences/batch`, data);
};
