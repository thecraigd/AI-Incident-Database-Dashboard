import type { NextApiRequest, NextApiResponse } from 'next';
import {
  processIncidents,
  processReports,
  processClassifications,
  enrichIncidentsWithClassifications
} from '@/data/dataProcessor';
import { Incident, Report } from '@/utils/types';

// Generate mock data if real data processing fails
const generateMockData = () => {
  const mockIncidents: Incident[] = Array.from({ length: 50 }).map((_, i) => ({
    id: `mock-${i}`,
    incident_id: i,
    date: new Date(2018 + Math.floor(i / 10), i % 12, (i % 28) + 1),
    title: `Mock Incident ${i + 1}`,
    description: `This is a mock incident for testing purposes (#${i + 1})`,
    deployers: ['Mock Company A', 'Mock Company B'],
    developers: ['Mock Developer X', 'Mock Developer Y'],
    harmedParties: ['Mock Users'],
    reports: [i],
    severity: ['Low', 'Medium', 'High', 'Critical'][i % 4],
    classification: ['Privacy', 'Bias', 'Security', 'Safety'][i % 4]
  }));
  
  const mockReports: Report[] = mockIncidents.map(incident => ({
    id: `mock-report-${incident.incident_id}`,
    incident_id: incident.incident_id,
    title: `Report on ${incident.title}`,
    description: `A detailed report about ${incident.title}`,
    url: 'https://example.com',
    date_published: incident.date,
    source_domain: 'example.com',
    authors: ['Mock Author']
  }));
  
  return { mockIncidents, mockReports };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('API: Data endpoint called');
    
    // Use query parameter to force mock data
    const useMockData = req.query.mock === 'true';
    
    if (useMockData) {
      console.log('API: Using mock data as requested');
      const { mockIncidents, mockReports } = generateMockData();
      return res.status(200).json({
        incidents: mockIncidents,
        reports: mockReports,
        source: 'mock'
      });
    }
    
    // Process the real data files
    let incidents = [];
    let reports = [];
    let classifications = [];
    
    console.log('API: Processing incidents');
    try {
      incidents = await processIncidents();
      console.log(`API: Processed ${incidents.length} incidents`);
    } catch (error) {
      console.error('Error processing incidents:', error);
    }
    
    console.log('API: Processing reports');
    try {
      reports = await processReports();
      console.log(`API: Processed ${reports.length} reports`);
    } catch (error) {
      console.error('Error processing reports:', error);
    }
    
    console.log('API: Processing classifications');
    try {
      classifications = await processClassifications();
      console.log(`API: Processed ${classifications.length} classifications`);
    } catch (error) {
      console.error('Error processing classifications:', error);
    }
    
    // If we don't have real data, fall back to mock data
    if (incidents.length === 0) {
      console.log('API: No real incident data found, using mock data');
      const { mockIncidents, mockReports } = generateMockData();
      return res.status(200).json({
        incidents: mockIncidents,
        reports: mockReports,
        source: 'mock-fallback'
      });
    }
    
    // Enrich incidents with classification data
    console.log('API: Enriching incidents with classifications');
    const enrichedIncidents = enrichIncidentsWithClassifications(incidents, classifications);
    
    console.log('API: Sending response with real data');
    res.status(200).json({
      incidents: enrichedIncidents,
      reports: reports,
      source: 'real'
    });
  } catch (error) {
    console.error('Error in data API:', error);
    
    // Always fall back to mock data on error
    const { mockIncidents, mockReports } = generateMockData();
    
    res.status(200).json({
      incidents: mockIncidents,
      reports: mockReports,
      source: 'mock-error'
    });
  }
}