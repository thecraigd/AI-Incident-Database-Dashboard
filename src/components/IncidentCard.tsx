import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Newspaper, ExternalLink } from 'lucide-react';
import { Incident, formatDate } from '@/utils/types';

interface IncidentCardProps {
  incident: Incident;
  reports?: any[];
}

const IncidentCard: React.FC<IncidentCardProps> = ({ incident, reports = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const renderSeverityTag = (severity?: string) => {
    if (!severity) return null;
    
    const colors = {
      'Critical': 'tag-red',
      'High': 'tag-orange',
      'Medium': 'tag-yellow',
      'Low': 'tag-green',
      'None': 'tag-blue'
    };
    
    const color = colors[severity as keyof typeof colors] || 'tag-blue';
    
    return (
      <span className={`tag ${color}`}>
        {severity}
      </span>
    );
  };
  
  const formattedDate = incident.date instanceof Date && !isNaN(incident.date.getTime())
    ? formatDate(incident.date)
    : 'Unknown date';

  return (
    <motion.div 
      className="card mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-start">
        <div className="cursor-pointer flex-1" onClick={toggleExpand}>
          <h4 className="text-lg font-semibold">{incident.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{formattedDate}</p>
        </div>
        <div className="flex items-center space-x-2">
          <a
            href={`https://incidentdatabase.ai/cite/${incident.incident_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary-600 hover:text-primary-800 flex items-center mr-2"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="mr-1">View in AIID</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          {renderSeverityTag(incident.severity)}
          <button onClick={toggleExpand} className="focus:outline-none">
            {isExpanded ? 
              <ChevronUp className="h-5 w-5 text-gray-500" /> : 
              <ChevronDown className="h-5 w-5 text-gray-500" />
            }
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-gray-700 mb-4">{incident.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h5 className="text-sm font-semibold text-gray-500 mb-1">Deployers</h5>
                  <ul className="list-disc list-inside">
                    {incident.deployers && incident.deployers.length > 0 ? (
                      incident.deployers.map((deployer, index) => (
                        <li key={`deployer-${index}`} className="text-sm">{deployer}</li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-400">None specified</li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h5 className="text-sm font-semibold text-gray-500 mb-1">Developers</h5>
                  <ul className="list-disc list-inside">
                    {incident.developers && incident.developers.length > 0 ? (
                      incident.developers.map((developer, index) => (
                        <li key={`developer-${index}`} className="text-sm">{developer}</li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-400">None specified</li>
                    )}
                  </ul>
                </div>
              </div>
              
              <div className="mb-4">
                <h5 className="text-sm font-semibold text-gray-500 mb-1">Affected Parties</h5>
                <ul className="list-disc list-inside">
                  {incident.harmedParties && incident.harmedParties.length > 0 ? (
                    incident.harmedParties.map((party, index) => (
                      <li key={`party-${index}`} className="text-sm">{party}</li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-400">None specified</li>
                  )}
                </ul>
              </div>
              
              {reports && reports.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-semibold text-gray-500 mb-2">Related Reports</h5>
                  <div className="space-y-2">
                    {reports.slice(0, 3).map((report, index) => (
                      <a
                        key={`report-${index}`}
                        href={report.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-2 bg-gray-50 hover:bg-gray-100 rounded text-sm transition-colors"
                      >
                        <Newspaper className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="flex-1 truncate">{report.title || 'Untitled Report'}</span>
                        <ExternalLink className="h-3 w-3 text-gray-400" />
                      </a>
                    ))}
                    
                    {reports.length > 3 && (
                      <p className="text-xs text-gray-500 text-right">
                        +{reports.length - 3} more reports
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <a
                  href={`https://incidentdatabase.ai/cite/${incident.incident_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded text-sm transition-colors text-blue-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>
                    See Incident {incident.incident_id}: {incident.title} on the AI Incident Database
                  </span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default IncidentCard;