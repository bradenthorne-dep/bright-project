/**
 * Project Logo Mapping Utility
 * 
 * Maps client/project names to their specific logo files.
 * Falls back to default logo if no specific logo is available.
 */

// Default logo to use when no specific logo is available
const DEFAULT_LOGO = '/deposco_primary-logo_color_rev.svg';

// Mapping of client names to their logo files
const PROJECT_LOGO_MAP: Record<string, string> = {
  'Gerber4': '/gerberlogo.avif',
  'GERBER': '/gerberlogo.avif',
  'Gerber': '/gerberlogo.avif',
  'gerber': '/gerberlogo.avif',
  'Bright': '/bright_project_small_logo.png',
  'Bright Project': '/bright_project_main_logo.png',
  'TechCorp Solutions': '/techcorp_logo.png',
  'TechCorp': '/techcorp_logo.png',
  'techcorp': '/techcorp_logo.png',
  'EcoAtm': '/ecoatm_logo.png',
  'EcoATM': '/ecoatm_logo.png',
  'ecoatm': '/ecoatm_logo.png',
  'Neovia': '/neovia_logo.png',
  'neovia': '/neovia_logo.png',
  'CDCBME': '/CDCBME_logo.png',
  'cdcbme': '/CDCBME_logo.png',
  'Acme Manufacturing': '/acme_logo.jpeg',
  'Acme': '/acme_logo.jpeg',
  'acme': '/acme_logo.jpeg',
  'Global Retail Inc': '/globalretail_logo.png',
  'GlobalRetail': '/globalretail_logo.png',
  'globalretail': '/globalretail_logo.png',
  'Patterson': '/patterson_logo.png',
  'patterson': '/patterson_logo.png',
};

/**
 * Get the logo path for a specific project/client
 * @param clientName - The name of the client/project
 * @returns The path to the logo file
 */
export function getProjectLogo(clientName: string): string {
  console.log(`Looking for logo for client: "${clientName}"`);
  
  // Try exact match first
  if (PROJECT_LOGO_MAP[clientName]) {
    console.log(`Found exact match: ${PROJECT_LOGO_MAP[clientName]}`);
    return PROJECT_LOGO_MAP[clientName];
  }
  
  // Try case-insensitive match
  const lowerClientName = clientName.toLowerCase();
  for (const [key, value] of Object.entries(PROJECT_LOGO_MAP)) {
    if (key.toLowerCase() === lowerClientName) {
      console.log(`Found case-insensitive match: ${value}`);
      return value;
    }
  }
  
  // Try partial match (useful for variations like "Gerber4" matching "gerber")
  for (const [key, value] of Object.entries(PROJECT_LOGO_MAP)) {
    if (lowerClientName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerClientName)) {
      console.log(`Found partial match: ${value}`);
      return value;
    }
  }
  
  // Fall back to default logo
  console.log(`No match found, using default: ${DEFAULT_LOGO}`);
  return DEFAULT_LOGO;
}

/**
 * Get the alt text for a project logo
 * @param clientName - The name of the client/project
 * @returns Appropriate alt text for the logo
 */
export function getProjectLogoAlt(clientName: string): string {
  const logoPath = getProjectLogo(clientName);
  
  // If using project-specific logo, use project name
  if (logoPath !== DEFAULT_LOGO) {
    return `${clientName} Logo`;
  }
  
  // If using default logo, use generic text
  return 'Project Logo';
}

/**
 * Check if a project has a specific logo (not using default)
 * @param clientName - The name of the client/project
 * @returns True if project has a specific logo
 */
export function hasProjectSpecificLogo(clientName: string): boolean {
  return getProjectLogo(clientName) !== DEFAULT_LOGO;
}

/**
 * Add a new project logo mapping
 * @param clientName - The name of the client/project
 * @param logoPath - The path to the logo file
 */
export function addProjectLogo(clientName: string, logoPath: string): void {
  PROJECT_LOGO_MAP[clientName] = logoPath;
}