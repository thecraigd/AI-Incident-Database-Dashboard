export interface Incident {
  id: string;
  incident_id: number;
  date: Date | string;
  title: string;
  description: string;
  deployers: string[];
  developers: string[];
  harmedParties: string[];
  reports: number[];
  severity?: string;
  classification?: string;
}

export interface Report {
  id: string;
  incident_id: number;
  title: string;
  description: string;
  url: string;
  date_published: Date | string;
  source_domain: string;
  authors: string[];
}

export interface Classification {
  incident_id: number;
  harm_type?: string;
  harm_domain?: string; 
  sector?: string;
  ai_system?: string;
  region?: string;
  severity?: string;
}

// Helper function to format date for display
export const formatDate = (date: Date | string): string => {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Unknown date';
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};