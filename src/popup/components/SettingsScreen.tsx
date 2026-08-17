import React from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';
import type { Settings } from '../../types/index';

interface SettingsScreenProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  onRefresh: () => void;
  onClearData: () => void;
}

const thresholdOptions = [
  { label: '60%', value: 0.60 },
  { label: '65%', value: 0.65 },
  { label: '70%', value: 0.70 },
  { label: '75%', value: 0.75 },
  { label: '80%', value: 0.80 },
  { label: '85%', value: 0.85 },
];

const appearanceOptions: { label: string; value: 'system' | 'light' | 'dark' }[] = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export function SettingsScreen({ settings, onSettingsChange, onRefresh, onClearData }: SettingsScreenProps) {
  return (
    <div>
      {/* Attendance Threshold */}
      <div className="settings-section">
        <div className="settings-title">Attendance Threshold</div>
        <div className="settings-option-group">
          {thresholdOptions.map(opt => (
            <div
              key={opt.value}
              className="settings-option"
              onClick={() => onSettingsChange({ ...settings, threshold: opt.value })}
              role="radio"
              aria-checked={settings.threshold === opt.value}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSettingsChange({ ...settings, threshold: opt.value })}
            >
              <div className={`radio ${settings.threshold === opt.value ? 'active' : ''}`} />
              <span className="settings-option-label">{opt.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Appearance */}
      <div className="settings-section">
        <div className="settings-title">Appearance</div>
        <div className="settings-option-group">
          {appearanceOptions.map(opt => (
            <div
              key={opt.value}
              className="settings-option"
              onClick={() => onSettingsChange({ ...settings, appearance: opt.value })}
              role="radio"
              aria-checked={settings.appearance === opt.value}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSettingsChange({ ...settings, appearance: opt.value })}
            >
              <div className={`radio ${settings.appearance === opt.value ? 'active' : ''}`} />
              <span className="settings-option-label">{opt.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Actions */}
      <div className="settings-section">
        <div className="settings-title">Data</div>
        <button className="settings-btn" onClick={onRefresh}>
          <RefreshCw size={14} />
          Refresh ERP Data
        </button>
        <button className="settings-btn danger" onClick={onClearData} style={{ marginTop: '8px' }}>
          <Trash2 size={14} />
          Clear Local Data
        </button>
      </div>

      {/* About */}
      <div className="settings-section" style={{ textAlign: 'center', paddingTop: '16px' }}>
        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Bunkwise v1.0.0
        </p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: '4px' }}>
          Attendance Intelligence
        </p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: '8px' }}>
          Your data never leaves your browser.
        </p>
      </div>
    </div>
  );
}
