import { useState, useEffect, useCallback } from "react";
import type { TrainingPlan, CreateTrainingPlanPayload } from "../types";
import * as api from "../api";

export const useTrainingPlans = () => {
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchPlans();
      setPlans(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const addPlan = async (payload: CreateTrainingPlanPayload) => {
    setLoading(true);
    setError(null);
    try {
      const newPlan = await api.createPlan(payload);
      setPlans((prev) => [...prev, newPlan]);
      return newPlan;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to create plan");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removePlan = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await api.deletePlan(id);
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to delete plan");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { plans, loading, error, addPlan, removePlan, reload: loadPlans };
};
