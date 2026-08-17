import { ScheduledLecture } from '../types/index';

/**
 * Checks if the current page contains a schedule table
 */
export function isSchedulePage(): boolean {
    const tables = document.querySelectorAll('table');
    for (const table of Array.from(tables)) {
        const headerRow = table.querySelector('tr');
        if (!headerRow) continue;
        const text = headerRow.textContent?.toLowerCase() || '';
        if (text.includes('date') && text.includes('time') && text.includes('session') && text.includes('course code')) {
            return true;
        }
    }
    return false;
}

/**
 * Parses the schedule table from the MGM ERP page
 */
export function parseScheduleTable(): ScheduledLecture[] {
    const lectures: ScheduledLecture[] = [];
    const tables = document.querySelectorAll('table');
    
    let targetTable: HTMLTableElement | null = null;
    let headerMap: Record<string, number> = {};
    
    for (const table of Array.from(tables)) {
        const headerRow = table.querySelector('tr');
        if (!headerRow) continue;
        const text = headerRow.textContent?.toLowerCase() || '';
        if (text.includes('date') && text.includes('time') && text.includes('session') && text.includes('course code')) {
            targetTable = table;
            const ths = headerRow.querySelectorAll('th, td');
            ths.forEach((th, index) => {
                const title = th.textContent?.toLowerCase().trim().replace(/\s+/g, ' ') || '';
                headerMap[title] = index;
            });
            break;
        }
    }
    
    if (!targetTable) return lectures;
    
    const rows = targetTable.querySelectorAll('tr');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i < rows.length; i++) { // Skip header
        const cells = rows[i].querySelectorAll('td');
        if (cells.length === 0) continue;
        
        const getIndex = (keywords: string[]) => {
            for (const [key, index] of Object.entries(headerMap)) {
                if (keywords.some(kw => key.includes(kw))) {
                    return index;
                }
            }
            return -1;
        };

        const dateIdx = getIndex(['date']);
        const timeIdx = getIndex(['time']);
        const sessionIdx = getIndex(['session']);
        const courseCodeIdx = getIndex(['course code']);
        const courseNameIdx = getIndex(['course name']);
        const facultyNameIdx = getIndex(['faculty name']);
        const roomNameIdx = getIndex(['room name']);

        if (dateIdx === -1 || cells.length <= dateIdx) continue;
        
        const getText = (idx: number) => {
            if (idx === -1 || !cells[idx]) return '';
            return cells[idx].textContent?.trim().replace(/\s+/g, ' ') || '';
        };
        
        const dateStr = getText(dateIdx);
        const timeStr = getText(timeIdx);
        
        if (!dateStr || !timeStr) continue;

        const lectureDate = new Date(dateStr);
        if (isNaN(lectureDate.getTime())) continue; // Invalid date

        // Only include future and current day lectures
        if (lectureDate < today) continue;
        
        let startTime = '';
        let endTime = '';
        
        const timeParts = timeStr.split('-');
        if (timeParts.length >= 2) {
            startTime = timeParts[0].trim();
            endTime = timeParts[1].trim();
        } else {
            startTime = timeStr;
        }

        const courseCode = getText(courseCodeIdx).toUpperCase();
        if (!courseCode) continue;

        lectures.push({
            date: dateStr,
            startTime,
            endTime,
            session: getText(sessionIdx),
            courseCode,
            courseName: getText(courseNameIdx),
            facultyName: getText(facultyNameIdx),
            roomName: getText(roomNameIdx)
        });
    }
    
    return lectures;
}
