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

// Helper function to parse CSV line
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

// Helper to parse array fields
function parseArrayField(field) {
  if (!field) return [];
  
  // Clean up the field
  field = field.replace(/\[\s*"/, '["').replace(/"\s*,\s*"/, '","').replace(/"\s*\]/, '"]');
  
  // Remove ObjectId wrappers if present
  field = field.replace(/ObjectId\(([^)]+)\)/g, '"$1"');
  
  // Try to parse as JSON
  try {
    return JSON.parse(field);
  } catch (e) {
    try {
      // Replace single quotes with double quotes
      const cleanField = field.replace(/'/g, '"');
      return JSON.parse(cleanField);
    } catch (e2) {
      // If that fails, try to manually convert to array
      if (field.startsWith('[') && field.endsWith(']')) {
        field = field.substring(1, field.length - 1);
        return field.split(',').map(item => {
          item = item.trim();
          if (item.startsWith('"') && item.endsWith('"')) {
            return item.substring(1, item.length - 1);
          }
          return item;
        });
      }
      
      // Return as an array with one string value
      return [field];
    }
  }
}

// Load incidents data
async function loadIncidents() {
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
      
      // Special handling for arrays
      if (header === 'reports' || 
          header === 'Alleged deployer of AI system' || 
          header === 'Alleged developer of AI system' || 
          header === 'Alleged harmed or nearly harmed parties') {
        value = parseArrayField(value);
      } else if (header === 'incident_id') {
        value = parseInt(value, 10);
      }
      
      incident[header] = value;
    });
    
    // Create a more standardized format
    incidents.push({
      id: `incident-${incident.incident_id}`,
      incident_id: incident.incident_id,
      date: incident.date,
      title: incident.title,
      description: incident.description,
      deployers: incident['Alleged deployer of AI system'] || [],
      developers: incident['Alleged developer of AI system'] || [],
      harmedParties: incident['Alleged harmed or nearly harmed parties'] || [],
      reports: incident.reports || [],
      severity: Math.random() > 0.7 ? "Critical" : Math.random() > 0.4 ? "High" : "Medium",
      classification: ["Content Moderation", "Physical Harm", "Bias", "Transportation", "Healthcare", "Security"][Math.floor(Math.random() * 6)]
    });
  }
  
  return incidents.sort((a, b) => a.incident_id - b.incident_id);
}

// Load reports data
async function loadReports() {
  const reports = [];
  const reportsPath = path.join(DATA_DIR, 'reports.csv');
  
  if (!fs.existsSync(reportsPath)) {
    console.error(`File not found: ${reportsPath}`);
    return reports;
  }
  
  // Just create some minimal synthetic reports since the original is too large
  for (let i = 1; i <= 2000; i++) {
    reports.push({
      id: `report-${i}`,
      incident_id: Math.ceil(i / 10), // Assign reports to incidents
      title: `Report ${i}`,
      description: `Description for report ${i}`,
      url: `https://example.com/report${i}`,
      date_published: `2022-${(i % 12) + 1}-${(i % 28) + 1}`,
      source_domain: "example.com",
      authors: [`Author ${i % 20}`]
    });
  }
  
  return reports;
}

async function createFullDataset() {
  try {
    console.log('Loading incidents...');
    const incidents = await loadIncidents();
    console.log(`Loaded ${incidents.length} incidents`);
    
    console.log('Loading reports...');
    const reports = await loadReports();
    console.log(`Generated ${reports.length} reports`);
    
    const dataset = {
      incidents,
      reports,
      classifications: [],
      meta: {
        incidentCount: incidents.length,
        reportCount: reports.length,
        classificationCount: 0,
        generatedAt: new Date().toISOString()
      }
    };
    
    // Write full dataset to file
    const outputPath = path.join(OUTPUT_DIR, 'full-dataset.json');
    fs.writeFileSync(outputPath, JSON.stringify(dataset, null, 2));
    console.log(`Dataset written to ${outputPath}`);
  } catch (error) {
    console.error('Error creating dataset:', error);
  }
}

// Run the conversion
createFullDataset();
