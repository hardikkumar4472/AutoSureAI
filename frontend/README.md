# AutoSureAI Frontend

A modern React + Vite frontend application for AutoSureAI - AI-Powered Insurance Claims Management System.

## Features

- **Multi-role Authentication**: Support for Drivers, Agents, Traffic Officers, and Admins
- **Accident Reporting**: Upload accident images with AI-powered damage assessment
- **Claims Management**: Track and manage insurance claims with real-time updates
- **Traffic Verification**: Verify accident reports and upload FIR documents
- **Admin Dashboard**: Comprehensive admin panel with analytics, user management, and exports
- **Real-time Chat**: Socket.io powered chat between drivers and agents
- **Analytics**: Visual analytics dashboard with charts and statistics
- **Data Exports**: Export accidents and claims data in CSV and PDF formats

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **Recharts** - Data visualization
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **date-fns** - Date formatting

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Backend server running on port 8000 (or configure in `.env`)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:8000/api
VITE_SOCKET_URL=http://localhost:8000
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   │   ├── Layout.jsx
│   │   └── ChatWindow.jsx
│   ├── context/         # React contexts
│   │   ├── AuthContext.jsx
│   │   └── SocketContext.jsx
│   ├── pages/           # Page components
│   │   ├── auth/        # Authentication pages
│   │   ├── driver/      # Driver dashboard pages
│   │   ├── agent/       # Agent dashboard pages
│   │   ├── traffic/     # Traffic officer pages
│   │   └── admin/       # Admin dashboard pages
│   ├── utils/           # Utility functions
│   │   └── api.js       # API client configuration
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## User Roles

### Driver
- Register and login
- Report accidents with image upload
- View accident reports and claims
- Track claim status
- Chat with assigned agent

### Agent
- View assigned claims
- Review accident reports
- Approve or reject claims
- Chat with drivers

### Traffic Officer
- View pending accident reports
- Verify accident reports
- Mark reports as verified or fraudulent
- Upload FIR documents

### Admin
- View analytics dashboard
- Manage agents and traffic officers
- Reassign claims
- Send broadcast messages
- View audit logs
- Export data (CSV/PDF)

## API Integration

The frontend communicates with the backend API through the `api.js` utility. All API calls are automatically authenticated using JWT tokens stored in localStorage.

## Environment Variables

- `VITE_API_URL` - Backend API base URL (default: http://localhost:8000/api)
- `VITE_SOCKET_URL` - Socket.io server URL (default: http://localhost:8000)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Notes

- The frontend assumes the backend is running on port 8000
- JWT tokens are stored in localStorage
- Socket.io connection is established automatically on login
- All routes are protected based on user roles



