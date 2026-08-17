import { parseAttendanceTable, isAttendancePage } from './attendanceParser';
import { parseScheduleTable, isSchedulePage } from './scheduleParser';

console.log('[Bunkwise] Content script loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
        if (request.type === 'PING') {
            sendResponse({ success: true });
        } else if (request.type === 'PAGE_INFO') {
            sendResponse({
                success: true,
                data: {
                    isAttendance: isAttendancePage(),
                    isSchedule: isSchedulePage()
                }
            });
        } else if (request.type === 'GET_ATTENDANCE') {
            const records = parseAttendanceTable();
            sendResponse({ success: true, data: records });
        } else if (request.type === 'GET_SCHEDULE') {
            const lectures = parseScheduleTable();
            sendResponse({ success: true, data: lectures });
        } else if (request.type === 'GET_ALL_DATA') {
            const attendance = parseAttendanceTable();
            const schedule = parseScheduleTable();
            sendResponse({
                success: true,
                data: { attendance, schedule }
            });
        } else {
            sendResponse({ success: false, error: 'Unknown request type' });
        }
    } catch (error: any) {
        console.error('[Bunkwise] Error processing message:', error);
        sendResponse({ success: false, error: error.message || 'Unknown error' });
    }
    
    return true; // Keep message channel open for async response
});

// Setup MutationObserver for SPA navigation
let debounceTimer: number | null = null;
const observer = new MutationObserver((mutations) => {
    let significantChange = false;
    for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            significantChange = true;
            break;
        }
    }

    if (significantChange) {
        if (debounceTimer) {
            window.clearTimeout(debounceTimer);
        }
        debounceTimer = window.setTimeout(() => {
            const isAttendance = isAttendancePage();
            const isSchedule = isSchedulePage();
            if (isAttendance || isSchedule) {
                console.log('[Bunkwise] Page context identified:', { attendance: isAttendance, schedule: isSchedule });
            }
        }, 300);
    }
});

// Start observing the document body for injected content changes
if (document.body) {
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}
