import { AttendanceRecord, ScheduledLecture, SimulationResult, SimulationCourseResult, SimulationVerdict } from '../types/index';
import { calculateAttendance } from './attendance';

/**
 * Simulates the effect of skipping selected lectures.
 * Pure function — never mutates input data.
 */
export function simulateBunks(
  selectedLectures: ScheduledLecture[],
  attendanceMap: Map<string, AttendanceRecord>,
  threshold: number,
): SimulationResult {
  // Count absences per course
  const absenceCount = new Map<string, number>();
  for (const lecture of selectedLectures) {
    if (!lecture || !lecture.courseCode) continue;
    absenceCount.set(
      lecture.courseCode,
      (absenceCount.get(lecture.courseCode) ?? 0) + 1,
    );
  }

  // Calculate overall current
  let totalPresent = 0;
  let totalTotal = 0;
  for (const record of attendanceMap.values()) {
    totalPresent += record.present;
    totalTotal += record.total;
  }
  const overallCurrentPercentage = calculateAttendance(totalPresent, totalTotal);

  // Build course results
  const courseResults: SimulationCourseResult[] = [];
  let projectedTotalPresent = totalPresent;
  let projectedTotalTotal = totalTotal;

  for (const [courseCode, count] of absenceCount.entries()) {
    const record = attendanceMap.get(courseCode);
    if (!record) continue;

    const currentPercentage = calculateAttendance(record.present, record.total);
    const projectedTotal = record.total + count;
    const projectedPercentage = calculateAttendance(record.present, projectedTotal);
    const wasBelowThreshold = currentPercentage < threshold;
    const belowThreshold = projectedPercentage < threshold;

    courseResults.push({
      courseCode,
      courseName: record.courseName,
      currentPresent: record.present,
      currentTotal: record.total,
      currentPercentage,
      projectedPresent: record.present,
      projectedTotal,
      projectedPercentage,
      additionalAbsences: count,
      belowThreshold,
      wasBelowThreshold,
    });

    // Update projected overall totals
    projectedTotalTotal += count;
  }

  projectedTotalPresent = totalPresent; // Present stays same
  const overallProjectedPercentage = calculateAttendance(projectedTotalPresent, projectedTotalTotal);

  // Determine verdict
  const newlyBelow = courseResults.filter(r => !r.wasBelowThreshold && r.belowThreshold);
  const worsenedCritical = courseResults.filter(r => r.wasBelowThreshold && r.projectedPercentage < r.currentPercentage);

  let verdict: SimulationVerdict = 'SAFE';
  let verdictExplanation = '';

  if (newlyBelow.length > 1 || (newlyBelow.length >= 1 && worsenedCritical.length >= 1)) {
    verdict = 'CATASTROPHIC';
    verdictExplanation = 'Bad idea. Multiple courses will fall below the threshold.';
  } else if (newlyBelow.length === 1) {
    verdict = 'DANGEROUS';
    verdictExplanation = `This pushes ${newlyBelow[0].courseName} below the threshold. Think twice.`;
  } else if (worsenedCritical.length > 0) {
    verdict = 'DANGEROUS';
    verdictExplanation = `You're already below threshold in ${worsenedCritical.length} course${worsenedCritical.length > 1 ? 's' : ''}. Don't dig a deeper hole.`;
  } else if (courseResults.length > 0) {
    // Check if any course gets dangerously close
    const closeToThreshold = courseResults.some(r => {
      return !r.belowThreshold && r.projectedPercentage < threshold + 3;
    });
    if (closeToThreshold) {
      verdict = 'RISKY';
      verdictExplanation = "You'll survive, but it's cutting it close.";
    } else {
      verdict = 'SAFE';
      verdictExplanation = 'You can probably skip these. Your attendance can handle it.';
    }
  } else {
    verdict = 'SAFE';
    verdictExplanation = 'No matching attendance data found for selected lectures.';
  }

  return {
    courseResults,
    overallCurrentPercentage,
    overallProjectedPercentage,
    verdict,
    verdictExplanation,
  };
}
