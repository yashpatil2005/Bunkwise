import { AttendanceRecord, ScheduledLecture } from '../types/index';

/**
 * Sample attendance records for development, testing, and fallback.
 */
export const SAMPLE_ATTENDANCE: AttendanceRecord[] = [
  { courseCode: 'ITY23PCL403', courseName: 'Advanced Database Management System', facultyName: 'Ms. Banani Adhikari', present: 3, absent: 4, leaves: 0, notEntered: 0, total: 7, percentage: 42.86 },
  { courseCode: 'ITY23PCP403', courseName: 'Advanced Database Management System Lab', facultyName: '', present: 0, absent: 1, leaves: 0, notEntered: 0, total: 1, percentage: 0 },
  { courseCode: 'ITY23PCL404', courseName: 'Advanced Web Programming', facultyName: '', present: 2, absent: 4, leaves: 0, notEntered: 0, total: 6, percentage: 33.33 },
  { courseCode: 'ITY23PCP404', courseName: 'Advanced Web Programming Lab', facultyName: '', present: 0, absent: 3, leaves: 0, notEntered: 0, total: 3, percentage: 0 },
  { courseCode: 'CSE21MDJ306', courseName: 'Capstone Project', facultyName: '', present: 0, absent: 3, leaves: 0, notEntered: 1, total: 4, percentage: 0 },
  { courseCode: 'ITY23PCL402', courseName: 'Cloud Computing', facultyName: '', present: 7, absent: 9, leaves: 0, notEntered: 0, total: 16, percentage: 43.75 },
  { courseCode: 'ITY23PCP402', courseName: 'Cloud Computing Lab', facultyName: 'Dr. Smita Avinash Thite-Ponde', present: 3, absent: 3, leaves: 0, notEntered: 1, total: 7, percentage: 50 },
  { courseCode: 'CSE21MDL305', courseName: 'Introduction to Machine Learning', facultyName: '', present: 2, absent: 0, leaves: 0, notEntered: 0, total: 2, percentage: 100 },
  { courseCode: 'ITY23RPJ401', courseName: 'Project', facultyName: '', present: 0, absent: 0, leaves: 0, notEntered: 0, total: 0, percentage: 0 },
  { courseCode: 'MGM07RML401', courseName: 'Research Methodology', facultyName: '', present: 14, absent: 12, leaves: 0, notEntered: 0, total: 26, percentage: 53.85 },
];

/**
 * Sample scheduled lectures for development, testing, and fallback.
 */
export const SAMPLE_SCHEDULE: ScheduledLecture[] = [
  { date: 'Aug 17, 2026', startTime: '12:45 PM', endTime: '01:45 PM', session: 'Session 19', courseCode: 'ITY23PCL403', courseName: 'Advanced Database Management System', facultyName: 'Ms. Banani Adhikari', roomName: '' },
  { date: 'Aug 17, 2026', startTime: '03:00 PM', endTime: '05:00 PM', session: 'Session 10', courseCode: 'ITY23PCP402', courseName: 'Cloud Computing Lab', facultyName: 'Dr. Smita Avinash Thite-Ponde', roomName: '' },
  { date: 'Aug 18, 2026', startTime: '10:00 AM', endTime: '11:00 AM', session: 'Session 37', courseCode: 'MGM07RML401', courseName: 'Research Methodology', facultyName: '', roomName: '' },
  { date: 'Aug 18, 2026', startTime: '11:00 AM', endTime: '12:00 PM', session: 'Session 38', courseCode: 'MGM07RML401', courseName: 'Research Methodology', facultyName: '', roomName: '' },
  { date: 'Aug 18, 2026', startTime: '12:45 PM', endTime: '01:45 PM', session: 'Session 19', courseCode: 'ITY23PCL402', courseName: 'Cloud Computing', facultyName: '', roomName: '' },
  { date: 'Aug 19, 2026', startTime: '07:45 AM', endTime: '09:45 AM', session: '', courseCode: 'ITY23PCP404', courseName: 'Advanced Web Programming Lab', facultyName: '', roomName: '' },
  { date: 'Aug 19, 2026', startTime: '10:00 AM', endTime: '11:00 AM', session: '', courseCode: 'ITY23PCL404', courseName: 'Advanced Web Programming', facultyName: '', roomName: '' },
  { date: 'Aug 19, 2026', startTime: '11:00 AM', endTime: '12:00 PM', session: '', courseCode: 'ITY23PCL403', courseName: 'Advanced Database Management System', facultyName: '', roomName: '' },
  { date: 'Aug 19, 2026', startTime: '12:45 PM', endTime: '02:45 PM', session: '', courseCode: 'ITY23PCP403', courseName: 'Advanced Database Management System Lab', facultyName: '', roomName: '' },
  { date: 'Aug 19, 2026', startTime: '03:00 PM', endTime: '05:00 PM', session: '', courseCode: 'ITY23RPJ401', courseName: 'Project', facultyName: '', roomName: '' },
  { date: 'Aug 20, 2026', startTime: '11:00 AM', endTime: '12:00 PM', session: '', courseCode: 'ITY23PCL404', courseName: 'Advanced Web Programming', facultyName: '', roomName: '' },
  { date: 'Aug 20, 2026', startTime: '12:45 PM', endTime: '01:45 PM', session: '', courseCode: 'MGM07RML401', courseName: 'Research Methodology', facultyName: '', roomName: '' },
  { date: 'Aug 20, 2026', startTime: '01:45 PM', endTime: '02:45 PM', session: '', courseCode: 'MGM07RML401', courseName: 'Research Methodology', facultyName: '', roomName: '' },
  { date: 'Aug 20, 2026', startTime: '03:00 PM', endTime: '05:00 PM', session: '', courseCode: 'CSE21MDL305', courseName: 'Introduction to Machine Learning', facultyName: '', roomName: '' },
  { date: 'Aug 20, 2026', startTime: '03:00 PM', endTime: '05:00 PM', session: '', courseCode: 'CSE21MDJ306', courseName: 'Capstone Project', facultyName: '', roomName: '' },
  { date: 'Aug 21, 2026', startTime: '03:00 PM', endTime: '05:00 PM', session: '', courseCode: 'CSE21MDJ306', courseName: 'Capstone Project', facultyName: '', roomName: '' },
  { date: 'Aug 22, 2026', startTime: '11:00 AM', endTime: '12:00 PM', session: '', courseCode: 'ITY23PCL402', courseName: 'Cloud Computing', facultyName: '', roomName: '' },
  { date: 'Aug 22, 2026', startTime: '12:45 PM', endTime: '02:45 PM', session: '', courseCode: 'ITY23RPJ401', courseName: 'Project', facultyName: '', roomName: '' },
  { date: 'Aug 22, 2026', startTime: '03:00 PM', endTime: '05:00 PM', session: '', courseCode: 'ITY23RPJ401', courseName: 'Project', facultyName: '', roomName: '' },
];
