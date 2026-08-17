import { AttendanceRecord, CourseAnalysis, CourseStatus } from '../types/index';

/**
 * Calculates the percentage of attendance.
 * @returns Percentage rounded to 2 decimal places, or 0 if total is 0.
 */
export function calculateAttendance(present: number, total: number): number {
  if (total === 0) return 0;
  const pct = (present / total) * 100;
  return Number(Math.min(100, Math.max(0, pct)).toFixed(2));
}

/**
 * Calculates the maximum consecutive absences keeping attendance >= threshold.
 * Formula: floor(P/r - T). Never returns negative.
 * 
 * CRITICAL: 2/2 at 75% → floor(2/0.75 - 2) = floor(0.667) = 0
 */
export function calculateSafeBunks(present: number, total: number, threshold: number): number {
  if (total === 0 || threshold <= 0) return 0;
  const r = threshold / 100;
  const bunks = Math.floor(present / r - total);
  return Math.max(0, bunks);
}

/**
 * Calculates minimum lectures to attend to reach threshold.
 * Formula: ceil((rT - P) / (1-r)). Returns 0 if already at/above threshold.
 */
export function calculateRecoveryLectures(present: number, total: number, threshold: number): number {
  if (total === 0) return 0;
  const currentAttendance = calculateAttendance(present, total);
  if (currentAttendance >= threshold) return 0;
  const r = threshold / 100;
  if (r >= 1) return Infinity;
  const lectures = Math.ceil((r * total - present) / (1 - r));
  return Math.max(0, lectures);
}

/**
 * Projected attendance after one absence: P / (T+1) * 100
 */
export function calculateAfterBunk(present: number, total: number): number {
  return Number(((present / (total + 1)) * 100).toFixed(2));
}

/**
 * Projected attendance after one attend: (P+1) / (T+1) * 100
 */
export function calculateAfterAttend(present: number, total: number): number {
  return Number((((present + 1) / (total + 1)) * 100).toFixed(2));
}

/**
 * Overall attendance: sum(present) / sum(total) * 100
 * NOT the average of individual percentages.
 */
export function calculateOverallAttendance(records: AttendanceRecord[]): number {
  const sumPresent = records.reduce((acc, rec) => acc + rec.present, 0);
  const sumTotal = records.reduce((acc, rec) => acc + rec.total, 0);
  return calculateAttendance(sumPresent, sumTotal);
}

/**
 * Calculates a deterministic risk score (0–100).
 */
export function calculateRiskScore(percentage: number, safeBunks: number, recoveryLectures: number, threshold: number): number {
  if (percentage === 0 && safeBunks === 0 && recoveryLectures === 0) return 0; // NO_DATA

  let score = 50;

  if (percentage < threshold) {
    const gap = threshold - percentage;
    score = 60 + gap * 2;
  } else {
    const buffer = percentage - threshold;
    score = 40 - buffer;
  }

  if (safeBunks === 0) {
    score += 15;
  } else if (safeBunks > 3) {
    score -= 15;
  }

  if (recoveryLectures > 20) {
    score += 20;
  } else if (recoveryLectures > 10) {
    score += 10;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Full course analysis combining all metrics.
 */
export function analyzeCourse(record: AttendanceRecord, threshold: number): CourseAnalysis {
  const { present, total } = record;
  const percentage = calculateAttendance(present, total);
  const safeBunks = calculateSafeBunks(present, total, threshold);
  const recoveryLectures = calculateRecoveryLectures(present, total, threshold);
  const projectedAfterBunk = calculateAfterBunk(present, total);
  const projectedAfterAttend = calculateAfterAttend(present, total);

  let status: CourseStatus = 'NO_DATA';

  if (total === 0) {
    status = 'NO_DATA';
  } else if (percentage < threshold - 15) {
    status = 'RECOVER';
  } else if (percentage < threshold) {
    status = 'CRITICAL';
  } else if (safeBunks > 0) {
    status = 'HEALTHY';
  } else {
    status = 'CAUTION';
  }

  const riskScore = calculateRiskScore(percentage, safeBunks, recoveryLectures, threshold);

  return {
    record,
    percentage,
    safeBunks,
    recoveryLectures,
    riskScore,
    projectedAfterBunk,
    projectedAfterAttend,
    status,
  };
}
