import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BasicDataPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/simple-csv');
        const result = await response.json();
        
        setData(result);
      } catch (err) {
        setError('Error fetching data: ' + String(err));
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  if (loading) {
    return <div className="p-8">Loading data...</div>;
  }
  
  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Basic CSV Data Test</h1>
      
      <div className="mb-4">
        <Link href="/" className="text-blue-500 hover:underline">
          Back to Dashboard
        </Link>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">File Status</h2>
        <p>File exists: {data.fileExists ? 'Yes' : 'No'}</p>
        {data.totalLines && <p>Total lines in file: {data.totalLines}</p>}
        
        {data.fileExists && (
          <>
            <h2 className="text-xl font-semibold mt-6 mb-2">File Preview</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {data.filePreview}
            </pre>
            
            <h2 className="text-xl font-semibold mt-6 mb-2">Headers</h2>
            <div className="bg-gray-100 p-4 rounded overflow-auto">
              <ul className="list-disc list-inside">
                {data.headers && data.headers.map((header: string, i: number) => (
                  <li key={i} className="text-sm">{header}</li>
                ))}
              </ul>
            </div>
            
            <h2 className="text-xl font-semibold mt-6 mb-2">Parsed Rows (First 5)</h2>
            {data.rows && data.rows.length > 0 ? (
              <div className="overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {data.headers && data.headers.map((header: string) => (
                        <th 
                          key={header}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.rows.map((row: any, i: number) => (
                      <tr key={i}>
                        {data.headers && data.headers.map((header: string) => (
                          <td 
                            key={`${i}-${header}`}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          >
                            {String(row[header] || '').length > 50 
                              ? String(row[header]).substring(0, 50) + '...' 
                              : String(row[header] || '')
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No rows parsed.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}