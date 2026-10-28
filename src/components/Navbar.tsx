import React, { useState } from 'react';
import { Rocket, Search, Menu, X, Layers, Settings, Compass, Info, Monitor, Database } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onNavigate: (tab: string, componentId?: string) => void;
  onSearchSubmit?: (query: string) => void;
  onOpenDesktopInstall?: () => void;
  onOpenSupabaseConfig?: () => void;
  isSupabaseOnline?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  onNavigate, 
  onSearchSubmit,
  onOpenDesktopInstall,
  onOpenSupabaseConfig,
  isSupabaseOnline = false
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim() && onSearchSubmit) {
      onSearchSubmit(navSearch.trim());
      setNavSearch('');
      setMobileMenuOpen(false);
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'explore', label: 'Explore Parts', icon: Rocket },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'admin', label: 'Admin', icon: Settings },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center group-hover:bg-zinc-800 transition-colors">
              <Rocket className="w-5 h-5 transform -rotate-45" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 font-semibold">AERION Encyclopedia</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-black"></span>
              </div>
              <h1 className="text-lg font-bold tracking-tight text-zinc-950 group-hover:text-black transition-colors">
                Aerospace Science & Engineering
              </h1>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-6">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search hardware..."
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-300 rounded-md text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black font-mono transition-colors"
              />
            </form>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3 py-2 rounded-md text-xs uppercase tracking-wider font-semibold font-mono flex items-center space-x-1.5 transition-all ${
                    isActive
                      ? 'bg-black text-white shadow-xs'
                      : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Desktop Install / Add to Desktop Button */}
            {onOpenDesktopInstall && (
              <button
                type="button"
                onClick={onOpenDesktopInstall}
                className="ml-2 px-3 py-1.5 rounded-md text-xs font-mono font-semibold text-black bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 flex items-center space-x-1.5 transition-colors shadow-xs"
                title="Add project to Windows Desktop or launch standalone app"
              >
                <Monitor className="w-3.5 h-3.5 text-black" />
                <span className="hidden xl:inline">Add to Desktop</span>
                <span className="xl:hidden">Desktop</span>
              </button>
            )}

            {/* Supabase Database Connection Pill */}
            {onOpenSupabaseConfig && (
              <button
                type="button"
                onClick={onOpenSupabaseConfig}
                className="ml-2 px-2.5 py-1.5 rounded-md text-xs font-mono font-semibold text-zinc-900 bg-white hover:bg-zinc-100 border border-zinc-300 flex items-center space-x-1.5 transition-colors shadow-2xs"
                title="Supabase Database Status & Configuration"
              >
                <Database className="w-3.5 h-3.5 text-zinc-800" />
                <span className="hidden xl:inline">Supabase</span>
                <span className={`w-2 h-2 rounded-full ${isSupabaseOnline ? 'bg-emerald-600' : 'bg-zinc-400'}`}></span>
              </button>
            )}
          </nav>

          {/* Mobile menu toggle button */}
          <div className="flex lg:hidden items-center space-x-2">
            {onOpenSupabaseConfig && (
              <button
                type="button"
                onClick={onOpenSupabaseConfig}
                className="p-2 rounded-md text-zinc-700 hover:text-black hover:bg-zinc-100 border border-zinc-200"
                title="Supabase Status"
              >
                <Database className="w-4 h-4 text-black" />
              </button>
            )}
            {onOpenDesktopInstall && (
              <button
                type="button"
                onClick={onOpenDesktopInstall}
                className="p-2 rounded-md text-zinc-700 hover:text-black hover:bg-zinc-100 border border-zinc-200"
                title="Add to Desktop"
              >
                <Monitor className="w-4 h-4 text-black" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-zinc-700 hover:text-black hover:bg-zinc-100 border border-zinc-200"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-zinc-200 bg-white px-4 pt-2 pb-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search components..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 border border-zinc-300 rounded-md text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
            />
          </form>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2.5 rounded-md text-sm font-semibold font-mono flex items-center space-x-2 text-left ${
                    isActive
                      ? 'bg-black text-white'
                      : 'text-zinc-700 hover:text-black hover:bg-zinc-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {onOpenSupabaseConfig && (
              <button
                type="button"
                onClick={() => {
                  onOpenSupabaseConfig();
                  setMobileMenuOpen(false);
                }}
                className="w-full px-3 py-2.5 rounded-md text-sm font-semibold font-mono flex items-center justify-between text-black bg-zinc-50 border border-zinc-300 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-black" />
                  <span>Supabase Database & Storage</span>
                </div>
                <span className={`w-2.5 h-2.5 rounded-full ${isSupabaseOnline ? 'bg-emerald-600' : 'bg-zinc-400'}`}></span>
              </button>
            )}

            {onOpenDesktopInstall && (
              <button
                type="button"
                onClick={() => {
                  onOpenDesktopInstall();
                  setMobileMenuOpen(false);
                }}
                className="w-full px-3 py-2.5 rounded-md text-sm font-semibold font-mono flex items-center space-x-2 text-black bg-zinc-100 border border-zinc-300 mt-2"
              >
                <Monitor className="w-4 h-4" />
                <span>Add to Desktop / Install App</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
