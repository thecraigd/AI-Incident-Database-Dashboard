import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    // Read incidents data from the processed JSON file
    const dataDirectory = path.join(process.cwd(), 'public', 'data');
    const incidentsFilePath = path.join(dataDirectory, 'incidents.json');
    
    if (!fs.existsSync(incidentsFilePath)) {
      return res.status(404).json({ error: 'Incidents data not found' });
    }
    
    const incidentsData = JSON.parse(fs.readFileSync(incidentsFilePath, 'utf8'));
    
    res.status(200).json(incidentsData);
  } catch (error) {
    console.error('Error reading incidents data:', error);
    res.status(500).json({ error: 'Failed to load incidents data' });
  }
}