import { AttendanceRecord } from '../types/index';

/**
 * Checks if the current page contains an attendance table
 */
export function isAttendancePage(): boolean {
  const tables = document.querySelectorAll('table');
  for (const table of Array.from(tables)) {
    const headerRow = table.querySelector('tr');
    if (!headerRow) continue;
    const text = headerRow.textContent?.toLowerCase() || '';
    if (text.includes('course code') && text.includes('present') && text.includes('percentage')) {
      return true;
    }
  }
  return false;
}

/**
 * Parses the attendance table from the MGM ERP page
 */
export function parseAttendanceTable(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const tables = document.querySelectorAll('table');

  let targetTable: HTMLTableElement | null = null;
  const headerMap: Record<string, number> = {};

  for (const table of Array.from(tables)) {
    const headerRow = table.querySelector('tr');
    if (!headerRow) continue;
    const text = headerRow.textContent?.toLowerCase() || '';
    if (text.includes('course code') && text.includes('present') && text.includes('percentage')) {
      targetTable = table;
      const ths = headerRow.querySelectorAll('th, td');
      ths.forEach((th, index) => {
        const title = th.textContent?.toLowerCase().trim().replace(/\s+/g, ' ') || '';
        headerMap[title] = index;
      });
      break;
    }
  }

  if (!targetTable) return records;

  // Helper to find header column index by priority matching
  const getIndex = (primaryKeywords: string[], fallbackKeywords: string[] = []) => {
    for (const [key, index] of Object.entries(headerMap)) {
      if (primaryKeywords.some(kw => key.includes(kw))) {
        return index;
      }
    }
    for (const [key, index] of Object.entries(headerMap)) {
      if (fallbackKeywords.some(kw => key.includes(kw))) {
        return index;
      }
    }
    return -1;
  };

  const courseCodeIdx = getIndex(['course code'], ['code']);
  const courseNameIdx = getIndex(['course name'], ['name']);
  const facultyNameIdx = getIndex(['faculty name'], ['faculty']);
  const presentCountIdx = getIndex(['present count'], ['present']);
  const absentCountIdx = getIndex(['absent count'], ['absent']);
  const leavesIdx = getIndex(['leaves applied'], ['leave']);
  const notEnteredIdx = getIndex(['attendance not entered'], ['not entered']);
  const totalCountIdx = getIndex(['total count'], ['total count', 'total']);
  const percentageIdx = getIndex(['percentage'], ['%']);

  const rows = targetTable.querySelectorAll('tr');

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];

    // Skip header or footer tags
    if (row.parentElement?.tagName.toLowerCase() === 'tfoot') continue;

    const cells = row.querySelectorAll('td');
    if (cells.length < 3) continue;

    const getText = (idx: number) => {
      if (idx === -1 || !cells[idx]) return '';
      return cells[idx].textContent?.trim().replace(/\s+/g, ' ') || '';
    };

    const courseCode = getText(courseCodeIdx).toUpperCase().replace(/[^A-Z0-9-]/g, '');

    // VALIDATION: A valid course code must start with a letter and be 4 to 15 characters (e.g. ITY23PCL403)
    // This perfectly filters out summary total rows, row numbers, and empty cells.
    if (!courseCode || !/^[A-Z][A-Z0-9-]{3,14}$/.test(courseCode)) {
      continue;
    }

    const getNum = (idx: number) => {
      const text = getText(idx);
      const val = parseInt(text, 10);
      return isNaN(val) ? 0 : val;
    };

    const getFloat = (idx: number) => {
      const text = getText(idx);
      const val = parseFloat(text);
      return isNaN(val) ? 0 : val;
    };

    const present = getNum(presentCountIdx);
    const absent = getNum(absentCountIdx);
    const leaves = getNum(leavesIdx);
    const notEntered = getNum(notEnteredIdx);
    let total = getNum(totalCountIdx);
    let percentage = getFloat(percentageIdx);

    // Failsafe 1: If total count is missing or misparsed, total = present + absent + notEntered
    if (total <= 0 && (present > 0 || absent > 0)) {
      total = present + absent + notEntered;
    }

    // Failsafe 2: Present cannot exceed total
    const safePresent = Math.min(present, total > 0 ? total : present);

    // Recalculate percentage if missing
    if (percentage <= 0 && total > 0) {
      percentage = Number(((safePresent / total) * 100).toFixed(2));
    } else {
      percentage = Math.min(100, Math.max(0, percentage));
    }

    records.push({
      courseCode,
      courseName: getText(courseNameIdx) || courseCode,
      facultyName: getText(facultyNameIdx),
      present: safePresent,
      absent,
      leaves,
      notEntered,
      total,
      percentage,
    });
  }

  return records;
}
