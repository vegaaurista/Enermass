# ☀️ Enermass Solar EPC Pro — React App

A professional Solar Power Plant Proposal System built with **React 18 + Vite + Tailwind CSS**.

## Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173)

## Build for Production

```bash
npm run build
npm run preview
```

## Features

- **Dashboard** — Quick overview with stats and navigation cards
- **Company Settings** — Logo upload, company details, CEO signature, branch addresses per state
- **Settings** — Solar panels, inverters, CFA/subsidy rates, net metering export rates, sales team, intro letter
- **BOM Products** — Bill of Materials with auto-calculated quantities
- **T&C** — State-wise Terms & Conditions (Kerala, Rajasthan, Uttarakhand, UP, Tamil Nadu)
- **Saved Proposals** — View, edit, revise (R1/R2...) and delete past proposals
- **Proposal Form** — Full form with live cost summary, CFA auto-calculation, subsidy, system design
- **Proposal Preview** — Rendered 11-section professional proposal document
- **Download as PDF** — Clean, client-ready PDF using html2pdf.js (no print dialog)

## Tech Stack

- React 18
- Vite 5
- Tailwind CSS 3
- html2pdf.js (PDF generation)
- localStorage for data persistence

## Project Structure

```
src/
├── App.jsx                 # Root component, screen routing, proposal logic
├── main.jsx                # Entry point
├── index.css               # Tailwind + proposal document styles
├── store/AppContext.jsx     # Global state (useReducer + Context)
├── data/defaults.js         # All default data (panels, BOM, T&C, state data)
├── utils/
│   ├── helpers.js           # Formatters, CFA calc, BOM qty, ref gen
│   ├── docBuilder.js        # Builds proposal HTML string
│   └── pdfExport.js         # html2pdf.js wrapper
└── screens/
    ├── Dashboard.jsx
    ├── Company.jsx
    ├── Settings.jsx
    ├── BOM.jsx
    ├── TNC.jsx
    ├── Saved.jsx
    ├── QuotForm.jsx         # Proposal form with live cost summary
    └── Preview.jsx          # Proposal preview + PDF download
```
