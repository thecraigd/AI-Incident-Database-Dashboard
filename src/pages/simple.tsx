import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';

export default function SimplePage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/simple-data');
        
        if (!response.ok) {
          throw new Error(`API response error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setIncidents(data.incidents || []);
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
        <h1 className="text-3xl font-bold mb-2">Simple Incident List</h1>
        <p className="text-gray-600">
          Displaying {incidents.length} incidents from the real data source
        </p>
        
        <div className="mt-4 mb-6">
          <Link href="/" className="text-primary-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deployer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Developer</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {incidents.map((incident, index) => (
                <tr key={incident.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{incident.incident_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{incident.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{incident.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{incident['Alleged deployer of AI system']}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{incident['Alleged developer of AI system']}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}