# Data Processing Application - Frontend

A clean, modern React frontend for CSV data processing and analysis, built with Next.js 15 and TypeScript.

## Features

- **Single CSV Upload**: Clean drag-and-drop interface for file uploads
- **Data Overview**: Basic data preview and statistical summary
- **Responsive Design**: Mobile-friendly layout with sidebar navigation
- **Modern UI**: Clean, professional styling with TailwindCSS
- **Type Safety**: Full TypeScript integration
- **Error Handling**: User-friendly error states and loading indicators

## Tech Stack

- **Framework**: Next.js 15 (React 18)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Build Tool**: Next.js built-in bundler

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # Run TypeScript checks
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main application page
├── components/
│   ├── layout/
│   │   └── Layout.tsx     # Main layout with navigation
│   ├── tabs/              # Main application screens
│   │   ├── FileUpload.tsx # CSV file upload interface
│   │   └── Overview.tsx   # Data preview and summary
│   └── ui/                # Reusable UI components
│       ├── BreakdownTable.tsx # Generic table component
│       └── ScoreGauge.tsx     # Generic gauge component
└── services/
    └── api.ts             # API client and type definitions
```

## Component Overview

### Layout Components

#### Layout.tsx
- Main application shell with sidebar navigation
- Responsive design with mobile hamburger menu
- Clean, professional styling
- Tab-based navigation system

### Application Tabs

#### FileUpload.tsx
- Single CSV file upload interface
- Drag-and-drop functionality with visual feedback
- File type validation (CSV only)
- Upload progress indicators
- Error handling and success messages
- Data status checking

#### Overview.tsx
- Data preview table showing first 5 rows
- Basic statistics (row count, column count)
- Loading states and error handling
- Empty state when no data is available
- Responsive table design

### UI Components

#### BreakdownTable.tsx
- Generic, reusable table component
- Supports any data structure
- Responsive design with horizontal scrolling
- Clean, professional styling

#### ScoreGauge.tsx
- Reusable gauge component for metrics
- Customizable colors and ranges
- Smooth animations
- Responsive design

## API Integration

### API Service (api.ts)
Centralized API client with TypeScript interfaces:

```typescript
// Main API methods
apiService.uploadData(file)     // Upload CSV file
apiService.getDataStatus()      // Check data status
apiService.getDataPreview()     // Get data preview
apiService.getDataSummary()     // Get statistical summary
apiService.healthCheck()        // Health check
```

### Type Definitions
- **DataStatusResponse**: Data loading status
- **DataPreviewResponse**: Data preview structure  
- **DataSummaryResponse**: Statistical summary format

## Styling

### TailwindCSS Configuration
- Custom utility classes for consistent design
- Responsive breakpoints for mobile-first design
- Color palette optimized for data applications
- Component-specific styling patterns

### CSS Classes
```css
/* Common utility classes */
.card              /* Standard card container */
.card-content      /* Card content padding */
.card-header       /* Card header styling */
.btn               /* Base button styles */
.btn-primary       /* Primary button variant */
.btn-secondary     /* Secondary button variant */
.kpi-table         /* Data table styling */
.file-upload-area  /* File upload drop zone */
```

## Development Guidelines

### Component Structure
- Use functional components with hooks
- Implement proper TypeScript typing
- Include loading and error states
- Follow responsive design patterns
- Use semantic HTML elements

### State Management
- Component-level state with useState
- Props-based data flow between components
- No global state management (simple prop drilling)
- Lift state up when needed for sharing

### Error Handling
- User-friendly error messages
- Loading states for async operations
- Form validation and feedback
- Graceful fallbacks for failed requests

## Customization

### Adding New Tabs
1. Create component in `src/components/tabs/`
2. Add navigation item to `Layout.tsx`
3. Add route handling in `page.tsx`
4. Implement proper TypeScript interfaces

### Extending UI Components
1. Add reusable components to `src/components/ui/`
2. Follow existing component patterns
3. Include proper TypeScript props
4. Add responsive design considerations

### Custom Styling
1. Extend TailwindCSS configuration
2. Add custom utility classes
3. Maintain consistent design patterns
4. Test across different screen sizes

## Build and Deployment

### Production Build
```bash
npm run build    # Creates optimized production build
npm run start    # Serves production build locally
```

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000  # Backend API URL
```

### Deployment Options
- **Vercel**: Zero-config deployment for Next.js
- **Netlify**: Static site hosting with serverless functions
- **Docker**: Containerized deployment
- **Traditional hosting**: Build and serve static files

This frontend provides a clean, extensible foundation for building custom data processing applications with a professional user interface and modern development practices.