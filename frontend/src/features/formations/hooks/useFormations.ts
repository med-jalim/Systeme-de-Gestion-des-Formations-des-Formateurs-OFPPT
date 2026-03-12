import { useState, useEffect, useCallback } from "react";
import * as api from "../api";
import type { Formation, CreateFormationPayload } from "../types";

export const useFormations = () => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFormations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchFormations();
      setFormations(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to fetch formations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFormations();
  }, [loadFormations]);

  const addFormation = async (payload: CreateFormationPayload) => {
    setLoading(true);
    setError(null);
    try {
      const newFormation = await api.createFormation(payload);
      setFormations((prev) => [...prev, newFormation]);
      return newFormation;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to create formation");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFormation = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await api.deleteFormation(id);
      setFormations((prev) => prev.filter((f) => f.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to delete formation");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { formations, loading, error, addFormation, removeFormation, reload: loadFormations };
};
