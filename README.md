# Bright Project - Project Management Application

## Overview

This is a modern project management application built with Next.js and FastAPI, designed for tracking project progress, managing tasks, and monitoring budgets. The application provides comprehensive project oversight with real-time metrics and task management capabilities.

## Features

### Project Overview Dashboard
- **Project Information**: Client details, project lead, dates, and current phase
- **Budget Tracking**: Spent/remaining budget with utilization metrics
- **Progress Monitoring**: Task completion statistics with visual progress indicators
- **Top Tasks Analysis**: Billable hours tracking with cost calculations

### Task Management
- **Comprehensive Task Tracking**: 10+ task attributes including status, priority, and completion
- **Team Assignment**: Track Deposco vs Client team responsibilities
- **Progress Visualization**: Completion percentages with progress bars
- **Date Management**: Start dates and due dates in MM/DD/YYYY format
- **Billable Hours**: Track time investment per task

### File Upload
- **Generic File Upload**: Support for all file types
- **Drag & Drop**: Modern file upload interface
- **Status Feedback**: Real-time upload progress and success/error states

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (React 18)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Formatting**: Numeral.js for consistent data formatting

### Backend
- **Framework**: FastAPI (Python)
- **Data Storage**: JSON file-based task storage
- **HTTP Server**: Uvicorn
- **Data Processing**: Dynamic project metrics calculation

## Application Architecture

### Frontend Structure
```
frontend/src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Main layout with Montserrat font
│   └── page.tsx           # Main application with tab routing
├── components/
│   ├── layout/
│   │   └── Layout.tsx     # Navigation with File Upload, Overview, Task Tracking
│   ├── tabs/              # Main application screens
│   │   ├── FileUpload.tsx # Generic file upload interface
│   │   ├── Overview.tsx   # Project dashboard with dynamic metrics
│   │   └── TaskTracking.tsx # Comprehensive task management table
│   └── ui/                # Reusable UI components
│       ├── BreakdownTable.tsx # Generic sortable table component
│       └── ScoreGauge.tsx     # Configurable gauge with percentage option
├── services/
│   └── api.ts             # API client with project and task endpoints
└── utils/
    └── formatters.ts      # Centralized formatting utilities
```

### Backend Structure
```
backend/
├── main.py                # FastAPI application with project management endpoints
├── tasks.json            # Task data storage with 10 sample tasks
└── requirements.txt       # Python dependencies
```

## API Endpoints

### Core Endpoints
- `GET /` - Health check
- `POST /api/upload-file` - Generic file upload
- `GET /api/project-overview` - Dynamic project metrics from task data
- `GET /api/tasks` - Complete task data with all attributes

### Data Flow
1. **Task Data**: Stored in `tasks.json` with comprehensive task attributes
2. **Dynamic Metrics**: Project overview calculated from actual task data
3. **Real-time Updates**: Metrics reflect current task completion status
4. **Centralized Formatting**: Consistent currency, date, and number formatting

## Key Features

### Project Overview Dashboard
- **Dynamic Calculations**: All metrics calculated from actual task data
- **Budget Information**: Spent ($63,047.50) and remaining budget with hourly rate
- **Progress Tracking**: Task completion statistics with visual gauge
- **Top Tasks**: Automatically sorted by billable hours with cost calculations

### Task Management
- **Comprehensive Tracking**: 11 columns including category, subcategory, status, priority
- **Visual Indicators**: Color-coded status badges and progress bars
- **Team Management**: Deposco (orange) vs Client (blue) team indicators
- **Date Formatting**: Consistent MM/DD/YYYY format throughout
- **Sortable Interface**: Interactive table with sorting capabilities

### Formatting System
- **Currency**: `formatCurrency()` - $1,234.56 format with commas
- **Dates**: `formatDate()` - "January 12, 2024" and `formatDateShort()` - "01/12/2024"
- **Numbers**: `formatNumber()` - Comma-separated thousands
- **Centralized**: All formatting in `/utils/formatters.ts`

## Development Setup

### Prerequisites
- Python 3.8+ (for FastAPI backend)
- Node.js 18+ (for Next.js frontend)

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```
Server runs on http://localhost:8000

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Application runs on http://localhost:3000

### Development Workflow
1. Start backend server first
2. Start frontend development server
3. Navigate to http://localhost:3000
4. Backend API available at http://localhost:8000

### Production Build
```bash
# Frontend
cd frontend
npm run build
npm run start

# Backend  
cd backend
python main.py  # Configure for production environment
```

## Usage

### Navigation
1. **File Upload**: Upload any file type with drag & drop support
2. **Overview**: View project dashboard with real-time metrics
3. **Task Tracking**: Manage all project tasks with comprehensive details

### Project Metrics
- All budget and progress metrics are dynamically calculated from task data
- Top tasks automatically sorted by billable hours
- Completion percentage based on individual task progress
- Total spent budget calculated from billable hours × hourly rate

## Customization

### Adding Tasks
Edit `backend/tasks.json` to add/modify tasks. The overview dashboard will automatically update with new metrics.

### Extending Functionality
- Add new tabs in `src/components/tabs/`
- Extend API endpoints in `backend/main.py`
- Create new UI components in `src/components/ui/`
- Add formatters in `src/utils/formatters.ts`

## Production Considerations

- **File Upload**: Generic file handling for future extensions
- **Scalability**: JSON file can be replaced with database
- **Security**: CORS configured for development, update for production
- **Performance**: In-memory calculations for fast dashboard updates

This application provides a solid foundation for project management with room for custom business logic and extended functionality.