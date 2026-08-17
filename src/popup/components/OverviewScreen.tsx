import React, { useMemo } from 'react';
import type { AttendanceRecord, ScheduledLecture } from '../../types/index';
import { calculateOverallAttendance, analyzeCourse, calculateSafeBunks } from '../../engine/attendance';
import { getRecommendation } from '../../engine/recommendations';
import { getGreeting, isToday } from '../../utils/format';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';

interface OverviewScreenProps {
  attendance: AttendanceRecord[];
  schedule: ScheduledLecture[];
  threshold: number;
  onCourseClick: (code: string) => void;
}

export function OverviewScreen({ attendance, schedule, threshold, onCourseClick }: OverviewScreenProps) {
  const overall = calculateOverallAttendance(attendance);

  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    for (const r of attendance) map.set(r.courseCode, r);
    return map;
  }, [attendance]);

  const stats = useMemo(() => {
    let atRisk = 0;
    let totalSafeBunks = 0;
    for (const record of attendance) {
      if (record.total > 0) {
        const analysis = analyzeCourse(record, threshold);
        if (analysis.status === 'CRITICAL' || analysis.status === 'RECOVER') atRisk++;
        totalSafeBunks += analysis.safeBunks;
      }
    }
    return { atRisk, safeBunks: totalSafeBunks, upcoming: schedule.length };
  }, [attendance, threshold, schedule]);

  const todayLectures = useMemo(() => {
    return schedule.filter(l => isToday(l.date));
  }, [schedule]);

  return (
    <div>
      {/* Greeting */}
      <p className="overview-greeting">{getGreeting()}</p>
      <p className="overview-subtitle">Here's your attendance situation.</p>

      {/* Overall Attendance */}
      <div className="card overall-card">
        <div className="overall-percentage">{overall.toFixed(1)}%</div>
        <div className="overall-label">Overall Attendance</div>
        <ProgressBar value={overall} threshold={threshold} />
        <div className="overall-footer">
          <span>Required {threshold}%</span>
          <span className={`overall-status ${overall >= threshold ? 'above' : 'below'}`}>
            {overall >= threshold ? 'Above target' : 'Below required attendance'}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-item">
          <span className="stat-value">{stats.atRisk}</span>
          <span className="stat-label">At-Risk</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.safeBunks}</span>
          <span className="stat-label">Safe Bunks</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.upcoming}</span>
          <span className="stat-label">Upcoming</span>
        </div>
      </div>

      {/* Today's Lectures */}
      <div className="section-header">
        <span className="section-title">Today</span>
      </div>

      {todayLectures.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '24px 16px' }}>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
            No lectures scheduled for today. Enjoy! ✌️
          </p>
        </div>
      ) : (
        todayLectures.map((lecture, i) => {
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
                <div className="lecture-time">{lecture.startTime}</div>
                <div className="lecture-name">{lecture.courseName}</div>
                <div className="lecture-meta">
                  {lecture.facultyName && <span>{lecture.facultyName}</span>}
                </div>
              </div>
              <div className="lecture-right">
                <span className="lecture-percentage">{pct}%</span>
                <StatusBadge type={rec.recommendation} />
              </div>
            </div>
          );
        })
      )}

      {/* Footer */}
      <p style={{
        textAlign: 'center',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-tertiary)',
        marginTop: '20px',
      }}>
        {attendance.filter(a => a.total > 0).length} courses analyzed
      </p>
    </div>
  );
}
