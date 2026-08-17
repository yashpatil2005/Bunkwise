import React, { useMemo } from 'react';
import { ChevronLeft } from 'lucide-react';
import type { AttendanceRecord, ScheduledLecture } from '../../types/index';
import { analyzeCourse } from '../../engine/attendance';
import { getRecommendation } from '../../engine/recommendations';
import { ProgressBar } from './ProgressBar';
import { CourseStatusBadge, StatusBadge } from './StatusBadge';

interface CourseDetailProps {
  courseCode: string;
  attendance: AttendanceRecord[];
  schedule: ScheduledLecture[];
  threshold: number;
  onBack: () => void;
}

export function CourseDetail({ courseCode, attendance, schedule, threshold, onBack }: CourseDetailProps) {
  const record = attendance.find(a => a.courseCode === courseCode);

  const analysis = useMemo(() => {
    if (!record) return null;
    return analyzeCourse(record, threshold);
  }, [record, threshold]);

  const upcomingLectures = useMemo(() => {
    return schedule.filter(l => l.courseCode === courseCode);
  }, [schedule, courseCode]);

  if (!record) {
    return (
      <div className="detail-overlay">
        <div className="detail-header">
          <button className="back-btn" onClick={onBack} aria-label="Go back">
            <ChevronLeft size={20} />
          </button>
          <span className="detail-title">Course Not Found</span>
        </div>
        <div className="detail-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-tertiary)' }}>No data found for {courseCode}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-overlay">
      <div className="detail-header">
        <button className="back-btn" onClick={onBack} aria-label="Go back">
          <ChevronLeft size={20} />
        </button>
        <span className="detail-title">{record.courseName}</span>
      </div>

      <div className="detail-content">
        {/* Big Percentage */}
        <div className="detail-big-number" style={{
          color: analysis && analysis.percentage >= threshold ? 'var(--status-green)'
            : 'var(--status-red)',
        }}>
          {record.total > 0 ? `${analysis!.percentage.toFixed(1)}%` : '—'}
        </div>

        {/* Status Badge */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          {analysis && <CourseStatusBadge status={analysis.status} />}
        </div>

        {/* Progress Bar */}
        {record.total > 0 && (
          <ProgressBar value={analysis!.percentage} threshold={threshold} size="md" />
        )}

        {/* Course Code */}
        <div style={{ textAlign: 'center', marginTop: '4px', marginBottom: '20px' }}>
          <span className="course-code">{record.courseCode}</span>
        </div>

        {/* Details Grid */}
        <div className="detail-section">
          <div className="detail-section-title">Details</div>
          <div className="detail-grid">
            <div className="detail-stat">
              <div className="detail-stat-label">Present</div>
              <div className="detail-stat-value">{record.present}</div>
            </div>
            <div className="detail-stat">
              <div className="detail-stat-label">Absent</div>
              <div className="detail-stat-value">{record.absent}</div>
            </div>
            <div className="detail-stat">
              <div className="detail-stat-label">Total</div>
              <div className="detail-stat-value">{record.total}</div>
            </div>
            <div className="detail-stat">
              <div className="detail-stat-label">Leaves</div>
              <div className="detail-stat-value">{record.leaves}</div>
            </div>
            {record.notEntered > 0 && (
              <div className="detail-stat">
                <div className="detail-stat-label">Not Entered</div>
                <div className="detail-stat-value">{record.notEntered}</div>
              </div>
            )}
            {record.facultyName && (
              <div className="detail-stat">
                <div className="detail-stat-label">Faculty</div>
                <div className="detail-stat-value" style={{ fontSize: 'var(--text-xs)' }}>
                  {record.facultyName}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Projections */}
        {analysis && record.total > 0 && (
          <div className="detail-section">
            <div className="detail-section-title">Projections</div>
            <div className="detail-grid">
              <div className="detail-stat">
                <div className="detail-stat-label">After 1 Absence</div>
                <div className="detail-stat-value" style={{
                  color: analysis.projectedAfterBunk < threshold ? 'var(--status-red)' : 'var(--text-primary)',
                }}>
                  {analysis.projectedAfterBunk.toFixed(1)}%
                </div>
              </div>
              <div className="detail-stat">
                <div className="detail-stat-label">After 1 Attend</div>
                <div className="detail-stat-value" style={{
                  color: 'var(--status-green)',
                }}>
                  {analysis.projectedAfterAttend.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recovery Info */}
        {analysis && record.total > 0 && (
          <div className="detail-section">
            <div className="detail-section-title">Recovery</div>
            <div className="detail-grid">
              <div className="detail-stat">
                <div className="detail-stat-label">Safe Bunks</div>
                <div className="detail-stat-value" style={{
                  color: analysis.safeBunks === 0 ? 'var(--status-red)' : 'var(--status-green)',
                }}>
                  {analysis.safeBunks}
                </div>
              </div>
              <div className="detail-stat">
                <div className="detail-stat-label">To Recover</div>
                <div className="detail-stat-value" style={{
                  color: analysis.recoveryLectures > 0 ? 'var(--status-red)' : 'var(--status-green)',
                }}>
                  {analysis.recoveryLectures > 0
                    ? `${analysis.recoveryLectures} lectures`
                    : 'Not needed'}
                </div>
              </div>
            </div>
            {analysis.safeBunks === 0 && analysis.percentage >= threshold && (
              <p style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--status-amber)',
                marginTop: '8px',
                fontStyle: 'italic',
              }}>
                Be careful: One absence would drop you below {threshold}%.
              </p>
            )}
          </div>
        )}

        {/* Upcoming Lectures */}
        <div className="detail-section">
          <div className="detail-section-title">
            Upcoming Lectures ({upcomingLectures.length})
          </div>
          {upcomingLectures.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
              No upcoming lectures scheduled.
            </p>
          ) : (
            upcomingLectures.map((lecture, i) => {
              const rec = getRecommendation(lecture, record, threshold);
              return (
                <div key={i} className="card" style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="lecture-time">{lecture.date}</div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                        {lecture.startTime} – {lecture.endTime}
                      </div>
                    </div>
                    <StatusBadge type={rec.recommendation} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
