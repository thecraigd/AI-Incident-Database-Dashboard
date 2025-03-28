import type { NextApiRequest, NextApiResponse } from 'next';
import { processReports, Report } from '@/utils/dataProcessor';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Report[] | { message: string }>
) {
  try {
    const reports = await processReports();
    
    // Handle specific incident reports request
    const { incidentId } = req.query;
    
    if (incidentId) {
      const incidentIdNum = parseInt(incidentId as string);
      const filteredReports = reports.filter(
        report => report.incident_id === incidentIdNum
      );
      
      return res.status(200).json(filteredReports);
    }
    
    // Return all reports if no filter
    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
}