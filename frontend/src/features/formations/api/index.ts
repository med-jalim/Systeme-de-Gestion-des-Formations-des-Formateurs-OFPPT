import axiosInstance from "@/lib/axios";
import type { Formation, CreateFormationPayload, CreateThemePayload } from "../types";
import type { Theme } from "../../training-plans/types";

const FORMATIONS_BASE = "/formations";
const THEMES_BASE = "/themes";

export const fetchFormations = async (): Promise<Formation[]> => {
  const response = await axiosInstance.get(FORMATIONS_BASE);
  return response.data;
};

export const fetchFormationById = async (id: number): Promise<Formation> => {
  const response = await axiosInstance.get(`${FORMATIONS_BASE}/${id}`);
  return response.data;
};

export const createFormation = async (data: CreateFormationPayload): Promise<Formation> => {
  const response = await axiosInstance.post(FORMATIONS_BASE, data);
  return response.data;
};

export const updateFormation = async (id: number, data: Partial<CreateFormationPayload>): Promise<Formation> => {
  const response = await axiosInstance.put(`${FORMATIONS_BASE}/${id}`, data);
  return response.data;
};

export const deleteFormation = async (id: number): Promise<void> => {
  await axiosInstance.delete(`${FORMATIONS_BASE}/${id}`);
};

export const createTheme = async (data: CreateThemePayload): Promise<Theme> => {
  const response = await axiosInstance.post(THEMES_BASE, data);
  return response.data;
};

export const updateTheme = async (id: number, data: Partial<CreateThemePayload>): Promise<Theme> => {
  const response = await axiosInstance.put(`${THEMES_BASE}/${id}`, data);
  return response.data;
};

export const deleteTheme = async (id: number): Promise<void> => {
  await axiosInstance.delete(`${THEMES_BASE}/${id}`);
};
