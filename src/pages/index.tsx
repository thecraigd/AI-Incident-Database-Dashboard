import React, { useState, useEffect, useMemo } from 'react';
import { GetServerSideProps } from 'next';
import { motion } from 'framer-motion';
import { Info, Search, Filter, ChevronsUpDown } from 'lucide-react';

import Layout from '@/components/Layout';
import YearlyIncidentsChart from '@/components/YearlyIncidentsChart';
import EntityBreakdownChart from '@/components/EntityBreakdownChart';
import TimelineChart from '@/components/TimelineChart';
import SectorDistributionChart from '@/components/SectorDistributionChart';
import GeographicIncidentMap from '@/components/GeographicIncidentMap';
import IncidentCard from '@/components/IncidentCard';
import FilterBar from '@/components/FilterBar';
import LoadingState from '@/components/LoadingState';

import { Incident, Report } from '@/utils/types';

interface HomeProps {
  incidents: Incident[];
  reports: Report[];
}

export default function Home({ incidents: initialIncidents, reports: initialReports }: HomeProps) {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<{
    year?: number;
    entity?: string;
    severity?: string;
    classification?: string;
    sector?: string;
    region?: string;
  }>({});
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Limit displayed incidents to improve performance
  const [displayLimit, setDisplayLimit] = useState(20);
  const [displayedIncidents, setDisplayedIncidents] = useState<Incident[]>([]);
  
  // Parse dates properly
  const parsedIncidents = useMemo(() => {
    return incidents.map(incident => {
      if (incident.date instanceof Date) {
        return incident;
      }
      
      try {
        return {
          ...incident,
          date: new Date(incident.date)
        };
      } catch (error) {
        console.error('Error parsing date for incident:', incident.id, error);
        return incident;
      }
    });
  }, [incidents]);
  
  // Apply filters whenever they change
  useEffect(() => {
    // Use a worker function to avoid blocking the UI
    const applyFilters = () => {
      let result = [...parsedIncidents];
      
      // Apply search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        result = result.filter(incident => 
          (incident.title && incident.title.toLowerCase().includes(searchLower)) ||
          (incident.description && incident.description.toLowerCase().includes(searchLower)) ||
          (incident.deployers && incident.deployers.some(d => d?.toLowerCase().includes(searchLower))) ||
          (incident.developers && incident.developers.some(d => d?.toLowerCase().includes(searchLower)))
        );
      }
      
      // Apply year filter
      if (activeFilters.year) {
        result = result.filter(incident => {
          try {
            const date = incident.date instanceof Date ? 
              incident.date : 
              new Date(incident.date as string);
            return date.getFullYear() === activeFilters.year;
          } catch (error) {
            return false;
          }
        });
      }
      
      // Apply entity filter
      if (activeFilters.entity) {
        result = result.filter(incident => 
          (incident.deployers && incident.deployers.includes(activeFilters.entity!)) || 
          (incident.developers && incident.developers.includes(activeFilters.entity!))
        );
      }
      
      // Apply severity filter
      if (activeFilters.severity) {
        result = result.filter(incident => 
          incident.severity === activeFilters.severity
        );
      }
      
      // Apply classification filter
      if (activeFilters.classification) {
        result = result.filter(incident => 
          incident.classification === activeFilters.classification
        );
      }
      
      // Apply sector filter
      if (activeFilters.sector) {
        result = result.filter(incident => {
          // Check if sector directly matches
          if (incident.sector && incident.sector.includes(activeFilters.sector!)) {
            return true;
          }
          
          // Check for sector keywords in description
          if (incident.description) {
            const description = incident.description.toLowerCase();
            
            // Define same sector keywords as in SectorDistributionChart
            const sectorKeywords: Record<string, string[]> = {
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
            
            // Check if selected sector has keywords that match
            if (sectorKeywords[activeFilters.sector!]) {
              return sectorKeywords[activeFilters.sector!].some(keyword => 
                description.includes(keyword)
              );
            }
            
            // Fallback to direct text matching
            return description.includes(activeFilters.sector!.toLowerCase());
          }
          
          return false;
        });
      }
      
      // Apply region filter
      if (activeFilters.region) {
        result = result.filter(incident => {
          // Check region from classification
          if (incident.region && incident.region.includes(activeFilters.region!)) {
            return true;
          }
          
          // Check for region mentions in description
          if (incident.description) {
            const description = incident.description.toLowerCase();
            
            // Define region groups (same as in GeographicIncidentMap)
            const regionKeywords: Record<string, string[]> = {
              'North America': ['usa', 'united states', 'us', 'america', 'canada', 'north america'],
              'Europe': ['uk', 'united kingdom', 'europe', 'european union', 'eu', 'germany', 'france', 'italy', 'spain'],
              'East Asia': ['china', 'east asia', 'japan', 'south korea'],
              'South Asia': ['india', 'south asia'],
              'Oceania': ['australia', 'oceania', 'new zealand'],
              'Russia & Eastern Europe': ['russia', 'eastern europe'],
              'Middle East': ['middle east', 'saudi arabia', 'uae', 'israel'],
              'Latin America': ['south america', 'latin america', 'brazil', 'mexico'],
              'Africa': ['africa', 'south africa', 'nigeria', 'kenya', 'egypt'],
              'Global': ['global', 'worldwide', 'international']
            };
            
            // Check if selected region has keywords that match
            if (regionKeywords[activeFilters.region!]) {
              return regionKeywords[activeFilters.region!].some(keyword => 
                description.includes(keyword.toLowerCase())
              );
            }
            
            // Fallback to direct text matching
            return description.includes(activeFilters.region!.toLowerCase());
          }
          
          return false;
        });
      }
      
      // Apply sorting
      result.sort((a, b) => {
        try {
          const dateA = a.date instanceof Date ? a.date : new Date(a.date as string);
          const dateB = b.date instanceof Date ? b.date : new Date(b.date as string);
          const timeA = !isNaN(dateA.getTime()) ? dateA.getTime() : 0;
          const timeB = !isNaN(dateB.getTime()) ? dateB.getTime() : 0;
          return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
        } catch (error) {
          return 0;
        }
      });
      
      return result;
    };
    
    // Apply filters
    const filteredResults = applyFilters();
    setFilteredIncidents(filteredResults);
    
    // Set displayed incidents (limited for performance)
    setDisplayedIncidents(filteredResults.slice(0, displayLimit));
  }, [parsedIncidents, searchTerm, activeFilters, sortOrder, displayLimit]);
  
  // Clear a specific filter
  const handleClearFilter = (filterType: 'year' | 'entity' | 'severity' | 'classification') => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterType];
      return newFilters;
    });
  };
  
  // Clear all filters
  const handleClearAllFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    setDisplayLimit(20); // Reset display limit when clearing filters
  };
  
  // Set year filter when clicking on chart
  const handleYearClick = (year: number) => {
    setActiveFilters(prev => ({
      ...prev,
      year
    }));
    setDisplayLimit(20); // Reset display limit when changing filters
  };
  
  // Set entity filter when clicking on chart
  const handleEntityClick = (entity: string) => {
    setActiveFilters(prev => ({
      ...prev,
      entity
    }));
    setDisplayLimit(20); // Reset display limit when changing filters
  };
  
  // Set sector filter when clicking on chart
  const handleSectorClick = (sector: string) => {
    setActiveFilters(prev => ({
      ...prev,
      sector
    }));
    setDisplayLimit(20); // Reset display limit when changing filters
  };
  
  // Set region filter when clicking on chart
  const handleRegionClick = (region: string) => {
    setActiveFilters(prev => ({
      ...prev,
      region
    }));
    setDisplayLimit(20); // Reset display limit when changing filters
  };
  
  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  };
  
  // Filter for related reports
  const getReportsForIncident = (incidentId: number): Report[] => {
    return reports.filter(report => report.incident_id === incidentId);
  };
  
  
  if (isLoading) {
    return (
      <Layout>
        <LoadingState />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-md">
        <p className="text-blue-700 text-sm">
          This dashboard is based on a snapshot of the <a href="https://incidentdatabase.ai" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:text-blue-800">AI Incident Database</a> as of March 24, 2025. For the most current data, please visit the <a href="https://incidentdatabase.ai" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:text-blue-800">official website</a>.
        </p>
      </div>
      
      <div className="mb-8">
        <motion.h1 
          className="text-4xl font-bold mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          AI Safety Incident Dashboard
        </motion.h1>
        <motion.p 
          className="text-xl text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Visualizing trends and patterns in AI system failures and safety incidents
        </motion.p>
      </div>
      
      {/* Search and filter area */}
      <div className="mb-8">
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Search incidents by title, description, or entity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div>
          <FilterBar 
            activeFilters={activeFilters}
            onClearFilter={handleClearFilter}
            onClearAllFilters={handleClearAllFilters}
            totalIncidents={filteredIncidents.length}
          />
        </div>
      </div>
      
      {/* Visualization area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <YearlyIncidentsChart 
          incidents={filteredIncidents} 
          onYearClick={handleYearClick}
          selectedYear={activeFilters.year}
        />
        {/* Use filtered incidents for entity selection */}
        <EntityBreakdownChart 
          incidents={filteredIncidents}
          onEntityClick={handleEntityClick}
          selectedEntity={activeFilters.entity}
          selectedYear={activeFilters.year}
        />
      </div>
      
      <div className="mb-8">
        <TimelineChart incidents={filteredIncidents} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <SectorDistributionChart 
          incidents={filteredIncidents} 
          onSectorClick={handleSectorClick}
          selectedSector={activeFilters.sector}
        />
        <GeographicIncidentMap 
          incidents={filteredIncidents}
          onRegionClick={handleRegionClick}
          selectedRegion={activeFilters.region}
        />
      </div>
      
      {/* Incidents list */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Incidents</h2>
          <button
            onClick={toggleSortOrder}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            Sort: {sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
            <ChevronsUpDown className="ml-1 h-4 w-4" />
          </button>
        </div>
        
        {filteredIncidents.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No incidents found</h3>
            <p className="text-gray-600 mb-4">
              There are no incidents matching your current filters.
            </p>
            <button
              onClick={handleClearAllFilters}
              className="btn-primary"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div>
            {displayedIncidents.map((incident) => (
              <IncidentCard 
                key={incident.id} 
                incident={incident}
                reports={getReportsForIncident(incident.incident_id)}
              />
            ))}
            
            {filteredIncidents.length > displayLimit && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 mb-2">
                  Showing {displayedIncidents.length} of {filteredIncidents.length} incidents
                </p>
                <button 
                  className="btn-primary"
                  onClick={() => setDisplayLimit(prev => prev + 20)}
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  try {
    // First try to load JSON data directly from the file
    const fs = require('fs');
    const path = require('path');
    
    const jsonPath = path.join(process.cwd(), 'public', 'data', 'full-dataset.json');
    
    if (fs.existsSync(jsonPath)) {
      console.log('Loading JSON data from file');
      const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      return {
        props: {
          incidents: jsonData.incidents || [],
          reports: jsonData.reports || []
        }
      };
    }
    
    console.log('JSON file not found, using generated mock data');
    
    // Generate mock data if JSON file not found
    const mockIncidents = Array.from({ length: 50 }).map((_, i) => ({
      id: `mock-${i}`,
      incident_id: i,
      date: new Date(2018 + Math.floor(i / 10), i % 12, (i % 28) + 1).toISOString(),
      title: `Mock Incident ${i + 1}`,
      description: `This is a mock incident for testing purposes (#${i + 1})`,
      deployers: ['Mock Company A', 'Mock Company B'],
      developers: ['Mock Developer X', 'Mock Developer Y'],
      harmedParties: ['Mock Users'],
      reports: [i],
      severity: ['Low', 'Medium', 'High', 'Critical'][i % 4],
      classification: ['Privacy', 'Bias', 'Security', 'Safety'][i % 4]
    }));
    
    const mockReports = mockIncidents.map(incident => ({
      id: `mock-report-${incident.incident_id}`,
      incident_id: incident.incident_id,
      title: `Report on ${incident.title}`,
      description: `A detailed report about ${incident.title}`,
      url: 'https://example.com',
      date_published: incident.date,
      source_domain: 'example.com',
      authors: ['Mock Author']
    }));
    
    return {
      props: {
        incidents: mockIncidents,
        reports: mockReports
      }
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    
    // Fallback to entirely client-side generated mock data
    return {
      props: {
        incidents: [],
        reports: []
      }
    };
  }
};