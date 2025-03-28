import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
  Legend
} from 'recharts';
import { Incident } from '@/utils/types';

interface TimelineChartProps {
  incidents: Incident[];
}

interface TimelineData {
  date: string;
  count: number;
  total: number;
}

const TimelineChart: React.FC<TimelineChartProps> = ({ incidents }) => {
  // Prepare data for timeline chart
  const timelineData: TimelineData[] = [];
  
  if (!incidents || incidents.length === 0) {
    return (
      <div className="card">
        <h3 className="text-xl mb-4">Cumulative Growth of AI Incidents</h3>
        <div className="h-72 flex items-center justify-center">
          <p className="text-gray-500">No incident data available</p>
        </div>
      </div>
    );
  }
  
  if (incidents.length > 0) {
    // Sort incidents by date (oldest first)
    const sortedIncidents = [...incidents]
      .map(incident => ({
        ...incident,
        dateObj: incident.date instanceof Date ? 
          incident.date : 
          new Date(incident.date as string)
      }))
      .filter(incident => incident.dateObj instanceof Date && !isNaN(incident.dateObj.getTime()))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    
    // Group by year and month
    const dateGroups: Record<string, number> = {};
    let runningTotal = 0;
    
    sortedIncidents.forEach(incident => {
      const year = incident.dateObj.getFullYear();
      const month = incident.dateObj.getMonth();
      const dateKey = `${year}-${month.toString().padStart(2, '0')}`;
      
      if (!dateGroups[dateKey]) {
        dateGroups[dateKey] = 0;
      }
      
      dateGroups[dateKey]++;
    });
    
    // Convert to array for Recharts
    Object.entries(dateGroups).forEach(([dateKey, count]) => {
      const [year, month] = dateKey.split('-').map(Number);
      runningTotal += count;
      
      timelineData.push({
        date: `${year}-${(month + 1).toString().padStart(2, '0')}`,
        count,
        total: runningTotal
      });
    });
  }
  
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const [year, month] = label.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      const monthName = date.toLocaleString('default', { month: 'long' });
      
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
          <p className="font-bold">{`${monthName} ${year}`}</p>
          <p className="text-sm" style={{ color: '#0ea5e9' }}>{`New Incidents: ${payload[0].payload.count}`}</p>
          <p className="text-sm" style={{ color: '#8b5cf6' }}>{`Cumulative Total: ${payload[1].payload.total}`}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="card">
      <h3 className="text-xl mb-4">Cumulative Growth of AI Incidents</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={timelineData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#666" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                // Only show year for better readability
                return value.split('-')[0];
              }}
            />
            <YAxis 
              stroke="#666" 
              tick={{ fontSize: 12 }} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#0ea5e9" 
              dot={{ r: 0 }}
              name="New Incidents"
            />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="#8b5cf6" 
              strokeWidth={2} 
              dot={{ r: 0 }}
              name="Cumulative Total"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        <p>This chart shows both new AI incidents reported each month (blue line) and the cumulative total over time (purple line).</p>
      </div>
    </div>
  );
};

export default TimelineChart;