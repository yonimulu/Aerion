import React, { useState } from 'react';
import { RocketComponent } from '../types/rocket';
import { ArrowUpRight, Cpu, Flame, Box, Compass, Zap, Shield, Anchor, Layers } from 'lucide-react';

interface ComponentCardProps {
  component: RocketComponent;
  onSelect: (id: string) => void;
}

export const getCategoryBadgeStyle = (category: string) => {
  let Icon = Layers;
  switch (category) {
    case 'Propulsion': Icon = Flame; break;
    case 'Structures': Icon = Box; break;
    case 'Avionics': Icon = Cpu; break;
    case 'Guidance & Control': Icon = Compass; break;
    case 'Electrical Systems': Icon = Zap; break;
    case 'Thermal Protection': Icon = Shield; break;
    case 'Recovery Systems': Icon = Anchor; break;
    default: Icon = Layers; break;
  }

  return {
    bg: 'bg-zinc-100 text-zinc-800 border-zinc-300',
    dot: 'bg-zinc-900',
    icon: Icon
  };
};

export const ComponentCard: React.FC<ComponentCardProps> = ({ component, onSelect }) => {
  const [imageError, setImageError] = useState(false);
  const badge = getCategoryBadgeStyle(component.category);
  const CategoryIcon = badge.icon;

  return (
    <div
      onClick={() => onSelect(component.id)}
      className="group bg-white hover:bg-zinc-50/80 border border-zinc-200 hover:border-zinc-900 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative w-full h-48 bg-zinc-100 overflow-hidden border-b border-zinc-200">
        {!imageError && (component.image_storage_path || component.image_url || component.imageUrl) ? (
          <img
            src={component.image_storage_path || component.image_url || component.imageUrl}
            alt={component.component_name || component.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-100 text-zinc-500 p-4 font-mono text-xs">
            <CategoryIcon className="w-8 h-8 mb-2 text-zinc-400" />
            <span>[Aerospace Hardware Blueprint]</span>
          </div>
        )}

        {/* Technical code overlay */}
        <div className="absolute top-2 left-2 pointer-events-none">
          <span className="font-mono text-[10px] text-zinc-800 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded border border-zinc-200 shadow-xs">
            {component.entry_number ? `#${component.entry_number} • ` : ''}{component.catalog_id || component.designation || `ID: ${component.id.slice(0, 10)}`}
          </span>
        </div>

        {component.featured && (
          <div className="absolute top-2 right-2 pointer-events-none">
            <span className="font-mono text-[10px] font-semibold text-white bg-black px-2 py-0.5 rounded-full shadow-xs">
              FEATURED
            </span>
          </div>
        )}

        {(component.location_installation_context || component.stageLocation) && (
          <div className="absolute bottom-2 left-2 right-2 pointer-events-none">
            <span className="font-mono text-[10px] text-zinc-800 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded border border-zinc-200 truncate block shadow-xs">
              LOC: {component.location_installation_context || component.stageLocation}
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Subsystem Category Tag */}
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-medium border ${badge.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
              <CategoryIcon className="w-3 h-3" />
              <span>{component.category}</span>
            </span>
          </div>

          {/* Component Name */}
          <h3 className="text-base font-bold text-zinc-950 group-hover:text-black transition-colors line-clamp-2">
            {component.component_name || component.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-zinc-600 leading-relaxed line-clamp-3">
            {component.definition_description || component.shortDescription || component.overview}
          </p>
        </div>

        {/* Footer info & CTA */}
        <div className="pt-3 border-t border-zinc-200 flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-500 text-[11px]">
            {component.facts?.length || 0} Key Specifications
          </span>
          <span className="text-black font-semibold group-hover:translate-x-0.5 flex items-center space-x-1 transition-transform">
            <span>Inspect</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
