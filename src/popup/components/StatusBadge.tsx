import React from 'react';
import type { RecommendationType } from '../../types/index';

interface StatusBadgeProps {
  type: RecommendationType;
}

const badgeConfig: Record<RecommendationType, { label: string; className: string }> = {
  ATTEND: { label: 'Attend', className: 'badge-attend' },
  BUNKABLE: { label: 'Bunkable', className: 'badge-bunkable' },
  CAUTION: { label: 'Caution', className: 'badge-caution' },
  RECOVER: { label: 'Recover', className: 'badge-recover' },
};

export function StatusBadge({ type }: StatusBadgeProps) {
  const config = badgeConfig[type] || badgeConfig.ATTEND;
  return (
    <span className={`badge ${config.className}`}>
      <span className="badge-dot" aria-hidden="true" />
      {config.label}
    </span>
  );
}

interface CourseStatusBadgeProps {
  status: 'HEALTHY' | 'CAUTION' | 'CRITICAL' | 'RECOVER' | 'NO_DATA';
}

const courseStatusConfig: Record<string, { label: string; className: string }> = {
  HEALTHY: { label: 'Healthy', className: 'badge-bunkable' },
  CAUTION: { label: 'Caution', className: 'badge-caution' },
  CRITICAL: { label: 'Critical', className: 'badge-attend' },
  RECOVER: { label: 'Recover', className: 'badge-recover' },
  NO_DATA: { label: 'No Data', className: 'badge-caution' },
};

export function CourseStatusBadge({ status }: CourseStatusBadgeProps) {
  const config = courseStatusConfig[status] || courseStatusConfig.NO_DATA;
  return (
    <span className={`badge ${config.className}`}>
      <span className="badge-dot" aria-hidden="true" />
      {config.label}
    </span>
  );
}
