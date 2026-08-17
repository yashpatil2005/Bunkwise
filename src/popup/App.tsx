import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Settings as SettingsIcon, RefreshCw } from 'lucide-react';
import type { NavigationTab, AttendanceRecord, ScheduledLecture, Settings, DataSourceType } from '../types/index';
import { Navigation } from './components/Navigation';
import { OverviewScreen } from './components/OverviewScreen';
import { ScheduleScreen } from './components/ScheduleScreen';
import { CoursesScreen } from './components/CoursesScreen';
import { CourseDetail } from './components/CourseDetail';
import { BunkModeScreen } from './components/BunkModeScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { LoadingState } from './components/LoadingState';
import { SAMPLE_ATTENDANCE, SAMPLE_SCHEDULE } from '../data/sampleData';
import { getSettings, saveSettings, getCachedData, saveCachedData, clearAllData } from '../storage/settings';
import { applyTheme, watchSystemTheme } from '../utils/theme';

export function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [schedule, setSchedule] = useState<ScheduledLecture[]>([]);
  const [settings, setSettings] = useState<Settings>({
    threshold: 0.75,
    appearance: 'system',
    devMode: false,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState<DataSourceType>('SAMPLE_DATA');

  // ─── Load settings and data on mount ──────────────────────────
  useEffect(() => {
    async function init() {
      try {
        const savedSettings = await getSettings();
        setSettings(savedSettings);
        applyTheme(savedSettings.appearance);

        // Try to load cached data
        const cached = await getCachedData();
        if (cached && cached.attendance.length > 0) {
          setAttendance(cached.attendance);
          setSchedule(cached.schedule);
          setDataSource('CACHED');
        } else {
          // Use sample data
          setAttendance(SAMPLE_ATTENDANCE);
          setSchedule(SAMPLE_SCHEDULE);
          setDataSource('SAMPLE_DATA');
        }

        // Try to fetch live data from ERP
        fetchErpData();
      } catch {
        // Fallback to sample data
        setAttendance(SAMPLE_ATTENDANCE);
        setSchedule(SAMPLE_SCHEDULE);
        setDataSource('SAMPLE_DATA');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // ─── Watch system theme changes ───────────────────────────────
  useEffect(() => {
    if (settings.appearance !== 'system') return;
    const cleanup = watchSystemTheme(() => {
      applyTheme('system');
    });
    return cleanup;
  }, [settings.appearance]);

  // ─── Fetch data from ERP content script ───────────────────────
  const fetchErpData = useCallback(async () => {
    if (typeof chrome === 'undefined' || !chrome.tabs) return;

    try {
      // Find open ERP tab with fallback queries
      let targetTab: chrome.tabs.Tab | undefined;
      let tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]?.url?.includes('erp.mgmu.ac.in')) {
        targetTab = tabs[0];
      } else {
        tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        if (tabs[0]?.url?.includes('erp.mgmu.ac.in')) {
          targetTab = tabs[0];
        } else {
          tabs = await chrome.tabs.query({ url: '*://erp.mgmu.ac.in/*' });
          targetTab = tabs[0];
        }
      }

      if (!targetTab?.id) return;

      let isConnected = false;
      try {
        const pingResponse = await chrome.tabs.sendMessage(targetTab.id, { type: 'PING' });
        if (pingResponse?.success) {
          isConnected = true;
        }
      } catch {
        isConnected = false;
      }

      // If extension was recently reloaded in chrome://extensions, content script connection is lost
      // Attempt dynamic injection if chrome.scripting is available
      if (!isConnected && chrome.scripting) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: targetTab.id },
            files: ['assets/content.ts-BnQ9oNwj.js'],
          });
          await new Promise(r => setTimeout(r, 150));
        } catch {
          // Dynamic injection failed, user should refresh ERP page once
        }
      }

      // Request live data from content script
      const response = await chrome.tabs.sendMessage(targetTab.id, { type: 'GET_ALL_DATA' });

      if (response?.success) {
        const newAttendance = response.data?.attendance as AttendanceRecord[] | undefined;
        const newSchedule = response.data?.schedule as ScheduledLecture[] | undefined;

        const hasNewAttendance = Boolean(newAttendance && newAttendance.length > 0);
        const hasNewSchedule = Boolean(newSchedule && newSchedule.length > 0);

        if (hasNewAttendance) {
          setAttendance(newAttendance!);
          setDataSource('ERP_LIVE');
        }
        if (hasNewSchedule) {
          setSchedule(newSchedule!);
        }

        const validAttendance = hasNewAttendance ? newAttendance! : attendance;
        const validSchedule = hasNewSchedule ? newSchedule! : schedule;

        if (validAttendance.length > 0 || validSchedule.length > 0) {
          await saveCachedData({
            attendance: validAttendance,
            schedule: validSchedule,
            lastUpdated: new Date().toISOString(),
          });
        }
      }
    } catch {
      // Silently keep cached/sample data
    }
  }, [attendance, schedule]);

  // ─── Handle refresh ───────────────────────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchErpData();
    setTimeout(() => setRefreshing(false), 600);
  };

  // ─── Handle settings change ───────────────────────────────────
  const handleSettingsChange = async (newSettings: Settings) => {
    setSettings(newSettings);
    applyTheme(newSettings.appearance);
    await saveSettings(newSettings);
  };

  // ─── Handle clear data ───────────────────────────────────────
  const handleClearData = async () => {
    await clearAllData();
    setAttendance(SAMPLE_ATTENDANCE);
    setSchedule(SAMPLE_SCHEDULE);
    setDataSource('SAMPLE_DATA');
    setSettings({ threshold: 0.75, appearance: 'system', devMode: false });
    applyTheme('system');
  };

  // ─── Handle course click ─────────────────────────────────────
  const handleCourseClick = (courseCode: string) => {
    setSelectedCourse(courseCode);
  };

  // ─── Compute Effective Schedule (Top Level Hook) ──────────────
  const effectiveSchedule = useMemo(() => {
    if (schedule && schedule.length > 0) return schedule;
    return SAMPLE_SCHEDULE;
  }, [schedule]);

  // ─── Threshold as percentage for display / engine ─────────────
  const thresholdPct = settings.threshold * 100;

  // ─── Render ───────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="app">
        <header className="app-header">
          <div className="app-header-left">
            <span className="app-logo">Bunkwise <span>Attendance Intelligence</span></span>
          </div>
        </header>
        <div className="app-content">
          <LoadingState />
        </div>
      </div>
    );
  }

  // Course detail overlay
  if (selectedCourse) {
    return (
      <CourseDetail
        courseCode={selectedCourse}
        attendance={attendance}
        schedule={effectiveSchedule}
        threshold={thresholdPct}
        onBack={() => setSelectedCourse(null)}
      />
    );
  }

  // Settings overlay
  if (showSettings) {
    return (
      <div className="app">
        <header className="app-header">
          <div className="app-header-left">
            <button
              className="back-btn"
              onClick={() => setShowSettings(false)}
              aria-label="Back"
            >
              ←
            </button>
            <span className="app-logo">Settings</span>
          </div>
        </header>
        <div className="app-content">
          <SettingsScreen
            settings={settings}
            onSettingsChange={handleSettingsChange}
            onRefresh={handleRefresh}
            onClearData={handleClearData}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="app-header-left">
          <span className="app-logo">
            Bunkwise <span>Attendance Intelligence</span>
          </span>
        </div>
        <div className="app-header-actions">
          <span className={`data-source-pill ${dataSource === 'ERP_LIVE' ? 'live' : ''}`}>
            {dataSource === 'ERP_LIVE' ? '● Live' : dataSource === 'CACHED' ? 'Cached' : 'Sample'}
          </span>
          <button
            className="icon-btn"
            onClick={handleRefresh}
            aria-label="Refresh data"
            disabled={refreshing}
          >
            <RefreshCw
              size={16}
              style={refreshing ? { animation: 'spin 1s linear infinite' } : undefined}
            />
          </button>
          <button
            className="icon-btn"
            onClick={() => setShowSettings(true)}
            aria-label="Settings"
          >
            <SettingsIcon size={16} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main
        className="app-content"
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === 'overview' && (
          <OverviewScreen
            attendance={attendance}
            schedule={effectiveSchedule}
            threshold={thresholdPct}
            onCourseClick={handleCourseClick}
          />
        )}
        {activeTab === 'schedule' && (
          <ScheduleScreen
            attendance={attendance}
            schedule={effectiveSchedule}
            threshold={thresholdPct}
            onCourseClick={handleCourseClick}
          />
        )}
        {activeTab === 'courses' && (
          <CoursesScreen
            attendance={attendance}
            schedule={effectiveSchedule}
            threshold={thresholdPct}
            onCourseClick={handleCourseClick}
          />
        )}
        {activeTab === 'bunkmode' && (
          <BunkModeScreen
            attendance={attendance}
            schedule={effectiveSchedule}
            threshold={thresholdPct}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
