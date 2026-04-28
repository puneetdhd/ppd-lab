import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export function useApi<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!url) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(url);
      // The backend standardizes responses as { success: boolean, data: T, message: string }
      setData(res.data.data);
      // Also capture total for paginated endpoints
      if (typeof res.data.total === 'number') setTotal(res.data.total);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, total, loading, error, refetch: fetchData };
}
