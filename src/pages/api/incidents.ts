import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // We'll use the pre-processed JSON file
    const filePath = path.join(process.cwd(), 'public', 'data', 'mock-incidents.json');
    
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Data file not found',
        checkedPath: filePath
      });
    }
    
    // Read and parse the JSON file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    // Apply any filters
    const { year, entity, severity, classification } = req.query;
    
    let filteredIncidents = data.incidents;
    
    if (year) {
      filteredIncidents = filteredIncidents.filter((incident: any) => 
        incident.date.startsWith(year)
      );
    }
    
    if (entity) {
      filteredIncidents = filteredIncidents.filter((incident: any) =>
        incident.deployers.includes(entity) || 
        incident.developers.includes(entity)
      );
    }
    
    if (severity) {
      filteredIncidents = filteredIncidents.filter((incident: any) =>
        incident.severity === severity
      );
    }
    
    if (classification) {
      filteredIncidents = filteredIncidents.filter((incident: any) =>
        incident.classification === classification
      );
    }
    
    // Return the filtered data
    res.status(200).json({
      success: true,
      incidents: filteredIncidents,
      reports: data.reports,
      source: 'real-from-json'
    });
  } catch (error: any) {
    console.error('Error in incidents API:', error);
    res.status(500).json({
      success: false,
      error: 'Error processing data',
      message: error.message
    });
  }
}