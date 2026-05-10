/* Custom hook for debounced search filtering */
import { useMemo, useState, useEffect } from 'react';

const DEFAULT_SEARCH_KEYS = ['name', 'description'];

export const useSearch = (items, searchKeys = DEFAULT_SEARCH_KEYS, delay = 300) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  /* Debounce the search query */
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, delay);

    return () => clearTimeout(handler);
  }, [searchQuery, delay]);

  const filteredItems = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return items;
    }

    const query = debouncedQuery.toLowerCase();
    return items.filter(item => {
      return searchKeys.some(key => {
        const value = item[key];
        return value && String(value).toLowerCase().includes(query);
      });
    });
  }, [debouncedQuery, items, searchKeys]);

  return {
    searchQuery,
    setSearchQuery,
    filteredItems,
    isSearching: searchQuery !== debouncedQuery
  };
};
