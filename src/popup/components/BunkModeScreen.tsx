import React, { useState, useMemo } from 'react';
import { Check } from 'lucide-react';
import type { AttendanceRecord, ScheduledLecture } from '../../types/index';
import { simulateBunks } from '../../engine/simulator';
import { calculateAttendance } from '../../engine/attendance';
import { EmptyState } from './EmptyState';

interface BunkModeScreenProps {
  attendance: AttendanceRecord[];
  schedule: ScheduledLecture[];
  threshold: number;
}

export function BunkModeScreen({ attendance, schedule, threshold }: BunkModeScreenProps) {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    for (const r of attendance) map.set(r.courseCode, r);
    return map;
  }, [attendance]);

  const toggleSelection = (index: number) => {
    setSelectedIndices(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const simulation = useMemo(() => {
    if (selectedIndices.size === 0) return null;
    const selected = Array.from(selectedIndices)
      .map(i => schedule[i])
      .filter((l): l is ScheduledLecture => Boolean(l && l.courseCode));
    if (selected.length === 0) return null;
    return simulateBunks(selected, attendanceMap, threshold);
  }, [selectedIndices, schedule, attendanceMap, threshold]);

  if (schedule.length === 0) {
    return <EmptyState type="no-schedule" />;
  }

  const verdictTitles: Record<string, string> = {
    SAFE: "You're good",
    RISKY: 'Cutting it close',
    DANGEROUS: 'Not recommended',
    CATASTROPHIC: 'Terrible idea',
  };

  return (
    <div>
      {/* Header */}
      <div className="bunk-header">
        <h2 className="bunk-title">Bunk Simulator</h2>
        <p className="bunk-subtitle">See what you can skip without screwing yourself over.</p>
      </div>

      {/* Lecture Selector */}
      <div className="lecture-selector">
        {schedule.map((lecture, index) => {
          const isSelected = selectedIndices.has(index);
          const record = attendanceMap.get(lecture.courseCode);
          const pct = record && record.total > 0
            ? calculateAttendance(record.present, record.total).toFixed(1) + '%'
            : '—';

          return (
            <div
              key={`${lecture.courseCode}-${index}`}
              className={`selector-item ${isSelected ? 'selected' : ''}`}
              onClick={() => toggleSelection(index)}
              role="checkbox"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && toggleSelection(index)}
            >
              <div className="selector-checkbox">
                {isSelected && <Check size={12} strokeWidth={3} />}
              </div>
              <div className="selector-info">
                <div className="selector-course">{lecture.courseName}</div>
                <div className="selector-meta">
                  {lecture.date} · {lecture.startTime}
                </div>
              </div>
              <span className="selector-attendance" style={{
                color: record && record.total > 0
                  ? calculateAttendance(record.present, record.total) < threshold
                    ? 'var(--status-red)'
                    : 'var(--text-secondary)'
                  : 'var(--text-tertiary)',
              }}>
                {pct}
              </span>
            </div>
          );
        })}
      </div>

      {/* Simulation Results */}
      {simulation && (
        <div className="sim-results">
          <div className="section-header" style={{ marginTop: '16px' }}>
            <span className="section-title">Projected Impact</span>
          </div>

          <div className="card">
            {simulation.courseResults.map(result => (
              <div key={result.courseCode} className="sim-course">
                <span className="sim-course-name">{result.courseName}</span>
                <div className="sim-projection">
                  <span>{result.currentPercentage.toFixed(1)}%</span>
                  <span className="sim-arrow">→</span>
                  <span style={{
                    color: result.belowThreshold ? 'var(--status-red)'
                      : result.projectedPercentage < threshold + 3 ? 'var(--status-amber)'
                      : 'var(--status-green)',
                    fontWeight: 600,
                  }}>
                    {result.projectedPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Verdict */}
          <div className={`sim-verdict ${simulation.verdict.toLowerCase()}`}>
            <div className="sim-verdict-title">
              {verdictTitles[simulation.verdict] || simulation.verdict}
            </div>
            <div className="sim-verdict-text">{simulation.verdictExplanation}</div>
          </div>
        </div>
      )}
    </div>
  );
}
