import React from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';

// Simple hard-coded mock data
const mockIncidents = Array.from({ length: 20 }).map((_, i) => ({
  id: `mock-${i}`,
  incident_id: i,
  date: new Date(2018 + Math.floor(i / 5), i % 12, (i % 28) + 1),
  title: `Mock Incident ${i + 1}`,
  description: `This is a mock incident for testing purposes (#${i + 1})`,
  deployers: ['Mock Company A', 'Mock Company B'],
  developers: ['Mock Developer X', 'Mock Developer Y'],
  harmedParties: ['Mock Users'],
  reports: [i],
  severity: ['Low', 'Medium', 'High', 'Critical'][i % 4],
  classification: ['Privacy', 'Bias', 'Security', 'Safety'][i % 4]
}));

export default function MockDataPage() {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Mock Incident Data</h1>
        <p className="text-gray-600">
          Displaying {mockIncidents.length} mock incidents
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classification</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockIncidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{incident.incident_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {incident.date.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{incident.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{incident.severity}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{incident.classification}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}