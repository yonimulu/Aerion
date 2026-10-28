import React from 'react';
import { Layers, Flame, Box, Cpu, Compass, Zap, Shield, Anchor, ArrowRight } from 'lucide-react';
import { CATEGORIES_INFO } from '../data/initialRocketComponents';
import { RocketCategory, RocketComponent } from '../types/rocket';

interface CategoriesPageProps {
  components: RocketComponent[];
  onSelectCategory: (category: RocketCategory) => void;
  onSelectComponent: (id: string) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({
  components,
  onSelectCategory,
  onSelectComponent
}) => {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return Flame;
      case 'Box': return Box;
      case 'Cpu': return Cpu;
      case 'Compass': return Compass;
      case 'Zap': return Zap;
      case 'Shield': return Shield;
      case 'Anchor': return Anchor;
      default: return Layers;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 bg-white">
      {/* Page Header */}
      <div className="space-y-2 border-b border-zinc-200 pb-6">
        <div className="flex items-center space-x-2 text-zinc-600 font-mono text-xs uppercase tracking-widest font-semibold">
          <Layers className="w-4 h-4 text-black" />
          <span>Launch Vehicle Architecture</span>
        </div>
        <h1 className="text-3xl font-extrabold text-black tracking-tight">
          Rocket Subsystems & Categories
        </h1>
        <p className="text-zinc-600 text-sm max-w-2xl leading-relaxed">
          Modern launch vehicles integrate specialized engineering domains. Explore how each subsystem functions, its primary flight role, and the hardware components engineered to survive extreme space environments.
        </p>
      </div>

      {/* Subsystem Cards Detailed List */}
      <div className="space-y-8">
        {CATEGORIES_INFO.map((cat, index) => {
          const Icon = getCategoryIcon(cat.iconName);
          const catComponents = components.filter((c) => c.category === cat.id);

          return (
            <div
              key={cat.id}
              className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 space-y-6 hover:border-black transition-colors shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="p-3.5 rounded-xl border border-zinc-300 bg-zinc-100 text-black shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs text-zinc-500 font-semibold">
                        SUBSYSTEM 0{index + 1}
                      </span>
                      <span className="text-zinc-400">•</span>
                      <span className="font-mono text-xs text-black font-semibold">
                        {catComponents.length} {catComponents.length === 1 ? 'part' : 'parts'} cataloged
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight">
                      {cat.title}
                    </h2>
                  </div>
                </div>

                <button
                  onClick={() => onSelectCategory(cat.id)}
                  className="px-4 py-2 rounded-lg bg-black hover:bg-zinc-800 text-white font-mono text-xs font-semibold flex items-center space-x-1.5 self-start transition-colors shadow-xs"
                >
                  <span>Filter Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-zinc-700 leading-relaxed max-w-4xl">
                {cat.description}
              </p>

              {/* Typical Common Hardware Tags */}
              <div className="space-y-2 pt-2 border-t border-zinc-200">
                <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-wider block font-semibold">
                  Typical Sub-Assemblies in this Discipline:
                </span>
                <div className="flex flex-wrap gap-2">
                  {cat.commonComponents.map((item) => (
                    <span
                      key={item}
                      className="px-2.5 py-1 rounded bg-zinc-100 border border-zinc-300 text-xs font-mono text-zinc-800"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Catalogued components preview in this category */}
              {catComponents.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-wider block font-semibold">
                    Available Hardware Records ({catComponents.length}):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {catComponents.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onSelectComponent(item.id)}
                        className="text-left p-3 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 hover:border-black transition-colors flex items-center justify-between group"
                      >
                        <div className="space-y-0.5 truncate max-w-[80%]">
                          <div className="text-xs font-bold text-black group-hover:underline truncate">
                            {item.name}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-500 truncate">
                            {item.designation || item.stageLocation || 'Details'}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-black shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
