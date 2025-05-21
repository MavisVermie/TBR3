import React from 'react';
import './StatsSection.css';

const stats = [
  { number: 29, label: 'شركات شريكة' },
  { number: 874, label: 'عدد الموظفين' },
  { number: '169k', label: 'عملاء' },
  { number: 265, label: 'نمو الموظفين' },
];

const StatsSection = () => {
  return (
    <section className="stats-section">
      {stats.map((stat, index) => (
        <div className="stat-box" key={index}>
          <div className="stat-number">{stat.number}</div>
          <div className="stat-label">{stat.label}</div>
        </div>
      ))}
    </section>
  );
};

export default StatsSection;

