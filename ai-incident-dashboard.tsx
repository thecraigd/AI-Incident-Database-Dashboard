import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ArrowUpRight, Filter, Clock, AlertTriangle, Layers, Tag } from 'lucide-react';
import _ from 'lodash';

// This would be fetched from the actual API in a real implementation
const fetchMockAIIncidentData = () => {
  // Mock data based on actual AI incident types and patterns
  const incidentTypes = [
    'Bias/Discrimination', 'Privacy Violation', 'Misinformation', 
    'Performance Failure', 'Security Vulnerability', 'Autonomous System Failure',
    'Transparency Issue', 'Unexpected Behavior', 'Content Moderation Failure'
  ];
  
  const sectors = [
    'Social Media', 'Healthcare', 'Finance', 'Transportation', 
    'Law Enforcement', 'Employment', 'Education', 'Consumer Products'
  ];
  
  const severityLevels = ['Low', 'Medium', 'High', 'Critical'];
  
  const getRandomDate = (start: Date, end: Date): Date => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  };
  
  // Generate incidents from 2018 to present
  const incidents = [];
  for (let i = 0; i < 120; i++) {
    const incidentDate = getRandomDate(new Date(2018, 0, 1), new Date(2024, 9, 1));
    incidents.push({
      id: i + 1,
      title: `AI Incident #${i + 1}`,
      date: incidentDate,
      year: incidentDate.getFullYear(),
      month: incidentDate.toLocaleString('default', { month: 'short' }),
      type: incidentTypes[Math.floor(Math.random() * incidentTypes.length)],
      sector: sectors[Math.floor(Math.random() * sectors.length)],
      severity: severityLevels[Math.floor(Math.random() * severityLevels.length)],
      description: `This is a description of incident #${i + 1} involving AI system failure.`,
      entityResponsible: ['OpenAI', 'Google', 'Microsoft', 'Meta', 'Anthropic', 'Independent Researcher'][Math.floor(Math.random() * 6)]
    });
  }
  
  // Sort by date
  return incidents.sort((a, b) => a.date.getTime() - b.date.getTime());
};

const AISafetyIncidentTracker = () => {
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [timeView, setTimeView] = useState('year');
  
  useEffect(() => {
    // In a real app, we would fetch from the API
    const data = fetchMockAIIncidentData();
    setIncidents(data);
    setFilteredIncidents(data);
  }, []);
  
  useEffect(() => {
    if (incidents.length > 0) {
      if (activeFilter === 'all') {
        setFilteredIncidents(incidents);
      } else {
        setFilteredIncidents(incidents.filter(incident => 
          incident.severity === activeFilter || 
          incident.type === activeFilter || 
          incident.sector === activeFilter
        ));
      }
    }
  }, [activeFilter, incidents]);
  
  // Prepare data for year-by-year chart
  const yearlyData = _.chain(filteredIncidents)
    .groupBy('year')
    .map((incidents, year) => ({
      year,
      count: incidents.length,
      Critical: incidents.filter(i => i.severity === 'Critical').length,
      High: incidents.filter(i => i.severity === 'High').length,
      Medium: incidents.filter(i => i.severity === 'Medium').length,
      Low: incidents.filter(i => i.severity === 'Low').length
    }))
    .value();
  
  // Prepare data for incident types chart
  const typeData = _.chain(filteredIncidents)
    .groupBy('type')
    .map((incidents, type) => ({
      type,
      count: incidents.length,
    }))
    .orderBy(['count'], ['desc'])
    .take(5)
    .value();
  
  // Format for timeline data to show growth over time
  const timelineData = [];
  let runningTotal = 0;
  yearlyData.forEach(yearData => {
    runningTotal += yearData.count;
    timelineData.push({
      year: yearData.year,
      total: runningTotal
    });
  });
  
  return (
    <div className="w-full p-6 bg-gray-50 text-gray-900">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Safety Incident Tracker</h1>
        <p className="text-lg text-gray-600">Visualizing patterns and trends in AI system failures and safety incidents</p>
      </div>
      
      {/* Filter controls */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button 
          className={`flex items-center px-4 py-2 rounded-lg ${activeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-white border'}`}
          onClick={() => setActiveFilter('all')}
        >
          <Filter className="w-4 h-4 mr-2" />
          All Incidents
        </button>
        <button 
          className={`flex items-center px-4 py-2 rounded-lg ${activeFilter === 'Critical' ? 'bg-red-600 text-white' : 'bg-white border'}`}
          onClick={() => setActiveFilter('Critical')}
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Critical Severity
        </button>
        <button 
          className={`flex items-center px-4 py-2 rounded-lg ${timeView === 'year' ? 'bg-blue-600 text-white' : 'bg-white border'}`}
          onClick={() => setTimeView('year')}
        >
          <Clock className="w-4 h-4 mr-2" />
          Yearly View
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Incidents by Year */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">AI Incidents by Year and Severity</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Critical" stackId="a" fill="#ef4444" />
                <Bar dataKey="High" stackId="a" fill="#f97316" />
                <Bar dataKey="Medium" stackId="a" fill="#eab308" />
                <Bar dataKey="Low" stackId="a" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Cumulative Growth */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Cumulative Growth of AI Incidents</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Incident Types */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Top 5 Incident Types</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={typeData} 
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="type" width={150} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Recent Incidents List */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recent Incidents</h2>
          <div className="h-64 overflow-y-auto">
            {filteredIncidents.slice(-5).reverse().map(incident => (
              <div key={incident.id} className="mb-3 p-3 border-l-4 border-blue-500 bg-blue-50">
                <div className="flex justify-between">
                  <h3 className="font-medium">{incident.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    incident.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                    incident.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                    incident.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {incident.severity}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  <span className="mr-2">{new Date(incident.date).toLocaleDateString()}</span>
                  <span>{incident.type}</span>
                </div>
                <div className="text-sm mt-1">{incident.entityResponsible}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">Data sourced from the AI Incident Database (AIID) - 
          <a href="https://incidentdatabase.ai/" className="text-blue-600 hover:underline ml-1" target="_blank" rel="noopener noreferrer">
            Visit source <ArrowUpRight className="inline w-3 h-3" />
          </a>
        </p>
      </div>
    </div>
  );
};

export default AISafetyIncidentTracker;