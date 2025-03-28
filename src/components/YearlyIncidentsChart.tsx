import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  TooltipProps,
  Cell
} from 'recharts';
import { Incident } from '@/utils/types';

interface YearlyChartProps {
  incidents: Incident[];
  onYearClick?: (year: number) => void;
  selectedYear?: number;
}

interface YearlyData {
  year: number;
  count: number;
  Incidents: number;
}

const YearlyIncidentsChart: React.FC<YearlyChartProps> = ({ incidents, onYearClick, selectedYear }) => {
  // Transform data
  const yearlyData: YearlyData[] = [];
  const yearCounts: Record<number, Record<string, number>> = {};
  
  // Handle empty incidents array
  if (!incidents || incidents.length === 0) {
    return (
      <div className="card">
        <h3 className="text-xl mb-4">AI Incidents by Year</h3>
        <div className="h-72 flex items-center justify-center">
          <p className="text-gray-500">No incident data available</p>
        </div>
      </div>
    );
  }
  
  // Get min and max years to ensure we have entries for all years
  const years = incidents.map(incident => {
    try {
      const date = incident.date instanceof Date ? incident.date : new Date(incident.date as string);
      return date.getFullYear();
    } catch (error) {
      console.error('Error parsing date:', incident.date);
      return null;
    }
  }).filter((year): year is number => year !== null && !isNaN(year));
  
  if (years.length === 0) {
    return (
      <div className="card">
        <h3 className="text-xl mb-4">AI Incidents by Year</h3>
        <div className="h-72 flex items-center justify-center">
          <p className="text-gray-500">No valid date data available</p>
          <p className="text-xs text-gray-400 mt-2">
            {incidents.length > 0 ? 
              `Found ${incidents.length} incidents but no valid dates` : 
              'No incidents available'}
          </p>
        </div>
      </div>
    );
  }
  
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  
  // Initialize data structure
  for (let year = minYear; year <= maxYear; year++) {
    yearCounts[year] = {
      'Incidents': 0,
      'count': 0,
    };
  }
  
  // Count incidents by year
  incidents.forEach(incident => {
    try {
      const date = incident.date instanceof Date ? incident.date : new Date(incident.date as string);
      if (isNaN(date.getTime())) return;
      
      const year = date.getFullYear();
      
      if (yearCounts[year]) {
        yearCounts[year].count += 1;
        // We're now just counting total incidents per year, not breaking down by severity
        yearCounts[year]['Incidents'] += 1;
      }
    } catch (error) {
      console.error('Error processing incident date:', error);
    }
  });
  
  // Convert to array for Recharts
  for (const year in yearCounts) {
    yearlyData.push({
      year: parseInt(year),
      count: yearCounts[year].count,
      Incidents: yearCounts[year].Incidents || 0,
    });
  }
  
  const handleBarClick = (data: any) => {
    if (onYearClick) {
      onYearClick(data.year);
    }
  };
  
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
          <p className="font-bold">{`Year: ${label}`}</p>
          <p className="text-sm">{`Total Incidents: ${payload[0].payload.count}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
          {onYearClick && (
            <p className="text-xs text-gray-500 mt-1">Click bar to filter by year</p>
          )}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="card">
      <h3 className="text-xl mb-4">AI Incidents by Year</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={yearlyData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="year" 
              stroke="#666" 
              tick={{ fontSize: 12 }}
            />
            <YAxis stroke="#666" tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="Incidents" 
              name="Incidents" 
              fill="#3b82f6" 
              onClick={handleBarClick}
              cursor={onYearClick ? 'pointer' : 'default'}
            >
              {selectedYear && yearlyData.map((entry, index) => (
                <Cell
                  key={`cell-incident-${index}`}
                  fill={entry.year === selectedYear ? '#1d4ed8' : '#3b82f6'}
                  stroke={entry.year === selectedYear ? '#1e3a8a' : '#3b82f6'}
                  strokeWidth={entry.year === selectedYear ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default YearlyIncidentsChart;