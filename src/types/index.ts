// ─── Attendance Data ─────────────────────────────────────────────

export interface AttendanceRecord {
  courseCode: string;
  courseName: string;
  facultyName: string;
  present: number;
  absent: number;
  leaves: number;
  notEntered: number;
  total: number;
  percentage: number;
}

// ─── Schedule Data ───────────────────────────────────────────────

export interface ScheduledLecture {
  date: string;         // e.g. "Aug 17, 2026"
  startTime: string;    // e.g. "12:45 PM"
  endTime: string;      // e.g. "01:45 PM"
  session: string;      // e.g. "Session 19"
  courseCode: string;
  courseName: string;
  facultyName: string;
  roomName?: string;
}

// ─── Analysis ────────────────────────────────────────────────────

export interface CourseAnalysis {
  record: AttendanceRecord;
  percentage: number;
  safeBunks: number;
  recoveryLectures: number;
  riskScore: number;
  projectedAfterBunk: number;
  projectedAfterAttend: number;
  status: CourseStatus;
}

export type CourseStatus = 'HEALTHY' | 'CAUTION' | 'CRITICAL' | 'RECOVER' | 'NO_DATA';

// ─── Recommendations ─────────────────────────────────────────────

export type RecommendationType = 'ATTEND' | 'BUNKABLE' | 'CAUTION' | 'RECOVER';

export interface LectureRecommendation {
  lecture: ScheduledLecture;
  attendance?: AttendanceRecord;
  analysis?: CourseAnalysis;
  recommendation: RecommendationType;
  riskScore: number;
  projectedAttendanceIfAttended: number;
  projectedAttendanceIfAbsent: number;
  explanation: string;
}

// ─── Simulator ───────────────────────────────────────────────────

export interface SimulationCourseResult {
  courseCode: string;
  courseName: string;
  currentPresent: number;
  currentTotal: number;
  currentPercentage: number;
  projectedPresent: number;
  projectedTotal: number;
  projectedPercentage: number;
  additionalAbsences: number;
  belowThreshold: boolean;
  wasBelowThreshold: boolean;
}

export interface SimulationResult {
  courseResults: SimulationCourseResult[];
  overallCurrentPercentage: number;
  overallProjectedPercentage: number;
  verdict: SimulationVerdict;
  verdictExplanation: string;
}

export type SimulationVerdict = 'SAFE' | 'RISKY' | 'DANGEROUS' | 'CATASTROPHIC';

// ─── Settings ────────────────────────────────────────────────────

export interface Settings {
  threshold: number;          // 0.75 default
  appearance: AppearanceMode;
  devMode: boolean;
}

export type AppearanceMode = 'system' | 'light' | 'dark';

// ─── App State ───────────────────────────────────────────────────

export type NavigationTab = 'overview' | 'schedule' | 'courses' | 'bunkmode';

export interface AppData {
  attendance: AttendanceRecord[];
  schedule: ScheduledLecture[];
  lastUpdated: string | null;
}

export type DataSourceType = 'ERP_LIVE' | 'SAMPLE_DATA' | 'CACHED';

export interface DataStatus {
  source: DataSourceType;
  hasAttendance: boolean;
  hasSchedule: boolean;
  isOnErp: boolean;
  error?: string;
}

// ─── Chrome Messages ─────────────────────────────────────────────

export type MessageType =
  | 'GET_ATTENDANCE'
  | 'GET_SCHEDULE'
  | 'GET_ALL_DATA'
  | 'PAGE_INFO'
  | 'PING';

export interface ChromeMessage {
  type: MessageType;
}

export interface ChromeResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  pageType?: 'attendance' | 'schedule' | 'other' | 'unknown';
}
