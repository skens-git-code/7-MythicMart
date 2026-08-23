import React from 'react';
import { Users, Tag, Headphones } from 'lucide-react';
import '../../styles/StatsSection.css';

const stats = [
    { id: 'customers', value: '50k+', label: 'Happy Customers', icon: Users },
    { id: 'brands', value: '200+', label: 'Premium Brands', icon: Tag },
    { id: 'support', value: '24/7', label: 'Support System', icon: Headphones },
];

/* Platform stats row — glass cards showing key metrics */
const StatsSection = () => {
    return (
        <section className="stats-section" aria-label="Platform statistics">
            {stats.map((stat) => (
                <div key={stat.id} className="glass-stat" role="group" aria-label={`${stat.value} ${stat.label}`}>
                    <div className="stat-icon-wrapper">
                        <stat.icon size={24} strokeWidth={1.5} />
                    </div>
                    <div className="stat-content">
                        <h3>{stat.value}</h3>
                        <p>{stat.label}</p>
                    </div>
                </div>
            ))}
        </section>
    );
};

export default StatsSection;
