import React, { useState } from 'react';
import { Rocket, Search, ArrowRight, Layers, Flame, Cpu, Shield, Compass, Zap, Anchor, Box, ChevronRight, Sparkles } from 'lucide-react';
import { RocketComponent, RocketCategory } from '../types/rocket';
import { CATEGORIES_INFO } from '../data/initialRocketComponents';
import { ComponentCard } from '../components/ComponentCard';

interface HomePageProps {
  components: RocketComponent[];
  onSelectComponent: (id: string) => void;
  onNavigate: (tab: string, categoryFilter?: string) => void;
  onSearch: (query: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  components,
  onSelectComponent,
  onNavigate,
  onSearch
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredCategoryFilter, setFeaturedCategoryFilter] = useState('All');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    } else {
      onNavigate('explore');
    }
  };

  const featuredComponents = components.filter((c) => c.featured);
  const baseFeatured = featuredComponents.length > 0 ? featuredComponents : components.slice(0, 4);
  const featuredCategories = ['All', ...Array.from(new Set(baseFeatured.map((c) => c.category)))];
  const displayedFeatured = featuredCategoryFilter === 'All'
    ? baseFeatured
    : baseFeatured.filter((c) => c.category === featuredCategoryFilter);

  const getCategoryCount = (catId: RocketCategory) => {
    return components.filter((c) => c.category === catId).length;
  };

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
    <div className="space-y-16 pb-16 bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-zinc-200 bg-zinc-50/70 py-16 sm:py-24">
        {/* Subtle engineering grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-zinc-300 text-zinc-900 font-mono text-xs shadow-xs">
            <span className="w-2 h-2 rounded-full bg-black" />
            <span className="uppercase tracking-widest font-semibold">Open Aerospace Engineering Repository</span>
          </div>

          {/* Title */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-black tracking-tight leading-tight">
              Explore the Engineering <br className="hidden sm:block" />
              Behind Rockets
            </h1>
            <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              A comprehensive technical catalog for students, systems engineers, and aerospace enthusiasts. Discover the operating physics, material science, and design principles powering modern orbital launch vehicles.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleHeroSearch} className="relative flex items-center shadow-sm">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Search className="w-5 h-5 text-zinc-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rocket hardware by name, subsystem, or code..."
                className="w-full pl-12 pr-32 py-4 rounded-xl bg-white border border-zinc-300 text-black placeholder-zinc-400 text-sm sm:text-base focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all font-mono"
              />
              <button
                type="submit"
                className="absolute right-2 px-5 py-2.5 rounded-lg bg-black hover:bg-zinc-800 text-white font-mono font-semibold text-xs sm:text-sm transition-all flex items-center space-x-1"
              >
                <span>Search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick search tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-[11px] font-mono text-zinc-600">
              <span className="text-zinc-500">Quick queries:</span>
              {['RS-25 Engine', 'Grid Fins', 'Flight Computer', 'Turbopump', 'Thermal Tiles'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onSearch(tag)}
                  className="px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('explore')}
              className="px-6 py-3 rounded-xl bg-black hover:bg-zinc-800 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center space-x-2 shadow-sm"
            >
              <Rocket className="w-4 h-4" />
              <span>Explore Components</span>
            </button>
            <button
              onClick={() => onNavigate('categories')}
              className="px-6 py-3 rounded-xl bg-white hover:bg-zinc-100 text-black border border-zinc-300 font-mono font-semibold text-xs uppercase tracking-wider transition-all flex items-center space-x-2"
            >
              <Layers className="w-4 h-4 text-black" />
              <span>Browse Subsystems</span>
            </button>
          </div>
        </div>
      </section>

      {/* Category Shortcuts Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-zinc-200 pb-4">
          <div>
            <div className="text-zinc-500 font-mono text-xs uppercase tracking-wider font-semibold">Subsystem Breakdown</div>
            <h2 className="text-2xl font-bold text-black tracking-tight">Core Aerospace Categories</h2>
          </div>
          <button
            onClick={() => onNavigate('categories')}
            className="text-xs font-mono text-zinc-600 hover:text-black flex items-center space-x-1"
          >
            <span>View Subsystem Guides</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES_INFO.slice(0, 8).map((cat) => {
            const Icon = getCategoryIcon(cat.iconName);
            const count = getCategoryCount(cat.id);
            return (
              <div
                key={cat.id}
                onClick={() => onNavigate('explore', cat.id)}
                className="group p-5 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-black rounded-xl cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-3 shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-lg border border-zinc-300 bg-zinc-100 text-black">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                    {count} {count === 1 ? 'part' : 'parts'}
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-zinc-950 group-hover:text-black transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                    {cat.shortDescription}
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-mono text-black font-semibold group-hover:translate-x-1 transition-transform flex items-center space-x-1">
                  <span>Explore items</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Hardware Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-zinc-500 font-mono text-xs uppercase tracking-wider font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>Laboratory Highlights • {baseFeatured.length} Curated Items</span>
            </div>
            <h2 className="text-2xl font-bold text-black tracking-tight">Featured Flight Hardware</h2>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('admin')}
              className="text-xs font-mono text-zinc-600 hover:text-black hidden sm:flex items-center space-x-1 border border-zinc-200 hover:border-black rounded-lg px-2.5 py-1 transition-colors"
            >
              <span>Manage Highlights</span>
            </button>
            <button
              onClick={() => onNavigate('explore')}
              className="text-xs font-mono font-semibold text-black hover:text-zinc-700 flex items-center space-x-1"
            >
              <span>View All Catalog ({components.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Subsystem Filter Pills for Featured Hardware */}
        {featuredCategories.length > 2 && (
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs font-mono">
            <span className="text-zinc-500 shrink-0 mr-1 text-[11px]">Filter by Subsystem:</span>
            {featuredCategories.map((cat) => {
              const count = cat === 'All' 
                ? baseFeatured.length 
                : baseFeatured.filter((c) => c.category === cat).length;
              const isActive = featuredCategoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setFeaturedCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-full border transition-all shrink-0 flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-black text-white border-black font-semibold'
                      : 'bg-white text-zinc-700 hover:text-black hover:bg-zinc-100 border-zinc-300'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {displayedFeatured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedFeatured.map((comp) => (
              <ComponentCard
                key={comp.id}
                component={comp}
                onSelect={onSelectComponent}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center border border-dashed border-zinc-300 rounded-2xl bg-zinc-50/50 space-y-3">
            <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center mx-auto text-zinc-500">
              <Sparkles className="w-5 h-5 text-zinc-500" />
            </div>
            <h3 className="text-sm font-bold text-black font-mono">No Featured Hardware In This Category</h3>
            <p className="text-xs text-zinc-600 max-w-sm mx-auto">
              No components in &quot;{featuredCategoryFilter}&quot; are currently flagged as featured highlights.
            </p>
            <button
              onClick={() => setFeaturedCategoryFilter('All')}
              className="px-3.5 py-1.5 bg-black text-white rounded-lg text-xs font-mono font-semibold hover:bg-zinc-800 transition-colors"
            >
              Reset to All Featured
            </button>
          </div>
        )}
      </section>

      {/* Rocket Anatomy Educational Blueprint Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 sm:p-10 space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-zinc-500 font-mono text-xs uppercase tracking-widest font-semibold">
              Aerospace Systems Integration
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-black">
              How Launch Vehicle Subsystems Work Together
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              A multi-stage orbital rocket is not a single engine, but a tightly coupled integration of fluid dynamics, hypersonic aerothermodynamics, fault-tolerant electronics, and structural mechanics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-white border border-zinc-200 rounded-xl space-y-2.5 shadow-xs">
              <div className="flex items-center space-x-2 text-black font-mono text-xs font-bold">
                <Box className="w-4 h-4" />
                <span>01. Atmospheric Ascent & Staging</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Booster engines fire at sea-level pressure. High-frequency guidance computers steer the gimbal actuators through Max-Q until fuel exhaustion, upon which pneumatic pushers separate the spent stage.
              </p>
            </div>

            <div className="p-5 bg-white border border-zinc-200 rounded-xl space-y-2.5 shadow-xs">
              <div className="flex items-center space-x-2 text-black font-mono text-xs font-bold">
                <Compass className="w-4 h-4" />
                <span>02. Vacuum Trajectory & GNC</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Above the atmosphere, composite fairings jettison to drop dead weight. Upper stage engines ignite while ring laser gyroscopes and cold gas RCS thrusters point precisely toward orbital insertion.
              </p>
            </div>

            <div className="p-5 bg-white border border-zinc-200 rounded-xl space-y-2.5 shadow-xs">
              <div className="flex items-center space-x-2 text-black font-mono text-xs font-bold">
                <Shield className="w-4 h-4" />
                <span>03. Reentry & Controlled Recovery</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Reusable boosters deploy titanium grid fins to steer through hypersonic plasma friction. PICA-X heat shields absorb thermal flux before supersonic drogues or landing burn thrusters touch down.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
