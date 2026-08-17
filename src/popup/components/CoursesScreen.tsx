import React, { useMemo } from 'react';
import type { AttendanceRecord, ScheduledLecture } from '../../types/index';
import { analyzeCourse } from '../../engine/attendance';
import { ProgressBar } from './ProgressBar';
import { CourseStatusBadge } from './StatusBadge';

interface CoursesScreenProps {
  attendance: AttendanceRecord[];
  schedule: ScheduledLecture[];
  threshold: number;
  onCourseClick: (code: string) => void;
}

export function CoursesScreen({ attendance, threshold, onCourseClick }: CoursesScreenProps) {
  const analyzedCourses = useMemo(() => {
    return attendance
      .map(record => ({
        record,
        analysis: analyzeCourse(record, threshold),
      }))
      .sort((a, b) => {
        // Sort by status priority: RECOVER > CRITICAL > CAUTION > HEALTHY > NO_DATA
        const priority = { RECOVER: 0, CRITICAL: 1, CAUTION: 2, HEALTHY: 3, NO_DATA: 4 };
        return (priority[a.analysis.status] ?? 5) - (priority[b.analysis.status] ?? 5);
      });
  }, [attendance, threshold]);

  return (
    <div>
      {analyzedCourses.map(({ record, analysis }) => (
        <div
          key={record.courseCode}
          className="card card-interactive"
          onClick={() => onCourseClick(record.courseCode)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onCourseClick(record.courseCode)}
        >
          {/* Header */}
          <div className="course-card-header">
            <div>
              <div className="course-name">{record.courseName}</div>
              <div className="course-code">{record.courseCode}</div>
            </div>
            <div className="course-percentage" style={{
              color: analysis.status === 'HEALTHY' ? 'var(--status-green)'
                : analysis.status === 'CAUTION' ? 'var(--status-amber)'
                : analysis.status === 'NO_DATA' ? 'var(--text-tertiary)'
                : 'var(--status-red)',
            }}>
              {record.total > 0 ? `${analysis.percentage.toFixed(1)}%` : '—'}
            </div>
          </div>

          {/* Stats */}
          <div className="course-stats">
            <span><strong>{record.present}</strong> attended</span>
            <span>·</span>
            <span><strong>{record.absent}</strong> absent</span>
            <span>·</span>
            <span><strong>{record.total}</strong> total</span>
          </div>

          {/* Progress Bar */}
          {record.total > 0 && (
            <ProgressBar value={analysis.percentage} threshold={threshold} />
          )}

          {/* Metrics + Badge */}
          <div className="course-metrics">
            <div className="metric">
              <span className="metric-label">Safe Bunks</span>
              <span className={`metric-value ${analysis.safeBunks === 0 && record.total > 0 ? 'danger' : analysis.safeBunks > 0 ? 'success' : ''}`}>
                {record.total > 0 ? analysis.safeBunks : '—'}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Recovery</span>
              <span className={`metric-value ${analysis.recoveryLectures > 0 ? 'danger' : ''}`}>
                {analysis.recoveryLectures > 0
                  ? `${analysis.recoveryLectures} lecture${analysis.recoveryLectures !== 1 ? 's' : ''}`
                  : record.total > 0 ? 'Not needed' : '—'}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div style={{ marginTop: '12px' }}>
            <CourseStatusBadge status={analysis.status} />
          </div>
        </div>
      ))}
    </div>
  );
}
