/* UI context — controls global UI state like cart drawer open/close */
import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';

const UIContext = createContext();

export const useUI = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within a UIProvider');
  return ctx;
};

export const UIProvider = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen(prev => !prev), []);
  const clearSearch = useCallback(() => setSearchQuery(''), []);

  const value = useMemo(() => ({
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
    searchQuery,
    setSearchQuery,
    clearSearch,
  }), [isCartOpen, openCart, closeCart, toggleCart, searchQuery, clearSearch]);

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};
