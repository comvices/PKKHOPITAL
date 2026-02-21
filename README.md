# Prachuap Hospital Department Manager

A full-stack web application for managing internal links for hospital departments. Built with React, Express, and SQLite.

## Features
- **Department Management**: Add, edit, and delete department links.
- **Search**: Real-time filtering of departments.
- **Responsive Design**: Works on mobile and desktop.
- **Full-stack**: Persistent storage using SQLite.

## Tech Stack
- **Frontend**: React 19, Tailwind CSS, Lucide Icons, Motion.
- **Backend**: Node.js, Express.
- **Database**: SQLite (via `better-sqlite3`).
- **Build Tool**: Vite.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd prachuap-hospital-dept-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file based on `.env.example`.
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`.

## Build for Production
```bash
npm run build
npm start
```

## License
MIT
