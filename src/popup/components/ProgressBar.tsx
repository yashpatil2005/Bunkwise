import React from 'react';

interface ProgressBarProps {
  value: number;       // 0-100
  threshold?: number;  // 0-100, e.g. 75
  animated?: boolean;
  size?: 'sm' | 'md';
}

export function ProgressBar({ value, threshold, animated = true, size = 'sm' }: ProgressBarProps) {
  const safeValue = isNaN(value) || value == null ? 0 : value;
  const clampedValue = Math.min(100, Math.max(0, safeValue));
  const safeThreshold = isNaN(threshold as number) || threshold == null ? 75 : threshold;

  const fillClass = clampedValue >= safeThreshold
    ? ''
    : clampedValue >= safeThreshold - 10
      ? 'warning'
      : 'danger';

  return (
    <div className="overall-bar-container">
      <div
        className="progress-track"
        style={{ height: size === 'md' ? '8px' : '6px' }}
        role="progressbar"
        aria-valuenow={Math.round(clampedValue)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Attendance: ${clampedValue.toFixed(1)}%`}
      >
        <div
          className={`progress-fill ${fillClass}`}
          style={{
            width: `${clampedValue}%`,
            transition: animated ? undefined : 'none',
          }}
        />
      </div>
      {threshold !== undefined && !isNaN(threshold) && (
        <div
          className="threshold-marker"
          style={{ left: `${Math.min(100, Math.max(0, threshold))}%` }}
          title={`Required: ${threshold}%`}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
