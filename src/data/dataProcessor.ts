import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parser';
import { Incident, Report, Classification } from '@/utils/types';

// Helper to parse array fields from CSV
export const parseArrayField = (field: string): string[] => {
  if (!field) return [];
  
  // First check if it's a MongoDB array format like [elem1,elem2,elem3]
  if (field.startsWith('[') && field.endsWith(']')) {
    try {
      // Try to parse as JSON array with quotes added
      const cleanField = field
        .replace(/\[/g, '["')
        .replace(/\]/g, '"]')
        .replace(/,/g, '","')
        .replace(/"""/g, '"');
      const parsed = JSON.parse(cleanField);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      // If that fails, try this alternative approach
      try {
        const innerContent = field.substring(1, field.length - 1);
        return innerContent.split(',').map(item => item.trim());
      } catch (e2) {
        console.error('Error parsing array field:', field, e2);
        return [field];
      }
    }
  }
  
  try {
    // Try to parse as JSON array
    const parsed = JSON.parse(field.replace(/'/g, '"'));
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (e) {
    // If not valid JSON, split by comma
    return field.split(',').map(item => item.trim());
  }
};

export const processIncidents = async (): Promise<Incident[]> => {
  // Try multiple possible locations for the data file
  const possiblePaths = [
    path.join(process.cwd(), 'mongodump_full_snapshot', 'incidents.csv'),
    path.join(process.cwd(), 'public', 'data', 'incidents.csv')
  ];
  
  let incidentsPath;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      incidentsPath = p;
      break;
    }
  }
  
  if (!incidentsPath) {
    console.error('Could not find incidents.csv file');
    return [];
  }
  
  return new Promise((resolve, reject) => {
    const results: Incident[] = [];
    
    fs.createReadStream(incidentsPath)
      .pipe(parse())
      .on('data', (data) => {
        try {
          // Parse the date with fallback to current date if invalid
          let incidentDate: Date;
          try {
            incidentDate = new Date(data.date);
            // Check if date is valid
            if (isNaN(incidentDate.getTime())) {
              console.warn(`Invalid date for incident ${data.incident_id}: ${data.date}`);
              incidentDate = new Date(); // Fallback to current date
            }
          } catch (error) {
            console.warn(`Error parsing date for incident ${data.incident_id}: ${data.date}`);
            incidentDate = new Date(); // Fallback to current date
          }
          
          const incident: Incident = {
            id: data._id || `incident-${data.incident_id}`,
            incident_id: parseInt(data.incident_id) || 0,
            date: incidentDate,
            title: data.title || `Untitled Incident ${data.incident_id}`,
            description: data.description || 'No description available',
            deployers: parseArrayField(data['Alleged deployer of AI system'] || '[]'),
            developers: parseArrayField(data['Alleged developer of AI system'] || '[]'),
            harmedParties: parseArrayField(data['Alleged harmed or nearly harmed parties'] || '[]'),
            reports: parseArrayField(data.reports || '[]').map(Number),
          };
          results.push(incident);
        } catch (error) {
          console.error('Error processing incident:', error);
        }
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

export const processReports = async (): Promise<Report[]> => {
  // Try multiple possible locations for the data file
  const possiblePaths = [
    path.join(process.cwd(), 'mongodump_full_snapshot', 'reports.csv'),
    path.join(process.cwd(), 'public', 'data', 'reports.csv')
  ];
  
  let reportsPath;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      reportsPath = p;
      break;
    }
  }
  
  if (!reportsPath) {
    console.error('Could not find reports.csv file');
    return [];
  }
  
  return new Promise((resolve, reject) => {
    const results: Report[] = [];
    
    fs.createReadStream(reportsPath)
      .pipe(parse())
      .on('data', (data) => {
        try {
          if (!data.incident_id) return; // Skip reports not linked to incidents
          
          // Parse the date with fallback
          let publishedDate: Date;
          try {
            publishedDate = new Date(data.date_published);
            if (isNaN(publishedDate.getTime())) {
              publishedDate = new Date();
            }
          } catch (error) {
            publishedDate = new Date();
          }
          
          const report: Report = {
            id: data._id || `report-${data.incident_id}-${Math.random().toString(36).substring(2, 7)}`,
            incident_id: parseInt(data.incident_id) || 0,
            title: data.title || 'Untitled Report',
            description: data.description || 'No description available',
            url: data.url || '#',
            date_published: publishedDate,
            source_domain: data.source_domain || 'unknown',
            authors: parseArrayField(data.authors || '[]'),
          };
          results.push(report);
        } catch (error) {
          console.error('Error processing report:', error);
        }
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

export const processClassifications = async (): Promise<Classification[]> => {
  // Try multiple possible locations for the data file
  const possiblePaths = [
    path.join(process.cwd(), 'mongodump_full_snapshot', 'classifications_CSETv1.csv'),
    path.join(process.cwd(), 'public', 'data', 'classifications_CSETv1.csv')
  ];
  
  let classificationsPath;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      classificationsPath = p;
      break;
    }
  }
  
  if (!classificationsPath) {
    console.error('Could not find classifications_CSETv1.csv file');
    return [];
  }
  
  return new Promise((resolve, reject) => {
    const results: Classification[] = [];
    
    fs.createReadStream(classificationsPath)
      .pipe(parse())
      .on('data', (data) => {
        try {
          if (!data['Incident ID'] || data['Incident ID'] === '0') return;
          
          const classification: Classification = {
            incident_id: parseInt(data['Incident ID']) || 0,
            harm_type: data['Harm Domain'] || undefined,
            harm_domain: data['Harm Domain'] || undefined, 
            sector: data['Sector of Deployment'] || undefined,
            ai_system: data['AI System Description'] || undefined,
            region: data['Location Region'] || undefined,
            severity: data['AI Harm Level'] || undefined,
          };
          results.push(classification);
        } catch (error) {
          console.error('Error processing classification:', error);
        }
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

export const enrichIncidentsWithClassifications = (
  incidents: Incident[],
  classifications: Classification[]
): Incident[] => {
  const classificationMap = new Map<number, Classification>();
  
  // Create a map of incident_id to classification
  classifications.forEach(classification => {
    classificationMap.set(classification.incident_id, classification);
  });
  
  // Enrich incidents with classification data
  return incidents.map(incident => {
    const classification = classificationMap.get(incident.incident_id);
    
    if (classification) {
      return {
        ...incident,
        severity: classification.severity || undefined,
        classification: classification.harm_type || undefined,
      };
    }
    
    return incident;
  });
};