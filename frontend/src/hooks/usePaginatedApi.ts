import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

interface UsePaginatedApiResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  search: string;
  refetch: () => void;
}

const PAGE_LIMIT = 20;

export function usePaginatedApi<T = any>(
  endpoint: string,
  limit = PAGE_LIMIT
): UsePaginatedApiResult<T> {
  const [page,       setPageState] = useState(1);
  const [search,     setSearchState] = useState('');
  const [data,       setData]      = useState<T[]>([]);
  const [total,      setTotal]     = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]   = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef   = useRef(search);
  searchRef.current = search;

  const fetchPage = useCallback((pg: number, srch: string) => {
    setLoading(true);
    const params = new URLSearchParams({
      page:  String(pg),
      limit: String(limit),
    });
    if (srch) params.set('search', srch);

    api.get<PaginatedResponse<T>>(`${endpoint}?${params}`)
      .then(res => {
        const d = res.data as any;
        setData(d.data   ?? []);
        setTotal(d.total ?? 0);
        setTotalPages(d.totalPages ?? 1);
      })
      .catch(() => {
        setData([]);
        setTotal(0);
        setTotalPages(1);
      })
      .finally(() => setLoading(false));
  }, [endpoint, limit]);

  // Fetch whenever page or search changes
  useEffect(() => {
    fetchPage(page, search);
  }, [page, fetchPage]); // search changes handled via debounce below

  const setPage = useCallback((pg: number) => {
    setPageState(pg);
  }, []);

  const setSearch = useCallback((s: string) => {
    setSearchState(s);
    // Debounce search: reset to page 1 and fetch after 350 ms
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPageState(1);
      fetchPage(1, s);
    }, 350);
  }, [fetchPage]);

  const refetch = useCallback(() => {
    fetchPage(page, searchRef.current);
  }, [page, fetchPage]);

  return { data, total, page, totalPages, loading, setPage, setSearch, search, refetch };
}
