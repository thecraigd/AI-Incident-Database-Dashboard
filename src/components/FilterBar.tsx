import React from 'react';
import { Filter, Calendar, Users, X, AlertTriangle, Building, Globe } from 'lucide-react';

interface FilterBarProps {
  activeFilters: {
    year?: number;
    entity?: string;
    severity?: string;
    classification?: string;
    sector?: string;
    region?: string;
  };
  onClearFilter: (filterType: 'year' | 'entity' | 'severity' | 'classification' | 'sector' | 'region') => void;
  onClearAllFilters: () => void;
  totalIncidents: number;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  activeFilters, 
  onClearFilter, 
  onClearAllFilters,
  totalIncidents 
}) => {
  const hasActiveFilters = Object.values(activeFilters).some(value => value !== undefined);
  
  if (!hasActiveFilters) {
    return (
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <p className="text-gray-600">No active filters</p>
        </div>
        <p className="text-gray-600">
          Showing <span className="font-semibold">{totalIncidents}</span> {totalIncidents === 1 ? 'incident' : 'incidents'}
        </p>
      </div>
    );
  }
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold flex items-center">
          <Filter className="h-5 w-5 mr-2 text-primary-600" />
          Active Filters
        </h3>
        <button
          onClick={onClearAllFilters}
          className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
        >
          Clear All <X className="h-4 w-4 ml-1" />
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {activeFilters.year !== undefined && (
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-800">
            <Calendar className="h-4 w-4 mr-1" />
            <span className="text-sm">{activeFilters.year}</span>
            <button
              onClick={() => onClearFilter('year')}
              className="ml-2 text-primary-600 hover:text-primary-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {activeFilters.entity !== undefined && (
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary-100 text-secondary-800">
            <Users className="h-4 w-4 mr-1" />
            <span className="text-sm">{activeFilters.entity}</span>
            <button
              onClick={() => onClearFilter('entity')}
              className="ml-2 text-secondary-600 hover:text-secondary-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {activeFilters.severity !== undefined && (
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800">
            <AlertTriangle className="h-4 w-4 mr-1" />
            <span className="text-sm">{activeFilters.severity}</span>
            <button
              onClick={() => onClearFilter('severity')}
              className="ml-2 text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {activeFilters.classification !== undefined && (
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800">
            <span className="text-sm">{activeFilters.classification}</span>
            <button
              onClick={() => onClearFilter('classification')}
              className="ml-2 text-green-600 hover:text-green-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {activeFilters.sector !== undefined && (
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800">
            <Building className="h-4 w-4 mr-1" />
            <span className="text-sm">{activeFilters.sector}</span>
            <button
              onClick={() => onClearFilter('sector')}
              className="ml-2 text-purple-600 hover:text-purple-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {activeFilters.region !== undefined && (
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800">
            <Globe className="h-4 w-4 mr-1" />
            <span className="text-sm">{activeFilters.region}</span>
            <button
              onClick={() => onClearFilter('region')}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      
      <p className="text-gray-600 mt-2">
        Showing <span className="font-semibold">{totalIncidents}</span> filtered {totalIncidents === 1 ? 'incident' : 'incidents'}
      </p>
    </div>
  );
};

export default FilterBar;