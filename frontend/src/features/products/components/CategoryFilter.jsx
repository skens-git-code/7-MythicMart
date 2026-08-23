import React from 'react';
import { CATEGORIES } from '../../../utils/constants';
import '../../../styles/CategoryFilter.css';

const CategoryFilter = ({ activeCategory, onCategoryChange }) => {
  return (
    <div 
      className="category-filter-container" 
      role="tablist" 
      aria-label="Filter products by category"
    >
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            type="button"
            key={cat.id}
            role="tab"
            aria-selected={isActive}
            className={`category-pill ${isActive ? 'active' : ''}`}
            onClick={() => onCategoryChange(cat.id)}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
