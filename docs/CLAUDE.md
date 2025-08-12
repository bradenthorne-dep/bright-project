# Data Processing Application Template - Claude Documentation

## Project Overview

This is a clean, generic web application template for CSV data processing and analysis. It has been stripped of all domain-specific functionality to serve as a foundation for building custom data processing applications.

### Key Purpose
- **Generic CSV Processing**: Upload and process any CSV file structure
- **Data Visualization**: Basic data preview and summary statistics
- **Template Foundation**: Clean codebase ready for custom business logic
- **Modern Stack**: Production-ready architecture with best practices

## Architecture Overview

### Technology Stack
- **Frontend**: Next.js 15 with TypeScript and TailwindCSS
- **Backend**: FastAPI (Python) with pandas for data processing
- **Data Processing**: Generic CSV parsing and basic statistical analysis
- **UI Components**: Reusable components for data display

### Project Structure
```
data-processing-template/
├── backend/                   # Python FastAPI backend
│   ├── main.py               # Clean API server with basic endpoints
│   ├── forecasting.py        # Generic forecasting capability (extensible)
│   ├── requirements.txt      # Minimal Python dependencies
│   └── server.log           # Runtime logs
├── frontend/                  # Next.js React frontend
│   ├── src/app/              # Next.js App Router pages
│   ├── src/components/       # Clean component architecture
│   │   ├── layout/          # Layout and navigation
│   │   │   └── Layout.tsx   # Clean navigation with File Upload and Overview tabs
│   │   ├── tabs/            # Main application tabs
│   │   │   ├── FileUpload.tsx # Single CSV file upload interface
│   │   │   └── Overview.tsx   # Generic data preview and summary
│   │   └── ui/              # Reusable UI components
│   │       ├── BreakdownTable.tsx # Generic table component
│   │       └── ScoreGauge.tsx     # Generic gauge component
│   ├── src/services/        # API integration
│   │   └── api.ts          # Simplified API service layer
│   ├── package.json        # Frontend dependencies
│   └── README.md          # Frontend setup instructions
└── docs/                  # Project documentation
    ├── CLAUDE.md         # This file - Claude context
    ├── ARCHITECTURE.md   # Technical architecture details
    └── FORMATTING_GUIDELINES.md # Code style guidelines
```

## Core Features

### Backend API Endpoints
- `GET /` - Health check
- `GET /api/data-status` - Check if data is loaded
- `POST /api/upload-data` - Upload single CSV file
- `GET /api/data-preview` - Get first 10 rows of data
- `GET /api/data-summary` - Get basic statistics (row/column counts, data types, null counts)

### Frontend Components
- **File Upload Tab**: Clean drag-and-drop CSV upload interface
- **Overview Tab**: Basic data preview with summary statistics
- **Responsive Design**: Mobile-friendly layout with clean navigation
- **Error Handling**: User-friendly error states and loading indicators

## Development Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Customization Guidelines

### Adding Custom Business Logic
1. **Backend**: Add custom modules alongside `forecasting.py`
2. **API Endpoints**: Extend `main.py` with custom endpoints
3. **Frontend Components**: Add custom tabs in `src/components/tabs/`
4. **UI Components**: Extend `src/components/ui/` with custom visualizations

### Key Extension Points
- **Data Processing**: Extend backend with custom analysis modules
- **Visualization**: Add custom charts and graphs to Overview tab
- **Navigation**: Add new tabs to Layout navigation
- **API Integration**: Extend API service with custom endpoints

## Template Benefits

### Clean Foundation
- **No Domain Dependencies**: Zero business-specific logic
- **Modern Architecture**: Latest Next.js and FastAPI patterns
- **Type Safety**: Full TypeScript integration
- **Responsive Design**: Mobile-first TailwindCSS styling

### Production Ready
- **Error Handling**: Comprehensive error states
- **Loading States**: User-friendly loading indicators
- **API Design**: RESTful endpoints with proper HTTP codes
- **Code Organization**: Clear separation of concerns

### Extensible
- **Modular Design**: Easy to add custom functionality
- **Reusable Components**: Generic UI components for data display
- **Generic API**: Adaptable to any CSV structure
- **Documentation**: Clear guidelines for customization

## Commands

### Development
- `npm run dev` - Start frontend development server
- `python main.py` - Start backend API server

### Build
- `npm run build` - Build frontend for production
- `npm run start` - Start production frontend server

This template provides a solid foundation for building custom data processing applications while maintaining clean, maintainable code.