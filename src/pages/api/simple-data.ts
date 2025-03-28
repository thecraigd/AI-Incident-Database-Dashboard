import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parser';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Straightforward approach - just read incidents.csv
    const incidentsPath = path.join(process.cwd(), 'public', 'data', 'incidents.csv');
    
    if (!fs.existsSync(incidentsPath)) {
      return res.status(404).json({ error: 'Incidents file not found' });
    }
    
    const incidents: any[] = [];
    
    // Build a promise to read the CSV file
    const readCsvPromise = new Promise<any[]>((resolve, reject) => {
      fs.createReadStream(incidentsPath)
        .pipe(parse())
        .on('data', (data) => {
          // Simple transformation of the data
          try {
            // Just use the raw data with minimal processing
            incidents.push({
              ...data,
              incident_id: parseInt(data.incident_id) || 0
            });
          } catch (error) {
            console.error('Error processing row:', error);
          }
        })
        .on('end', () => {
          resolve(incidents);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
    
    // Wait for the CSV to be read
    const incidentData = await readCsvPromise;
    
    // Return the data
    res.status(200).json({
      incidents: incidentData.slice(0, 50), // Limit to 50 incidents for testing
      count: incidentData.length,
      source: 'real-simple'
    });
  } catch (error: any) {
    console.error('Error in simple-data API:', error);
    res.status(500).json({
      error: 'Error fetching data',
      message: error.message
    });
  }
}