# Job Application Tracker

A lightweight, browser-based job application tracker — no frameworks, no backend, no accounts required. Just open the file and start logging.

## Features

- **Add & manage applications** — log company, role, status, date applied, salary range, job URL, and notes
- **Status tracking** — six stages with color-coded badges: Applied, Interview, Offer, Rejected, Withdrawn, and Ghosted
- **Stats at a glance** — live summary cards showing total applications, interviews, offers, and rejections
- **Search & filter** — find entries by company or role name, or filter by status
- **Export to CSV** — download all your applications as a spreadsheet at any time
- **Persistent storage** — data is saved to `localStorage` so it survives page refreshes
- **Dark mode** — automatically follows your system preference
- **Fully offline** — no internet connection needed after the initial page load

## File Structure

```
├── index.html      # App markup and layout
├── index.js        # App logic (load, save, render, modal, export)
└── styles.css      # Styles including dark mode and responsive layout
```

## Usage

No build step or install needed — just open `index.html` in your browser.

```bash
git clone https://github.com/your-username/job-tracker.git
cd job-tracker
open index.html
```

Or simply download the files and double-click `index.html`.

## Data & Privacy

All data is stored locally in your browser's `localStorage` under the key `jt_jobs`. Nothing is sent to any server. Clearing your browser's site data will erase your entries — use the **Export CSV** button regularly to back up your applications.

## Browser Support

Works in any modern browser (Chrome, Firefox, Safari, Edge). No polyfills required.

## License

MIT
