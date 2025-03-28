import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parser';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'incidents.csv');
    console.log('Checking if file exists:', filePath);
    const fileExists = fs.existsSync(filePath);
    
    if (!fileExists) {
      return res.status(404).json({
        error: 'File not found',
        path: filePath
      });
    }
    
    // Try to read the first few lines of the file
    const fileContent = fs.readFileSync(filePath, 'utf8').slice(0, 1000);
    
    // Try parsing the CSV
    const results: any[] = [];
    
    const parsePromise = new Promise<any[]>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(parse())
        .on('data', (data) => {
          if (results.length < 5) {  // Just get the first 5 rows
            results.push(data);
          }
        })
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
    
    const parsedResults = await parsePromise;
    
    res.status(200).json({
      success: true,
      fileExists,
      filePreview: fileContent,
      parsedRows: parsedResults
    });
  } catch (error: any) {
    console.error('Error testing CSV:', error);
    res.status(500).json({
      error: 'Error testing CSV',
      message: error.message,
      stack: error.stack
    });
  }
}