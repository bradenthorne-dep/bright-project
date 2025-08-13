# Project Logo System

This system automatically displays unique logos for each project on the home page overview.

## How It Works

1. **Dynamic Logo Loading**: The `getProjectLogo()` function automatically maps project/client names to their specific logo files
2. **Fallback System**: If no specific logo is found, it uses the default Deposco logo
3. **Case-Insensitive Matching**: Works with variations like "Gerber4", "GERBER", "Gerber", etc.

## Current Project Logos

- **Gerber4/GERBER/Gerber**: `/logos/gerber.avif` (✅ Available)
- **All other projects**: Default Deposco logo (fallback)

## Adding New Project Logos

### Step 1: Add Logo File
1. Copy the project logo to `/frontend/public/logos/`
2. Use a standardized naming convention: `projectname.extension`
   - Example: `techcorp.svg`, `acme.png`, `globalretail.jpg`

### Step 2: Update Logo Mapping
Edit `/frontend/src/utils/projectLogos.ts`:

```typescript
const PROJECT_LOGO_MAP: Record<string, string> = {
  'Gerber4': '/logos/gerber.avif',
  'GERBER': '/logos/gerber.avif',
  'Gerber': '/logos/gerber.avif',
  'gerber': '/logos/gerber.avif',
  
  // Add new project logos here:
  'TechCorp Solutions': '/logos/techcorp.svg',
  'Acme Manufacturing': '/logos/acme.png',
  'Global Retail Inc': '/logos/globalretail.jpg',
  // Add variations if needed:
  'TechCorp': '/logos/techcorp.svg',
  'TECHCORP': '/logos/techcorp.svg',
};
```

### Step 3: Test
1. Restart the development server
2. Navigate to the home page
3. Verify the new logo appears for the correct project

## Supported File Formats

- **Vector**: `.svg` (recommended for scalability)
- **Raster**: `.png`, `.jpg`, `.jpeg`, `.webp`, `.avif`
- **Legacy**: `.gif`

## Best Practices

1. **Optimize Images**: Compress images for web use
2. **Consistent Sizing**: Logos should work well in a 64px height container
3. **Background Consideration**: The logo area has a dark gray background (`bg-gray-800`)
4. **Naming Convention**: Use lowercase project names in file names
5. **Multiple Variations**: Add all possible client name variations to the mapping

## Example Usage

```typescript
// In your component:
import { getProjectLogo, getProjectLogoAlt } from '@/utils/projectLogos';

// Usage:
<img 
  src={getProjectLogo('Gerber4')} 
  alt={getProjectLogoAlt('Gerber4')} 
  className="w-[90%] h-[90%] object-cover"
/>
```

## Future Enhancements

- Automatic logo detection from project directories
- Logo upload interface in the admin panel
- Dynamic logo resizing and optimization
- Logo preview in project selection dropdown