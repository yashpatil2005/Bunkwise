import React from 'react';
import { BarChart3, Calendar, BookOpen, Zap } from 'lucide-react';
import type { NavigationTab } from '../../types/index';

interface NavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

const tabs: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <BarChart3 size={20} /> },
  { id: 'schedule', label: 'Schedule', icon: <Calendar size={20} /> },
  { id: 'courses', label: 'Courses', icon: <BookOpen size={20} /> },
  { id: 'bunkmode', label: 'Bunk Mode', icon: <Zap size={20} /> },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="bottom-nav" role="tablist" aria-label="Main navigation">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          id={`tab-${tab.id}`}
        >
          <span className="nav-icon">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
