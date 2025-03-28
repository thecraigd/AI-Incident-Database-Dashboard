import React, { useState, useEffect, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Sector
} from 'recharts';
import { Incident } from '@/utils/types';

interface EntityBreakdownChartProps {
  incidents: Incident[];
  onEntityClick?: (entity: string) => void;
  selectedEntity?: string;
  selectedYear?: number;
}

interface EntityData {
  name: string;
  value: number;
}

const COLORS = [
  '#0284c7', '#0369a1', '#075985', '#0c4a6e', '#7dd3fc', 
  '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95', '#a78bfa'
];

const EntityBreakdownChart: React.FC<EntityBreakdownChartProps> = ({ incidents, onEntityClick, selectedEntity, selectedYear }) => {
  // Set active index if there's a selected entity
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  // Extract and count entities
  const entityData = useMemo(() => {
    if (!incidents || incidents.length === 0) {
      return [];
    }
    
    const entityCounts: Record<string, number> = {};
    
    incidents.forEach(incident => {
      // Combine deployers and developers
      const deployersArray = Array.isArray(incident.deployers) ? incident.deployers : [];
      const developersArray = Array.isArray(incident.developers) ? incident.developers : [];
      const entities = [...new Set([...deployersArray, ...developersArray])];
      
      entities.forEach(entity => {
        if (!entity) return;
        entityCounts[entity] = (entityCounts[entity] || 0) + 1;
      });
    });
    
    // Convert to array for Recharts
    const data = Object.entries(entityCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Only take top 10 for readability
    
    return data;
  }, [incidents]);
  
  // Update active index when selected entity changes
  useEffect(() => {
    if (selectedEntity) {
      const index = entityData.findIndex(item => item.name === selectedEntity);
      if (index !== -1) {
        setActiveIndex(index);
      }
    } else {
      setActiveIndex(undefined);
    }
  }, [selectedEntity, entityData]);
  
  const renderActiveShape = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, name, value } = props;
    const sin = Math.sin(-midAngle * Math.PI / 180);
    const cos = Math.cos(-midAngle * Math.PI / 180);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 20) * cos;
    const my = cy + (outerRadius + 20) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 11;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';
    
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 5}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" fontSize={12}>{name}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={14} textAnchor={textAnchor} fill="#666" fontSize={12}>
          {`${value} incident${value !== 1 ? 's' : ''}`}
        </text>
      </g>
    );
  };
  
  const handlePieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  
  const handlePieLeave = () => {
    setActiveIndex(undefined);
  };
  
  const handleClick = (data: EntityData) => {
    if (onEntityClick) {
      onEntityClick(data.name);
    }
  };
  
  if (!entityData.length) {
    return (
      <div className="card">
        <h3 className="text-xl mb-4">
          Top 10 Entities in Incidents
          {selectedYear && <span className="text-primary-600"> ({selectedYear})</span>}
        </h3>
        <div className="h-72 flex items-center justify-center">
          <p className="text-gray-500">No entity data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-xl mb-4">
        Top 10 Entities in Incidents
        {selectedYear && <span className="text-primary-600"> ({selectedYear})</span>}
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={entityData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              dataKey="value"
              onMouseEnter={handlePieEnter}
              onMouseLeave={handlePieLeave}
              onClick={handleClick}
              cursor={onEntityClick ? 'pointer' : 'default'}
            >
              {entityData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EntityBreakdownChart;