# Data Processing Application Template - Architecture

## Overview

This is a clean, generic web application template designed for CSV data processing and analysis. The architecture follows modern best practices with a clear separation between frontend and backend concerns.

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (React 18)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Build Tool**: Next.js built-in bundler

### Backend
- **Framework**: FastAPI (Python)
- **Data Processing**: pandas, numpy
- **HTTP Server**: Uvicorn
- **Data Formats**: CSV processing

## Application Architecture

### Frontend Architecture

```
frontend/src/
├── app/                    # Next.js App Router
│   └── page.tsx           # Main application page with routing logic
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

### Backend Architecture

```
backend/
├── main.py                # FastAPI application with all endpoints
├── forecasting.py         # Generic forecasting module (extensible)
├── requirements.txt       # Python dependencies
└── server.log            # Runtime logs
```

## Key Components

### Frontend Components

#### Layout.tsx
- Main application shell with navigation
- Responsive sidebar navigation
- Mobile-friendly hamburger menu
- Clean, professional styling

#### FileUpload.tsx
- Single CSV file upload interface
- Drag-and-drop functionality
- File validation (CSV only)
- Upload progress and status indicators
- Error handling and user feedback

#### Overview.tsx
- Data preview table (first 5 rows)
- Basic statistics (row/column counts)
- Loading and error states
- Empty state when no data uploaded

#### UI Components
- **BreakdownTable.tsx**: Generic table for data display
- **ScoreGauge.tsx**: Generic gauge component for metrics

### Backend Endpoints

#### Core API Endpoints
- `GET /` - Health check endpoint
- `GET /api/data-status` - Check if data is loaded
- `POST /api/upload-data` - Single CSV file upload
- `GET /api/data-preview` - Get data preview (first 10 rows)
- `GET /api/data-summary` - Get statistical summary

#### Data Flow
1. **Upload**: CSV file received via multipart form data
2. **Validation**: File type validation (CSV only)
3. **Processing**: Parse CSV using pandas
4. **Storage**: In-memory DataFrame storage
5. **Analysis**: Basic statistical analysis on demand

## State Management

### Frontend State
- **Component-level state**: React useState for UI interactions
- **Props-based data flow**: Parent-child component communication
- **No global state**: Simple prop drilling for data sharing

### Backend State
- **In-memory storage**: Single DataFrame in application memory
- **Stateless API**: Each request is independent
- **Session-based**: Data persists for application lifetime

## Data Processing Pipeline

### Upload Flow
1. User selects CSV file in FileUpload component
2. File validation (type, size)
3. FormData creation and API call
4. Backend receives multipart form data
5. pandas.read_csv() parsing
6. DataFrame stored in app_data global variable
7. Success response with basic file info

### Preview Flow
1. User navigates to Overview tab
2. Component checks if data is loaded
3. API calls for preview and summary data
4. Backend returns processed data
5. Frontend renders table and statistics

## Extensibility Points

### Adding Custom Analysis
1. **New Backend Module**: Create custom analysis modules
2. **New API Endpoints**: Add endpoints in main.py
3. **Frontend Integration**: Add new components/tabs
4. **UI Extensions**: Create custom visualizations

### Example Extension
```python
# backend/custom_analyzer.py
def analyze_data(df):
    return custom_analysis_results

# main.py
@app.get("/api/custom-analysis")
async def get_custom_analysis():
    if app_data["data_df"] is None:
        raise HTTPException(status_code=400, detail="No data loaded")
    
    results = analyze_data(app_data["data_df"])
    return results
```

## Error Handling

### Frontend
- Component-level error boundaries
- User-friendly error messages
- Loading states for async operations
- Form validation and feedback

### Backend
- HTTP exception handling
- Detailed error messages
- Input validation
- Graceful failure modes

## Performance Considerations

### Frontend
- Component memoization where appropriate
- Lazy loading for large datasets
- Optimized table rendering
- Responsive design for mobile

### Backend
- In-memory DataFrame for fast access
- Pagination for large datasets
- Efficient pandas operations
- Minimal memory footprint

## Security Considerations

### File Upload Security
- File type validation (CSV only)
- File size limits
- No file system storage (memory only)
- Input sanitization

### API Security
- CORS configuration for development
- Input validation on all endpoints
- Error message sanitization
- No sensitive data exposure

## Development Workflow

### Local Development
1. Start backend: `python main.py`
2. Start frontend: `npm run dev`
3. Navigate to http://localhost:3000

### Production Deployment
1. Build frontend: `npm run build`
2. Start production servers
3. Configure reverse proxy if needed

## Testing Strategy

### Frontend Testing
- Component unit tests with Jest/Testing Library
- E2E tests with Playwright/Cypress
- Visual regression testing

### Backend Testing
- Unit tests with pytest
- API integration tests
- Data processing validation tests

This architecture provides a solid foundation for building custom data processing applications while maintaining clean separation of concerns and extensibility.