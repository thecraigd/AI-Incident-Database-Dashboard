import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'incidents.csv');
    console.log('Checking file path:', filePath);
    
    // Check if the file exists
    const fileExists = fs.existsSync(filePath);
    if (!fileExists) {
      return res.status(404).json({
        success: false,
        error: 'File not found',
        checkedPath: filePath
      });
    }
    
    // Read the file as text
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Simple CSV parsing - split by lines and then by commas
    const lines = fileContent.split('\n');
    const headers = lines[0].split(',');
    
    // Parse just the first 5 rows for testing
    const rows = [];
    for (let i = 1; i < Math.min(lines.length, 6); i++) {
      if (!lines[i].trim()) continue; // Skip empty lines
      
      const values = lines[i].split(',');
      const row: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      rows.push(row);
    }
    
    // Return the results
    res.status(200).json({
      success: true,
      fileExists,
      headers,
      rows,
      totalLines: lines.length,
      filePreview: fileContent.slice(0, 1000) // First 1000 chars for preview
    });
  } catch (error: any) {
    console.error('Error processing CSV:', error);
    res.status(500).json({
      success: false,
      error: 'Error processing CSV',
      message: error.message,
      stack: error.stack
    });
  }
}