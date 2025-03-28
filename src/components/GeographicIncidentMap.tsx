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
  TooltipProps,
  Cell
} from 'recharts';
import { Incident } from '@/utils/types';

interface GeographicIncidentMapProps {
  incidents: Incident[];
  onRegionClick?: (region: string) => void;
  selectedRegion?: string;
}

const GeographicIncidentMap: React.FC<GeographicIncidentMapProps> = ({ incidents, onRegionClick, selectedRegion }) => {
  // Common regions to extract from incident data
  const commonRegions = [
    'USA', 'United States', 'US', 'North America',
    'UK', 'United Kingdom', 'Europe', 'European Union', 'EU',
    'China', 'Asia', 'East Asia',
    'India', 'South Asia',
    'Global', 'Worldwide', 'International',
    'Australia', 'Oceania',
    'Africa',
    'South America', 'Latin America',
    'Middle East',
    'Russia',
    'Canada',
    'Japan',
    'Germany',
    'France'
  ];
  
  // Function to extract region data from incident description or other fields
  const extractRegionFromIncident = (incident: Incident): string[] => {
    const regions: string[] = [];
    
    // Search in classification field for region
    if (incident.classification && typeof incident.classification === 'string') {
      const classificationLower = incident.classification.toLowerCase();
      commonRegions.forEach(region => {
        if (classificationLower.includes(region.toLowerCase())) {
          regions.push(region);
        }
      });
    }
    
    // Search in description
    if (incident.description) {
      const descriptionLower = incident.description.toLowerCase();
      commonRegions.forEach(region => {
        if (descriptionLower.includes(region.toLowerCase())) {
          regions.push(region);
        }
      });
    }
    
    // Search in title
    if (incident.title) {
      const titleLower = incident.title.toLowerCase();
      commonRegions.forEach(region => {
        if (titleLower.includes(region.toLowerCase())) {
          regions.push(region);
        }
      });
    }
    
    // Remove duplicates
    return [...new Set(regions)];
  };
  
  // Group regions for better visualization
  const normalizeRegion = (region: string): string => {
    if (['USA', 'United States', 'US', 'North America', 'Canada'].includes(region)) {
      return 'North America';
    }
    if (['UK', 'United Kingdom', 'Europe', 'European Union', 'EU', 'Germany', 'France', 'Italy', 'Spain'].includes(region)) {
      return 'Europe';
    }
    if (['China', 'East Asia', 'Japan', 'South Korea'].includes(region)) {
      return 'East Asia';
    }
    if (['India', 'South Asia'].includes(region)) {
      return 'South Asia';
    }
    if (['Australia', 'Oceania', 'New Zealand'].includes(region)) {
      return 'Oceania';
    }
    if (['Global', 'Worldwide', 'International'].includes(region)) {
      return 'Global';
    }
    if (['Russia', 'Eastern Europe'].includes(region)) {
      return 'Russia & Eastern Europe';
    }
    if (['Middle East', 'Saudi Arabia', 'UAE', 'Israel'].includes(region)) {
      return 'Middle East';
    }
    if (['South America', 'Latin America', 'Brazil', 'Mexico'].includes(region)) {
      return 'Latin America';
    }
    
    return region;
  };
  
  // Extract and count regions
  const regionData = useMemo(() => {
    if (!incidents || incidents.length === 0) {
      return [];
    }
    
    const regionCounts: Record<string, number> = {};
    let globalFallbackCount = 0;
    
    incidents.forEach(incident => {
      const regions = extractRegionFromIncident(incident);
      
      if (regions.length === 0) {
        // If no specific region found, count as "Global"
        globalFallbackCount++;
        return;
      }
      
      regions.forEach(region => {
        const normalizedRegion = normalizeRegion(region);
        regionCounts[normalizedRegion] = (regionCounts[normalizedRegion] || 0) + 1;
      });
    });
    
    // Add global fallback count
    if (globalFallbackCount > 0) {
      regionCounts['Global'] = (regionCounts['Global'] || 0) + globalFallbackCount;
    }
    
    // Convert to array for chart and sort by count
    const data = Object.entries(regionCounts)
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
  
  if (!regionData.length) {
    return (
      <div className="card">
        <h3 className="text-xl mb-4">Geographic Distribution of Incidents</h3>
        <div className="h-72 flex items-center justify-center">
          <p className="text-gray-500">No geographic data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-xl mb-4">Geographic Distribution of Incidents</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={regionData.slice(0, 10)} // Show top 10 regions
            layout="vertical"
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fontSize: 10 }}
              width={75}
              tickFormatter={(value) => {
                // Truncate long names for display
                return value.length > 10 ? value.substring(0, 10) + '...' : value;
              }}
              interval={0} // Force show all labels
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="count" 
              name="Incidents" 
              fill="#0284c7" 
              radius={[0, 4, 4, 0]}
              onClick={(data) => onRegionClick && onRegionClick(data.name)}
              cursor={onRegionClick ? 'pointer' : 'default'}
            >
              {selectedRegion && regionData.map((entry, index) => (
                <Cell
                  key={`cell-region-${index}`}
                  fill={entry.name === selectedRegion ? '#0369a1' : '#0284c7'}
                  stroke={entry.name === selectedRegion ? '#075985' : '#0284c7'}
                  strokeWidth={entry.name === selectedRegion ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        <p>This chart shows the top 10 regions with AI incidents. Click on a bar to filter by region.</p>
        <p className="mt-1">{regionData.length > 10 ? `${regionData.length - 10} additional regions not shown.` : ''}</p>
      </div>
    </div>
  );
};

export default GeographicIncidentMap;