const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// Paths
const incidentsPath = path.join(__dirname, '../mongodump_full_snapshot/incidents.csv');
const reportsPath = path.join(__dirname, '../mongodump_full_snapshot/reports.csv');
const outputPath = path.join(__dirname, '../public/data');

// Ensure output directory exists
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

// Parse incidents
console.log('Parsing incidents data...');
const incidentsFile = fs.readFileSync(incidentsPath, 'utf8');
const incidents = Papa.parse(incidentsFile, {
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true
}).data;

// Process incidents
const processedIncidents = incidents.map(incident => {
  // Convert report IDs from string to array of numbers if it's a string
  let reports = incident.reports;
  if (typeof reports === 'string') {
    try {
      reports = JSON.parse(reports.replace(/'/g, '"'));
    } catch (e) {
      reports = [];
    }
  }
  
  // Process other fields
  let deployer = [];
  if (incident['Alleged deployer of AI system'] && typeof incident['Alleged deployer of AI system'] === 'string') {
    try {
      deployer = JSON.parse(incident['Alleged deployer of AI system'].replace(/'/g, '"'));
    } catch (e) {
      deployer = [incident['Alleged deployer of AI system']];
    }
  }

  let developer = [];
  if (incident['Alleged developer of AI system'] && typeof incident['Alleged developer of AI system'] === 'string') {
    try {
      developer = JSON.parse(incident['Alleged developer of AI system'].replace(/'/g, '"'));
    } catch (e) {
      developer = [incident['Alleged developer of AI system']];
    }
  }

  let harmedParties = [];
  if (incident['Alleged harmed or nearly harmed parties'] && typeof incident['Alleged harmed or nearly harmed parties'] === 'string') {
    try {
      harmedParties = JSON.parse(incident['Alleged harmed or nearly harmed parties'].replace(/'/g, '"'));
    } catch (e) {
      harmedParties = [incident['Alleged harmed or nearly harmed parties']];
    }
  }

  // Create a cleaned incident object
  return {
    id: incident.incident_id,
    date: incident.date,
    title: incident.title,
    description: incident.description,
    reports: reports,
    deployer: deployer,
    developer: developer,
    harmedParties: harmedParties,
    year: new Date(incident.date).getFullYear()
  };
}).filter(incident => incident.id && incident.date);

// Parse reports (limited to first 1000 to avoid memory issues)
console.log('Parsing reports data...');
const reportsFile = fs.readFileSync(reportsPath, 'utf8');
let reportLines = reportsFile.split('\n');
// Process only header + first 1000 lines for memory efficiency
const reportsSample = reportLines.slice(0, 1001).join('\n');
const reports = Papa.parse(reportsSample, {
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true
}).data;

// Process reports
const processedReports = reports.map(report => {
  // Extract the key information
  return {
    id: report.report_number,
    incidentId: report.incident_id,
    title: report.title,
    url: report.url,
    source: report.source_domain,
    date: report.date_published,
    authors: typeof report.authors === 'string' ? JSON.parse(report.authors.replace(/'/g, '"')) : [],
    text: report.text && report.text.substring(0, 500) + (report.text.length > 500 ? '...' : '') // Limit text length
  };
}).filter(report => report.id);

// Calculate some statistics
const incidentsByYear = {};
processedIncidents.forEach(incident => {
  const year = incident.year;
  if (year) {
    incidentsByYear[year] = (incidentsByYear[year] || 0) + 1;
  }
});

// Extract entities (developers, deployers, harmed parties)
const entities = new Set();
processedIncidents.forEach(incident => {
  incident.deployer.forEach(d => entities.add(d));
  incident.developer.forEach(d => entities.add(d));
  incident.harmedParties.forEach(d => entities.add(d));
});

// Group incidents by entities
const incidentsByEntity = {};
Array.from(entities).forEach(entity => {
  incidentsByEntity[entity] = processedIncidents.filter(incident => 
    incident.deployer.includes(entity) || 
    incident.developer.includes(entity) || 
    incident.harmedParties.includes(entity)
  ).map(incident => incident.id);
});

// Save processed data
fs.writeFileSync(path.join(outputPath, 'incidents.json'), JSON.stringify(processedIncidents, null, 2));
fs.writeFileSync(path.join(outputPath, 'reports.json'), JSON.stringify(processedReports, null, 2));
fs.writeFileSync(path.join(outputPath, 'statistics.json'), JSON.stringify({
  incidentsByYear,
  totalIncidents: processedIncidents.length,
  entities: Array.from(entities),
  incidentsByEntity
}, null, 2));

console.log('Data conversion complete. Files saved to public/data/');