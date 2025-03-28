const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Paths
const DATA_DIR = path.join(process.cwd(), 'mongodump_full_snapshot');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'data');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper to parse CSV lines
function parseCSVLine(line) {
  const result = [];
  let inQuotes = false;
  let currentValue = '';
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      // Toggle quote state
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(currentValue);
      currentValue = '';
    } else {
      // Add character to current field
      currentValue += char;
    }
  }
  
  // Add the last field
  result.push(currentValue);
  
  return result;
}

// Helper to parse array fields from MongoDB CSV export
function parseArrayField(field) {
  if (!field) return [];
  
  // Remove ObjectId wrappers if present
  field = field.replace(/ObjectId\(([^)]+)\)/g, '"$1"');
  
  // Try to parse as JSON
  try {
    // First try directly
    return JSON.parse(field);
  } catch (e) {
    // If that fails, try to clean it up
    try {
      // Replace single quotes with double quotes
      const cleanField = field.replace(/'/g, '"');
      return JSON.parse(cleanField);
    } catch (e2) {
      // If that still fails, check if it's an array format
      if (field.startsWith('[') && field.endsWith(']')) {
        // Split by commas, handling potential quotes
        const items = field.substring(1, field.length - 1).split(',');
        return items.map(item => {
          item = item.trim();
          // Remove quotes if present
          if ((item.startsWith('"') && item.endsWith('"')) || 
              (item.startsWith("'") && item.endsWith("'"))) {
            item = item.substring(1, item.length - 1);
          }
          return item;
        });
      }
      
      // If all else fails, return as a single-item array
      return [field];
    }
  }
}

// Process incidents CSV to JSON
async function processIncidents() {
  console.log('Processing incidents...');
  const incidents = [];
  const incidentsPath = path.join(DATA_DIR, 'incidents.csv');
  
  if (!fs.existsSync(incidentsPath)) {
    console.error(`File not found: ${incidentsPath}`);
    return incidents;
  }
  
  const fileStream = fs.createReadStream(incidentsPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  let headers = [];
  let isFirstLine = true;
  
  for await (const line of rl) {
    if (isFirstLine) {
      headers = parseCSVLine(line);
      isFirstLine = false;
      continue;
    }
    
    const values = parseCSVLine(line);
    const incident = {};
    
    // Map values to headers
    headers.forEach((header, index) => {
      let value = values[index] || '';
      
      // Special handling for specific fields
      if (header === 'reports' || 
          header === 'Alleged deployer of AI system' || 
          header === 'Alleged developer of AI system' || 
          header === 'Alleged harmed or nearly harmed parties') {
        value = parseArrayField(value);
      } else if (header === 'incident_id') {
        value = parseInt(value);
      }
      
      incident[header] = value;
    });
    
    // Map fields to more user-friendly names
    const processedIncident = {
      id: incident._id || `incident-${incident.incident_id}`,
      incident_id: incident.incident_id,
      date: incident.date,
      title: incident.title || `Incident ${incident.incident_id}`,
      description: incident.description || 'No description available',
      deployers: incident['Alleged deployer of AI system'] || [],
      developers: incident['Alleged developer of AI system'] || [],
      harmedParties: incident['Alleged harmed or nearly harmed parties'] || [],
      reports: incident.reports || []
    };
    
    incidents.push(processedIncident);
  }
  
  console.log(`Processed ${incidents.length} incidents`);
  return incidents;
}

// Process reports CSV to JSON
async function processReports() {
  console.log('Processing reports...');
  const reports = [];
  const reportsPath = path.join(DATA_DIR, 'reports.csv');
  
  if (!fs.existsSync(reportsPath)) {
    console.error(`File not found: ${reportsPath}`);
    return reports;
  }
  
  const fileStream = fs.createReadStream(reportsPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  let headers = [];
  let isFirstLine = true;
  
  for await (const line of rl) {
    if (isFirstLine) {
      headers = parseCSVLine(line);
      isFirstLine = false;
      continue;
    }
    
    const values = parseCSVLine(line);
    const report = {};
    
    // Map values to headers
    headers.forEach((header, index) => {
      let value = values[index] || '';
      
      // Special handling for specific fields
      if (header === 'authors' || header === 'submitters' || header === 'tags') {
        value = parseArrayField(value);
      } else if (header === 'incident_id') {
        value = value ? parseInt(value) : null;
      }
      
      report[header] = value;
    });
    
    // Skip reports not linked to incidents
    if (!report.incident_id) continue;
    
    // Map fields to more user-friendly names
    const processedReport = {
      id: report._id || `report-${Math.random().toString(36).substring(2, 9)}`,
      incident_id: report.incident_id,
      title: report.title || 'Untitled Report',
      description: report.description || 'No description available',
      url: report.url || '#',
      date_published: report.date_published || null,
      source_domain: report.source_domain || 'unknown',
      authors: report.authors || []
    };
    
    reports.push(processedReport);
  }
  
  console.log(`Processed ${reports.length} reports`);
  return reports;
}

// Process classifications CSV to JSON
async function processClassifications() {
  console.log('Processing classifications...');
  const classifications = [];
  const classificationsPath = path.join(DATA_DIR, 'classifications_CSETv1.csv');
  
  if (!fs.existsSync(classificationsPath)) {
    console.error(`File not found: ${classificationsPath}`);
    return classifications;
  }
  
  const fileStream = fs.createReadStream(classificationsPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  let headers = [];
  let isFirstLine = true;
  
  for await (const line of rl) {
    if (isFirstLine) {
      headers = parseCSVLine(line);
      isFirstLine = false;
      continue;
    }
    
    const values = parseCSVLine(line);
    const classification = {};
    
    // Map values to headers
    headers.forEach((header, index) => {
      classification[header] = values[index] || '';
    });
    
    // Skip entries without incident IDs or with zero as incident ID
    if (!classification['Incident ID'] || classification['Incident ID'] === '0') continue;
    
    // Map fields to more user-friendly names
    const processedClassification = {
      incident_id: parseInt(classification['Incident ID']),
      harm_type: classification['Harm Domain'] || undefined,
      sector: classification['Sector of Deployment'] || undefined,
      ai_system: classification['AI System Description'] || undefined,
      region: classification['Location Region'] || undefined,
      severity: classification['AI Harm Level'] || undefined
    };
    
    classifications.push(processedClassification);
  }
  
  console.log(`Processed ${classifications.length} classifications`);
  return classifications;
}

// Enriches incidents with classification data
function enrichIncidentsWithClassifications(incidents, classifications) {
  console.log('Enriching incidents with classifications...');
  
  const classificationMap = new Map();
  classifications.forEach(classification => {
    classificationMap.set(classification.incident_id, classification);
  });
  
  return incidents.map(incident => {
    const classification = classificationMap.get(incident.incident_id);
    
    if (classification) {
      return {
        ...incident,
        severity: classification.severity || undefined,
        classification: classification.harm_type || undefined,
        sector: classification.sector || undefined,
        region: classification.region || undefined
      };
    }
    
    return incident;
  });
}

// Main function
async function main() {
  try {
    console.log('Starting CSV to JSON conversion...');
    
    // Process each dataset
    const incidents = await processIncidents();
    const reports = await processReports(); 
    const classifications = await processClassifications();
    
    // Enrich incidents with classification data
    const enrichedIncidents = enrichIncidentsWithClassifications(incidents, classifications);
    
    // Create the output JSON
    const output = {
      incidents: enrichedIncidents,
      reports: reports,
      classifications: classifications,
      meta: {
        incidentCount: enrichedIncidents.length,
        reportCount: reports.length,
        classificationCount: classifications.length,
        generatedAt: new Date().toISOString()
      }
    };
    
    // Write the output to the file
    const outputPath = path.join(OUTPUT_DIR, 'full-dataset.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    
    console.log(`Conversion complete! Output written to ${outputPath}`);
    console.log(`Total incidents: ${output.meta.incidentCount}`);
    console.log(`Total reports: ${output.meta.reportCount}`);
    console.log(`Total classifications: ${output.meta.classificationCount}`);
  } catch (error) {
    console.error('Error during conversion:', error);
  }
}

// Run the main function
main();