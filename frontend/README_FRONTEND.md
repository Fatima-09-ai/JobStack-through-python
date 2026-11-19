# JobStack Frontend — React Architecture & Skills Intelligence

Welcome to the modular React frontend for the **JobStack** Job Market Intelligence Platform.

## 🎯 What Was Built

### 1. File Separation (As Requested)
Every view and major component is separated into its own dedicated file:
- **`LandingPage.jsx`**: The opening hero with Anton letters dropping in, subtitle wipe animation, and transition triggers.
- **`Dashboard.jsx`**: The Overview dashboard featuring KPI metric cards, interactive SVG location pie chart with slice popout, top skills bars, top hiring companies, weekly trend line chart, and jobs by type.
- **`JobExplorer.jsx`**: Dedicated job search with title/company/skill query, location dropdown, employment type filter chips, brutalist job cards, smart pagination, and detail drawer.
- **`SkillsIntelligence.jsx`**: The comprehensive skills analysis suite (detailed below).
- **`JobDrawer.jsx`**: The slide-out modal drawer displaying full job details, responsibilities, requirements, skills, and benefits.
- **`Sidebar.jsx`**: Brutalist navigation sidebar with brand icon and active states.
- **`OrbitBackground.jsx`**: Fixed background orbit ring with dual spinning arms and red indicator dots.
- **`jobstackData.js`**: Pure data engine with 300 deterministic jobs, taxonomy dictionaries, co-occurrence matrix math, and deep-dive analytical algorithms.
- **`index.css`**: The complete brutalist design system (Anton, JetBrains Mono, Inter Tight, bone `#efede6`, black `#0b0b0c`, accent red `#ff2d2d`).

---

### 2. Skills Intelligence Capabilities
The `SkillsIntelligence.jsx` view includes all five core capabilities requested:

1. **Most Demanded Skills**:
   - Complete ranked list of all 36 extracted skills with # rank, canonical name, category, job count, % of market, and average salary.
   - Category filter pills: `All`, `Languages`, `Frameworks & Tools`, `Soft Skills`.
   - Hover animations with brutalist red fill indicator.
   - 1-click selection to inspect any skill in the deep dive.

2. **Programming Language Frequency**:
   - Isolates core languages: `Python`, `SQL`, `JavaScript`, `TypeScript`, `Java`, `C++`, `C#`, `PHP`.
   - Market share percentage comparison bar chart.
   - Experience level benchmarks (Intern, Junior, Mid-level, Senior, Lead).
   - Average monthly salary comparison.

3. **Framework and Tool Frequency**:
   - Categorized by industry domains:
     - **Frontend**: React, CSS, Figma
     - **Backend & APIs**: Node.js, FastAPI, Django, Flask, REST APIs, PostgreSQL, MongoDB
     - **Cloud & DevOps**: Docker, AWS, Azure, Kubernetes, Linux
     - **Data & AI**: Pandas, PyTorch, TensorFlow, Spark, Excel, Tableau, Power BI
     - **Dev Tools & Testing**: Git, Selenium, Networking, SEO
   - Frequency bars and count indicators.

4. **Skill Combinations & Co-occurrence**:
   - Top paired skills ranking table (Skill A + Skill B, job count, % of postings).
   - **"Exclude Soft Skills" toggle**: Excludes Communication, Teamwork, and Problem Solving to highlight purely technical stack synergies (matching the Python EDA module).
   - **Interactive Co-occurrence Matrix (Heatmap)**: NxN grid of top technical skills with red intensity shading, cell hover tooltips, and 1-click filtering to jobs requiring both skills.
   - **High-Synergy Tech Stacks**: Curated stack bundles (Python Data Stack, Modern Full-Stack Web, Cloud & DevOps, Machine Learning Systems).

5. **Search for a Particular Skill**:
   - Instant search input with quick-pick pills for top skills (`Python`, `SQL`, `React`, `AWS`, `Docker`, `Pandas`, etc.).
   - **Spotlight Card**:
     - Market demand rank, total postings, % market share, and salary range.
     - Multi-segment experience level distribution bar.
     - Frequently paired skills with 1-click drill down into paired technologies.
     - Top job roles and top hiring companies looking for this skill.
     - **Matching Job Postings Grid**: Live job cards mentioning this skill, clicking any card opens the full Job Detail Drawer.

---

## 🚀 How to Run

You have 3 easy ways to run the frontend:

### Method 1: Instant 1-Click Launch (Recommended)
Double-click **`run_app.bat`** in the `frontend` folder.
It automatically launches `http://localhost:3000` in your default browser using Python's built-in web server.

### Method 2: Standalone Double-Click (Zero Setup / Offline)
Double-click **`standalone_react.html`** in Windows Explorer. It runs directly in any modern browser without needing a server or npm packages.

### Method 3: Standard Vite / Node Workflow
If using Node.js or Vite:
```bash
cd frontend
pnpm install   # or npm install
pnpm dev       # or npm run dev
```
Open the printed local URL (e.g. `http://localhost:3000`).
