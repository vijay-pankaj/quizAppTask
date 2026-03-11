import { useState, useCallback } from "react";
import axios from "axios";

const usePagination = (url, { itemsPerPage = 6 } = {}) => {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const [meta, setMeta] = useState({
    currentPage:  1,
    totalPages:   1,
    totalItems:   0,
    itemsPerPage,
  });

  const fetchData = useCallback(async ({
    page      = meta.currentPage,
    limit     = itemsPerPage,
    search    = "",
    sortBy    = "",
    sortOrder = "asc",
  } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(url, {headers:{Authorization: `Bearer ${localStorage.getItem('token')}`}},{
        params: {
          page,
          limit,
          ...(search.trim()  && { search: search.trim() }),
          ...(sortBy.trim()  && { sortBy }),
          ...(sortOrder      && { sortOrder }),
        },
      });

      const d = res.data;
      setData(d.data ?? []);
      setMeta({
        currentPage:  d.pagination?.currentPage  ?? d.currentPage  ?? page,
        totalPages:   d.pagination?.totalPages   ?? d.pages        ?? 1,
        totalItems:   d.pagination?.totalItems   ?? d.total        ?? 0,
        itemsPerPage: limit,
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [url, itemsPerPage]);

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= meta.totalPages) {
      setMeta((prev) => ({ ...prev, currentPage: page }));
    }
  }, [meta.totalPages]);

  const pageNumbers = (() => {
    const { currentPage, totalPages } = meta;
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(totalPages, currentPage + delta);
      i++
    ) range.push(i);

    if (range[0] > 2)                             range.unshift("...");
    if (range[0] > 1)                             range.unshift(1);
    if (range[range.length - 1] < totalPages - 1) range.push("...");
    if (range[range.length - 1] < totalPages)     range.push(totalPages);

    return range;
  })();

  return {
    data,
    loading,
    error,
    currentPage:  meta.currentPage,
    totalPages:   meta.totalPages,
    totalItems:   meta.totalItems,
    itemsPerPage: meta.itemsPerPage,
    pageNumbers,
    hasPrev: meta.currentPage > 1,
    hasNext: meta.currentPage < meta.totalPages,
    fetchData,
    goToPage,
  };
};

export default usePagination;