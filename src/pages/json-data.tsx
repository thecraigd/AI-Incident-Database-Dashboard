import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';

export default function JsonDataPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/data/mock-incidents.json');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch JSON: ${response.status}`);
        }
        
        const data = await response.json();
        
        setIncidents(data.incidents || []);
        setReports(data.reports || []);
      } catch (err) {
        setError('Error loading data: ' + String(err));
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
        
        <Link href="/" className="text-primary-600 hover:underline">
          Back to Dashboard
        </Link>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">JSON Data Test</h1>
        <p className="text-gray-600">
          Displaying {incidents.length} incidents from pre-processed JSON
        </p>
        
        <div className="mt-4 mb-6">
          <Link href="/" className="text-primary-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Incidents</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classification</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {incidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{incident.incident_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{incident.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{incident.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{incident.severity}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{incident.classification}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Related Reports</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incident ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Published</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.incident_id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{report.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{report.source_domain}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.date_published}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}