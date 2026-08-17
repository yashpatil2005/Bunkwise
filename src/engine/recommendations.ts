import { AttendanceRecord, ScheduledLecture, LectureRecommendation, RecommendationType } from '../types/index';
import { analyzeCourse, calculateAfterBunk, calculateAfterAttend } from './attendance';

/**
 * Generates student-friendly explanation text.
 */
function generateExplanation(
  recommendation: RecommendationType,
  safeBunks: number,
  recoveryLectures: number,
  percentage: number,
  threshold: number,
): string {
  switch (recommendation) {
    case 'BUNKABLE':
      return safeBunks > 2
        ? `You're safe here. ${safeBunks} bunks to spare.`
        : 'You have some breathing room.';
    case 'CAUTION':
      return "Don't push your luck. One slip and you're below the line.";
    case 'ATTEND':
      if (percentage < threshold) {
        return 'This one matters. Your attendance needs work.';
      }
      return 'No safe bunks left. Better show up.';
    case 'RECOVER':
      return recoveryLectures > 0
        ? `Attendance is getting ugly. Need ${recoveryLectures} straight classes to recover.`
        : 'Recover before you bunk.';
    default:
      return 'Stay on top of your attendance.';
  }
}

/**
 * Generates a recommendation for a single lecture.
 * CRITICAL: Never labels a lecture BUNKABLE if skipping drops below threshold.
 */
export function getRecommendation(
  lecture: ScheduledLecture,
  attendance: AttendanceRecord | undefined,
  threshold: number,
): LectureRecommendation {
  // No attendance data — recommend attending
  if (!attendance || attendance.total === 0) {
    return {
      lecture,
      attendance,
      recommendation: 'ATTEND',
      riskScore: 50,
      projectedAttendanceIfAttended: attendance ? calculateAfterAttend(attendance.present, attendance.total) : 0,
      projectedAttendanceIfAbsent: attendance ? calculateAfterBunk(attendance.present, attendance.total) : 0,
      explanation: 'No attendance data yet. Better to attend.',
    };
  }

  const analysis = analyzeCourse(attendance, threshold);
  const projectedIfBunk = calculateAfterBunk(attendance.present, attendance.total);
  const projectedIfAttend = calculateAfterAttend(attendance.present, attendance.total);

  let recommendation: RecommendationType = 'ATTEND';

  if (analysis.percentage < threshold - 15) {
    recommendation = 'RECOVER';
  } else if (analysis.percentage < threshold || projectedIfBunk < threshold) {
    // Already below or would drop below — must attend
    recommendation = 'ATTEND';
  } else if (projectedIfBunk >= threshold + 5) {
    // Comfortable buffer even after bunk
    recommendation = 'BUNKABLE';
  } else {
    // Above threshold but tight after bunk
    recommendation = 'CAUTION';
  }

  // CRITICAL SAFETY CHECK: Never label BUNKABLE if bunk drops below threshold
  if (recommendation === 'BUNKABLE' && projectedIfBunk < threshold) {
    recommendation = 'ATTEND';
  }

  return {
    lecture,
    attendance,
    analysis,
    recommendation,
    riskScore: analysis.riskScore,
    projectedAttendanceIfAttended: projectedIfAttend,
    projectedAttendanceIfAbsent: projectedIfBunk,
    explanation: generateExplanation(
      recommendation,
      analysis.safeBunks,
      analysis.recoveryLectures,
      analysis.percentage,
      threshold,
    ),
  };
}

/**
 * Finds the best (lowest risk) lecture to skip.
 */
export function getBestBunkOpportunity(
  lectures: ScheduledLecture[],
  attendanceMap: Map<string, AttendanceRecord>,
  threshold: number,
): LectureRecommendation | null {
  if (lectures.length === 0) return null;

  let best: LectureRecommendation | null = null;
  let lowestRisk = Infinity;

  for (const lecture of lectures) {
    if (!lecture || !lecture.courseCode) continue;
    const attendance = attendanceMap.get(lecture.courseCode);
    if (!attendance || attendance.total === 0) continue;

    const rec = getRecommendation(lecture, attendance, threshold);

    if (rec && typeof rec.riskScore === 'number' && rec.riskScore < lowestRisk) {
      lowestRisk = rec.riskScore;
      best = rec;
    }
  }

  return best;
}
