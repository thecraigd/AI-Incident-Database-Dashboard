import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { Incident } from '@/utils/types';

interface IncidentTypeChartProps {
  incidents: Incident[];
}

interface TypeData {
  name: string;
  count: number;
}

const IncidentTypeChart: React.FC<IncidentTypeChartProps> = ({ incidents }) => {
  // Extract and count incident types by sector
  const typeData = useMemo(() => {
    if (!incidents || incidents.length === 0) {
      return [];
    }
    
    const typeCounts: Record<string, number> = {};
    
    incidents.forEach(incident => {
      // First check if there's a sector field
      if (incident.sector && typeof incident.sector === 'string') {
        // Convert sector to title case for better readability
        const formattedSector = incident.sector
          .split(' and ')
          .map(part => part.trim().charAt(0).toUpperCase() + part.trim().slice(1))
          .join(' & ');
          
        typeCounts[formattedSector] = (typeCounts[formattedSector] || 0) + 1;
        return;
      }
      
      // If no sector, try to find one in the description
      if (incident.description) {
        const description = incident.description.toLowerCase();
        
        // Define common sectors to look for
        const sectorKeywords = {
          'Transportation': ['transportation', 'car', 'vehicle', 'drive', 'bus', 'train', 'flight', 'tesla', 'uber', 'lyft'],
          'Healthcare': ['health', 'medical', 'hospital', 'patient', 'doctor', 'surgery', 'diagnostic'],
          'Finance': ['finance', 'bank', 'investment', 'loan', 'credit', 'insurance'],
          'Education': ['education', 'school', 'university', 'student', 'teacher', 'learning'],
          'Social Media': ['social media', 'facebook', 'twitter', 'instagram', 'tiktok', 'youtube'],
          'Retail': ['retail', 'shop', 'store', 'amazon', 'walmart', 'ecommerce'],
          'Law Enforcement': ['police', 'law', 'enforcement', 'criminal', 'justice', 'legal'],
          'Manufacturing': ['manufacturing', 'factory', 'industrial', 'robot', 'automation'],
          'Information Technology': ['software', 'algorithm', 'ai system', 'platform', 'application']
        };
        
        // Look for sector keywords in the description
        let foundSector = false;
        for (const [sector, keywords] of Object.entries(sectorKeywords)) {
          for (const keyword of keywords) {
            if (description.includes(keyword)) {
              typeCounts[sector] = (typeCounts[sector] || 0) + 1;
              foundSector = true;
              break;
            }
          }
          if (foundSector) break;
        }
        
        // If no sector was found, count as "Other"
        if (!foundSector) {
          typeCounts['Other'] = (typeCounts['Other'] || 0) + 1;
        }
        
        return;
      }
      
      // If we get here, count as unclassified
      typeCounts['Unclassified'] = (typeCounts['Unclassified'] || 0) + 1;
    });
    
    // Convert to array for Recharts and sort by count
    const data = Object.entries(typeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    return data;
  }, [incidents]);
  
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
          <p className="font-bold">{payload[0].payload.name}</p>
          <p className="text-sm">{`Incidents: ${payload[0].payload.count}`}</p>
          <p className="text-sm text-gray-500">{`${Math.round((payload[0].payload.count / incidents.length) * 100)}% of total`}</p>
        </div>
      );
    }
    return null;
  };
  
  if (!typeData.length) {
    return (
      <div className="card">
        <h3 className="text-xl mb-4">AI Incidents by Sector</h3>
        <div className="h-72 flex items-center justify-center">
          <p className="text-gray-500">No sector data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-xl mb-4">AI Incidents by Sector</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={typeData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="count" 
              name="Incidents" 
              fill="#8884d8" 
              radius={[0, 4, 4, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        <p>This chart shows the distribution of AI incidents across different industry sectors.</p>
      </div>
    </div>
  );
};

export default IncidentTypeChart;