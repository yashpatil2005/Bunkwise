import React from 'react';
import { FileSearch, Calendar, WifiOff, Inbox } from 'lucide-react';

type EmptyStateType = 'no-erp' | 'no-attendance' | 'no-schedule' | 'no-data' | 'no-lectures';

interface EmptyStateProps {
  type: EmptyStateType;
}

const states: Record<EmptyStateType, { icon: React.ReactNode; title: string; text: string }> = {
  'no-erp': {
    icon: <WifiOff size={48} />,
    title: 'ERP page not detected',
    text: 'Open the MGM University ERP Attendance or Schedule page, then reopen Bunkwise.',
  },
  'no-attendance': {
    icon: <FileSearch size={48} />,
    title: 'No attendance records found',
    text: 'Make sure the Attendance tab has finished loading on the ERP page.',
  },
  'no-schedule': {
    icon: <Calendar size={48} />,
    title: 'Schedule unavailable',
    text: 'Open the ERP Schedule tab to unlock lecture-level recommendations.',
  },
  'no-data': {
    icon: <Inbox size={48} />,
    title: 'No data available',
    text: 'Navigate to your ERP portal and open the Attendance or Schedule page.',
  },
  'no-lectures': {
    icon: <Calendar size={48} />,
    title: 'No upcoming lectures',
    text: 'No lectures scheduled for the coming days. Enjoy your free time!',
  },
};

export function EmptyState({ type }: EmptyStateProps) {
  const state = states[type];
  return (
    <div className="empty-state">
      <div className="empty-icon" aria-hidden="true">
        {state.icon}
      </div>
      <h3 className="empty-title">{state.title}</h3>
      <p className="empty-text">{state.text}</p>
    </div>
  );
}
