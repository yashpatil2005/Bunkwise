import React, { useMemo } from 'react';
import type { AttendanceRecord, ScheduledLecture } from '../../types/index';
import { getRecommendation, getBestBunkOpportunity } from '../../engine/recommendations';
import { getDateLabel, isToday } from '../../utils/format';
import { StatusBadge } from './StatusBadge';
import { EmptyState } from './EmptyState';

interface ScheduleScreenProps {
  attendance: AttendanceRecord[];
  schedule: ScheduledLecture[];
  threshold: number;
  onCourseClick: (code: string) => void;
}

export function ScheduleScreen({ attendance, schedule, threshold, onCourseClick }: ScheduleScreenProps) {
  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    for (const r of attendance) map.set(r.courseCode, r);
    return map;
  }, [attendance]);

  // Group lectures by date
  const groupedLectures = useMemo(() => {
    const groups = new Map<string, ScheduledLecture[]>();
    for (const lecture of schedule) {
      const existing = groups.get(lecture.date) || [];
      existing.push(lecture);
      groups.set(lecture.date, existing);
    }
    return Array.from(groups.entries());
  }, [schedule]);

  // Best bunk opportunity
  const bestBunk = useMemo(() => {
    return getBestBunkOpportunity(schedule, attendanceMap, threshold);
  }, [schedule, attendanceMap, threshold]);

  if (schedule.length === 0) {
    return <EmptyState type="no-schedule" />;
  }

  return (
    <div>
      {/* Best Bunk Opportunity */}
      {bestBunk && (bestBunk.recommendation === 'BUNKABLE' || bestBunk.recommendation === 'CAUTION') && (
        <div className="best-bunk-card">
          <div className="best-bunk-label">Best Bunk Opportunity</div>
          <div className="best-bunk-course">{bestBunk.lecture.courseName}</div>
          <div className="best-bunk-time">
            {bestBunk.lecture.date} · {bestBunk.lecture.startTime}
          </div>
          <div className="best-bunk-footer">
            <span style={{ color: 'var(--text-secondary)' }}>
              {bestBunk.projectedAttendanceIfAbsent.toFixed(1)}% after bunk
            </span>
            <StatusBadge type={bestBunk.recommendation} />
          </div>
          {bestBunk.projectedAttendanceIfAbsent < threshold && (
            <p style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--status-amber)',
              marginTop: '8px',
              fontStyle: 'italic',
            }}>
              ⚠️ Actually not safe — drops below {threshold}% threshold.
            </p>
          )}
        </div>
      )}

      {/* Grouped lectures */}
      {groupedLectures.map(([date, lectures]) => (
        <div key={date} className="date-group">
          <div className={`date-label ${isToday(date) ? 'date-label-today' : ''}`}>
            {isToday(date) && <span className="today-dot" />}
            {getDateLabel(date)}
          </div>

          {lectures.map((lecture, i) => {
            const record = attendanceMap.get(lecture.courseCode);
            const rec = getRecommendation(lecture, record, threshold);
            const pct = record && record.total > 0
              ? (record.present / record.total * 100).toFixed(1)
              : '—';

            return (
              <div
                key={`${lecture.courseCode}-${i}`}
                className="card card-interactive lecture-card"
                onClick={() => onCourseClick(lecture.courseCode)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onCourseClick(lecture.courseCode)}
              >
                <div className="lecture-info">
                  <div className="lecture-time">
                    {lecture.startTime} – {lecture.endTime}
                  </div>
                  <div className="lecture-name">{lecture.courseName}</div>
                  <div className="lecture-explanation">{rec.explanation}</div>
                </div>
                <div className="lecture-right">
                  <span className="lecture-percentage">{pct}%</span>
                  <StatusBadge type={rec.recommendation} />
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
