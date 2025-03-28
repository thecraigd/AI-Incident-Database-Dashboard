import React, { useState, useEffect } from 'react';
import { Incident, Report } from '@/utils/types';

interface DebuggerProps {
  incidents: Incident[];
  reports: Report[];
}

const DataDebugger: React.FC<DebuggerProps> = ({ incidents, reports }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  // Auto-hide after 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 15000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-0 right-0 bg-white border border-gray-300 p-4 shadow-lg m-4 w-96 max-h-96 overflow-auto">
      <div className="flex justify-between mb-2">
        <h3 className="font-bold">Data Debugger</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>
      
      <div className="mb-2">
        <p><strong>Incidents:</strong> {incidents.length}</p>
        {incidents.length > 0 && (
          <div className="text-xs mt-1">
            <p>First incident: {incidents[0].title}</p>
            <p>Date type: {typeof incidents[0].date}</p>
            <p>Date value: {String(incidents[0].date)}</p>
            <p>Deployers: {JSON.stringify(incidents[0].deployers)}</p>
            <p>Developers: {JSON.stringify(incidents[0].developers)}</p>
          </div>
        )}
      </div>
      
      <div className="mb-2">
        <p><strong>Reports:</strong> {reports.length}</p>
        {reports.length > 0 && (
          <div className="text-xs mt-1">
            <p>First report: {reports[0].title}</p>
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-500 mt-4">
        This debugger will automatically close after 15 seconds.
      </div>
    </div>
  );
};

export default DataDebugger;