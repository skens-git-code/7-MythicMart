// components/StatsSection.jsx
import React, { useRef, useEffect, useState } from 'react';
import { Users, Tag, Headphones } from 'lucide-react';
import '../../styles/StatsSection.css';

// Custom hook for intersection observer
const useIntersectionObserver = (ref, options = { threshold: 0.1 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [ref, options]);

  return isVisible;
};

const StatsSection = ({
  stats = [
    { id: 'customers', value: '50k+', label: 'Happy Customers', icon: Users },
    { id: 'brands', value: '200+', label: 'Premium Brands', icon: Tag },
    { id: 'support', value: '24/7', label: 'Support System', icon: Headphones },
  ],
  iconSize = 24,
  className = '',
  animate = true,
}) => {
  const sectionRef = useRef(null);
  const isVisible = useIntersectionObserver(sectionRef);

  return (
    <section
      ref={sectionRef}
      className={`stats-section ${className} ${animate && isVisible ? 'stats-visible' : ''}`}
      aria-label="Platform statistics"
    >
      {stats.map((stat) => (
        <div key={stat.id} className="glass-stat" role="group" aria-label={`${stat.value} ${stat.label}`}>
          <div className="stat-icon-wrapper">
            <stat.icon size={iconSize} strokeWidth={1.5} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stat.value}</span>
            <p className="stat-label">{stat.label}</p>
          </div>
        </div>
      ))}
    </section>
  );
};

export default React.memo(StatsSection);