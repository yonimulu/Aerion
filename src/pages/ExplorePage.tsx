import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, X, Rocket, AlertCircle, RefreshCw } from 'lucide-react';
import { RocketComponent, RocketCategory } from '../types/rocket';
import { ComponentCard } from '../components/ComponentCard';

interface ExplorePageProps {
  components: RocketComponent[];
  initialCategory?: string;
  initialSearch?: string;
  onSelectComponent: (id: string) => void;
  onNavigateHome: () => void;
}

type SortOption = 'alpha-asc' | 'alpha-desc' | 'date-newest' | 'category';

const CATEGORIES: ('All' | RocketCategory)[] = [
  'All',
  'Propulsion',
  'Structures',
  'Avionics',
  'Guidance & Control',
  'Electrical Systems',
  'Thermal Protection',
  'Recovery Systems'
];

export const ExplorePage: React.FC<ExplorePageProps> = ({
  components,
  initialCategory = 'All',
  initialSearch = '',
  onSelectComponent,
  onNavigateHome
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [sortBy, setSortBy] = useState<SortOption>('alpha-asc');

  // Filter and sort logic
  const filteredAndSortedComponents = useMemo(() => {
    let result = [...components];

    // Filter by Category
    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter((c) => c.category === selectedCategory);
    }

    // Filter by Search Query
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.shortDescription.toLowerCase().includes(q) ||
          (c.designation && c.designation.toLowerCase().includes(q)) ||
          c.category.toLowerCase().includes(q) ||
          (c.stageLocation && c.stageLocation.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'alpha-asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'alpha-desc') {
        return b.name.localeCompare(a.name);
      }
      if (sortBy === 'date-newest') {
        return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
      }
      if (sortBy === 'category') {
        return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
      }
      return 0;
    });

    return result;
  }, [components, selectedCategory, search, sortBy]);

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSortBy('alpha-asc');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-white min-h-[80vh]">
      {/* Page Header */}
      <div className="space-y-2 border-b border-zinc-200 pb-6">
        <div className="flex items-center space-x-2 text-zinc-600 font-mono text-xs uppercase tracking-widest font-semibold">
          <Rocket className="w-4 h-4 text-black" />
          <span>Technical Hardware Catalog</span>
        </div>
        <h1 className="text-3xl font-extrabold text-black tracking-tight">
          Explore Rocket Components
        </h1>
        <p className="text-zinc-600 text-sm max-w-2xl leading-relaxed">
          Filter through aerospace subsystems, propulsion machinery, structural airframes, and flight computers. Select any component to inspect its operating physics, schematics, and engineering specifications.
        </p>
      </div>

      {/* Control Bar: Search & Sort */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by component name, designation, or keyword..."
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-zinc-300 rounded-xl text-black placeholder-zinc-400 text-xs sm:text-sm font-mono focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="text-zinc-600 hidden sm:inline flex items-center space-x-1 font-semibold">
              <ArrowUpDown className="w-3.5 h-3.5 text-black" />
              <span>Sort:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2.5 bg-white border border-zinc-300 rounded-xl text-zinc-900 text-xs font-mono focus:outline-none focus:border-black"
            >
              <option value="alpha-asc">Alphabetical (A → Z)</option>
              <option value="alpha-desc">Alphabetical (Z → A)</option>
              <option value="date-newest">Recently Added / Updated</option>
              <option value="category">Group by Subsystem</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
          <span className="text-zinc-500 font-mono text-xs uppercase tracking-wider shrink-0 mr-1 flex items-center space-x-1 font-semibold">
            <Filter className="w-3 h-3 text-black" />
            <span>Category:</span>
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-black text-white border border-black shadow-xs font-semibold'
                    : 'bg-zinc-100 text-zinc-700 hover:text-black hover:bg-zinc-200 border border-zinc-300'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-mono text-zinc-500 pt-2">
        <div>
          Showing <span className="text-black font-bold">{filteredAndSortedComponents.length}</span> of{' '}
          <span className="text-black font-bold">{components.length}</span> components
          {selectedCategory !== 'All' && (
            <span> in <span className="text-black font-semibold">{selectedCategory}</span></span>
          )}
          {search && (
            <span> matching <span className="text-black font-semibold">"{search}"</span></span>
          )}
        </div>

        {(search || selectedCategory !== 'All' || sortBy !== 'alpha-asc') && (
          <button
            onClick={handleClearFilters}
            className="text-black hover:text-zinc-700 font-semibold flex items-center space-x-1 underline underline-offset-2"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Component Grid */}
      {filteredAndSortedComponents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedComponents.map((comp) => (
            <ComponentCard
              key={comp.id}
              component={comp}
              onSelect={onSelectComponent}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 text-center bg-zinc-50 border border-zinc-200 rounded-2xl p-8 space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 mx-auto rounded-full bg-white border border-zinc-300 flex items-center justify-center text-zinc-600">
            <AlertCircle className="w-6 h-6 text-zinc-700" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-black">No Matching Components Found</h3>
            <p className="text-xs text-zinc-600 leading-relaxed font-mono">
              No aerospace hardware matched the current query "{search}" or category "{selectedCategory}".
            </p>
          </div>
          <div className="pt-2 flex justify-center space-x-3">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-mono font-semibold transition-colors shadow-xs"
            >
              Clear All Filters
            </button>
            <button
              onClick={onNavigateHome}
              className="px-4 py-2 bg-white hover:bg-zinc-100 text-black border border-zinc-300 rounded-lg text-xs font-mono transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
