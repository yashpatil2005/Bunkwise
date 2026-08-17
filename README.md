# 🎓 Bunkwise — Attendance Intelligence Chrome Extension

> **Know what to attend. Skip smarter. Maintain your attendance buffer without stress.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff)](https://vitejs.dev/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

---

## 📌 Overview

**Bunkwise** is an open-source, privacy-first Chrome Extension designed for college students. It integrates directly with college ERP portals (such as MGM University ERP), parses attendance and timetable data, applies deterministic mathematical intelligence, and provides actionable recommendations on which upcoming classes are safe to skip and which ones are critical to attend.

Unlike static attendance calculators, Bunkwise operates in real time within your browser, offering multi-lecture simulations, risk scoring, recovery plans, and zero external network transmissions.

---

## ✨ Features

- **📊 Comprehensive Attendance Dashboard**: Real-time overview of total attendance percentage, net safe bunks available, and list of at-risk courses.
- **📅 Schedule Analysis & Recommendation Engine**: Automatically pairs your timetable schedule with live attendance records to label every upcoming class:
  - 🟢 `BUNKABLE` — Safe buffer above threshold.
  - 🟡 `CAUTION` — Borderline safe; skipping reduces buffer to critical level.
  - 🔴 `ATTEND` — Under threshold or zero buffer available.
  - 🚨 `RECOVER` — Severely deficient; consecutive lectures required.
- **📚 Course-by-Course Analytics**: Deep dive into individual subject statistics, present/absent count, leaves applied, missing attendance entries, and recovery lecture counters.
- **⚡ Interactive Bunk Simulator**: Select any combination of upcoming lectures across multiple days to simulate the exact mathematical impact on your attendance *before* taking the day off.
- **🎯 Best Bunk Finder**: Automatically identifies the single optimal lecture to skip with minimal impact on overall status.
- **🌗 Custom Attendance Thresholds**: Adjust your target threshold anywhere between **60% and 90%** (default: **75%**).
- **🔒 Privacy-First Architecture**: 100% local processing. No tracking, no user account required, no analytics, and zero credential scraping.

---

## 🏗️ Architecture

Bunkwise is designed with a clean separation between DOM parsing, calculation engine, local storage, and presentation UI.

### 📐 System Diagram

```mermaid
flowgraph TD
    subgraph Browser ["🌐 Chrome / Chromium Browser"]
        ERP["🏫 College ERP DOM<br/>(erp.mgmu.ac.in)"]
        CS["📜 Content Scripts<br/>(attendanceParser & scheduleParser)"]
        STORAGE["💾 chrome.storage.local"]
        POPUP["🎨 Extension Popup UI<br/>(React + Lucide)"]
    end

    subgraph CoreEngine ["🧮 Bunkwise Math Engine"]
        MATH["📊 Attendance Math<br/>(safeBunks, recoveryLectures)"]
        REC["💡 Recommendation Rules Engine"]
        SIM["⚡ Bunk Simulator"]
    end

    ERP -->|DOM Table Rows| CS
    CS -->|Structured JSON Records| STORAGE
    STORAGE -->|Cached Data| POPUP
    POPUP -->|Inputs| MATH
    POPUP -->|Inputs| REC
    POPUP -->|Selected Bunks| SIM
    MATH -->|Projections| POPUP
    REC -->|Action Badges| POPUP
    SIM -->|Simulation Verdict| POPUP
```

### 📂 Directory Structure

```
bunkwise/
├── manifest.config.ts          # Chrome Manifest V3 configuration (@crxjs)
├── vite.config.ts              # Vite bundler & plugin setup
├── package.json                # Project dependencies & scripts
├── tsconfig.json               # TypeScript compiler config
├── LICENSE                     # MIT License
├── README.md                   # Repository documentation
├── public/                     # Static extension icons and manifests
└── src/
    ├── content/                # DOM Parsing & Content Scripts
    │   ├── content.ts          # MutationObserver & Chrome runtime message handlers
    │   ├── attendanceParser.ts # Heuristic DOM table parser for attendance
    │   └── scheduleParser.ts   # Timetable schedule extractor
    ├── engine/                 # Pure Mathematical Core (Zero DOM dependency)
    │   ├── attendance.ts       # Safe bunks, recovery, overall formulas
    │   ├── recommendations.ts  # Risk scoring & recommendation logic
    │   └── simulator.ts        # Multi-lecture skip projection engine
    ├── popup/                  # React Presentation Layer
    │   ├── App.tsx             # Main dashboard container & tab router
    │   ├── styles.css          # Vanilla CSS design system & tokens
    │   └── components/         # Modular React UI components
    ├── storage/                # Chrome extension storage wrapper
    ├── data/                   # Mock fallback data for offline dev
    ├── types/                  # Shared TypeScript interfaces & types
    └── utils/                  # Formatting, date & theme helpers
```

---

## ⚡ Quick Start

### 📋 Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher) or **pnpm** / **yarn**
- **Google Chrome**, **Brave**, **Edge**, or any Chromium-based browser supporting Manifest V3.

### 📥 1. Clone the Repository

```bash
git clone https://github.com/yashpatil0240/bunkwise.git
cd bunkwise
```

### 📦 2. Install Dependencies

```bash
npm install
```

### 🛠️ 3. Build the Extension

To generate the production-ready extension build:

```bash
npm run build
```

This compiles TypeScript and packages the project into the `dist/` directory.

### 🌐 4. Load into Chrome

1. Open Google Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** using the toggle switch in the top-right corner.
3. Click the **Load unpacked** button in the top-left toolbar.
4. Select the `dist/` folder located in your cloned `bunkwise` project directory.
5. Pin **Bunkwise** to your browser toolbar for quick access!

### 🔄 5. Live Development Mode

To edit code with Hot Module Replacement (HMR) for the popup:

```bash
npm run dev
```

---

## 📖 Documentation & Math Formulas

### 🧮 Mathematical Formulas

Bunkwise uses exact discrete mathematical formulas to prevent edge-case errors:

#### 1. Safe Bunks Formula
Calculates the maximum consecutive absences allowed without falling below threshold $T$:

$$\text{Safe Bunks} = \left\lfloor \frac{\text{Present}}{T} - \text{Total} \right\rfloor$$

> *Note:* If $\text{Present} = \text{Total}$ (100% attendance), a single absence might drop percentage below threshold depending on total lectures. The formula handles floor rounding correctly.

#### 2. Recovery Lectures Formula
Calculates the minimum consecutive classes you must attend to restore attendance back to threshold $T$:

$$\text{Recovery} = \left\lceil \frac{T \times \text{Total} - \text{Present}}{1 - T} \right\rceil$$

#### 3. Overall Weighted Percentage
Overall attendance is calculated across total aggregate lectures, **not** by averaging individual course percentages (which produces skewed weightings):

$$\text{Overall \%} = \frac{\sum \text{Present}_{i}}{\sum \text{Total}_{i}} \times 100$$

---

## 🛠️ How to Adapt Bunkwise for Your College ERP

Bunkwise is built with an **Adapter Pattern**, making it simple to support any college ERP system (Mastersoft, CollPoll, ERPNext, TCS iLZ, Academia ERP, custom PHP portals, etc.).

### Step-by-step Guide to Adding Your College ERP:

1. **Update Manifest Permissions (`manifest.config.ts`)**:
   Add your college domain match pattern:
   ```typescript
   matches: [
     'https://erp.mgmu.ac.in/*',
     'https://your-college-erp.edu/*' // Add your ERP URL pattern here
   ]
   ```

2. **Create a Parser in `src/content/`**:
   Implement `isAttendancePage()` and `parseAttendanceTable()` tailored to your ERP's HTML structure:

   ```typescript
   import { AttendanceRecord } from '../types';

   export function parseCustomERPTable(): AttendanceRecord[] {
     const rows = document.querySelectorAll('.attendance-table tbody tr');
     const records: AttendanceRecord[] = [];

     rows.forEach(row => {
       const cells = row.querySelectorAll('td');
       if (cells.length < 4) return;

       const courseCode = cells[0].textContent?.trim() || '';
       const present = parseInt(cells[1].textContent || '0', 10);
       const total = parseInt(cells[2].textContent || '0', 10);
       const percentage = total > 0 ? (present / total) * 100 : 0;

       records.push({
         courseCode,
         courseName: cells[0].textContent?.trim() || courseCode,
         facultyName: cells[3]?.textContent?.trim() || 'N/A',
         present,
         absent: total - present,
         leaves: 0,
         notEntered: 0,
         total,
         percentage
       });
     });

     return records;
   }
   ```

3. **Register Parser in `src/content/content.ts`**:
   The pure calculation engine (`src/engine/`) and React UI will automatically work out-of-the-box with your parsed dataset!

---

## 💻 Tech Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript 5.7](https://www.typescriptlang.org/)
- **Bundler & Build System**: [Vite 6](https://vitejs.dev/) + [@crxjs/vite-plugin](https://crxjs.dev/vite-plugin)
- **Extension Standard**: Chrome Extension Manifest V3
- **Iconography**: [Lucide React](https://lucide.dev/)
- **Styling**: Modern Vanilla CSS with CSS custom properties (variables), glassmorphism, and responsive dark theme support.

---

## 🚀 Deployment & Distribution

### Packaging for Release

To create a release `.zip` bundle for submission to the Chrome Web Store or distribution:

1. Run production build:
   ```bash
   npm run build
   ```
2. Compress the contents of the `dist/` directory into a `.zip` archive:
   - **Windows (PowerShell)**: `Compress-Archive -Path dist\* -DestinationPath bunkwise-extension.zip`
   - **Linux / macOS**: `cd dist && zip -r ../bunkwise-extension.zip .`
3. Upload `bunkwise-extension.zip` to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).

---

## 🤝 Contributing

Contributions are what make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**!

1. Fork the Project (`https://github.com/yashpatil0240/bunkwise/fork`)
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](file:///C:/Users/yashp/Documents/antigravity/resilient-chandrasekhar/LICENSE) for more details.

---

<p align="center">
  <i>Built with ❤️ for students who want to calculate smarter.</i>
</p>
