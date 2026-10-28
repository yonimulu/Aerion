/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { ComponentDetailsPage } from './pages/ComponentDetailsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { AdminPage } from './pages/AdminPage';
import { AboutPage } from './pages/AboutPage';
import { SupabaseModal } from './components/SupabaseModal';
import { ComponentService } from './services/componentService';
import { isSupabaseConfigured } from './lib/supabase';
import { RocketCategory, RocketComponent } from './types/rocket';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [components, setComponents] = useState<RocketComponent[]>([]);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isSupabaseOnline, setIsSupabaseOnline] = useState(false);

  // Load components on mount with Supabase synchronization
  useEffect(() => {
    // 1. Instant load from local persistent cache for zero layout shift
    const initialList = ComponentService.getAllComponents();
    setComponents(initialList);
    setIsSupabaseOnline(isSupabaseConfigured());

    // 2. Query live Supabase database asynchronously
    const syncDatabase = async () => {
      try {
        const result = await ComponentService.fetchComponents();
        setComponents(result.components);
        setIsSupabaseOnline(isSupabaseConfigured());
      } catch (err) {
        console.warn('Initial Supabase sync fallback:', err);
      }
    };

    syncDatabase();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectComponent = (id: string) => {
    setSelectedComponentId(id);
    setActiveTab('details');
    scrollToTop();
  };

  const handleNavigate = (tab: string, catFilter?: string) => {
    if (catFilter) {
      setCategoryFilter(catFilter);
    }
    setActiveTab(tab);
    scrollToTop();
  };

  const handleSearch = (query: string) => {
    setSearchFilter(query);
    setActiveTab('explore');
    scrollToTop();
  };

  const handleAddComponent = async (data: Partial<RocketComponent>) => {
    await ComponentService.createComponent(data);
    const res = await ComponentService.fetchComponents();
    setComponents(res.components);
    setIsSupabaseOnline(isSupabaseConfigured());
  };

  const handleEditComponent = async (id: string, updates: Partial<RocketComponent>) => {
    await ComponentService.updateComponent(id, updates);
    const res = await ComponentService.fetchComponents();
    setComponents(res.components);
    setIsSupabaseOnline(isSupabaseConfigured());
  };

  const handleDeleteComponent = async (id: string) => {
    await ComponentService.deleteComponent(id);
    const res = await ComponentService.fetchComponents();
    setComponents(res.components);
    setIsSupabaseOnline(isSupabaseConfigured());
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
      setActiveTab('explore');
    }
  };

  const handleResetDefaults = async () => {
    const fresh = await ComponentService.resetToDefaults();
    setComponents(fresh);
    setIsSupabaseOnline(isSupabaseConfigured());
  };

  const handleToggleFeatured = async (id: string) => {
    await ComponentService.toggleFeatured(id);
    const res = await ComponentService.fetchComponents();
    setComponents(res.components);
  };

  const handleSyncSupabase = async () => {
    const synced = await ComponentService.seedSupabase();
    setComponents(synced);
    setIsSupabaseOnline(isSupabaseConfigured());
  };

  const handleDataRefreshed = async () => {
    const res = await ComponentService.fetchComponents();
    setComponents(res.components);
    setIsSupabaseOnline(isSupabaseConfigured());
  };

  const currentComponent = selectedComponentId
    ? components.find((c) => c.id === selectedComponentId)
    : null;

  return (
    <div className="min-h-screen bg-white text-zinc-950 flex flex-col font-sans selection:bg-black selection:text-white">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        onNavigate={(tab) => handleNavigate(tab)}
        onSearchSubmit={handleSearch}
        onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
        isSupabaseOnline={isSupabaseOnline}
      />

      {/* Main Content Area */}
      <main className="flex-1 bg-white">
        {activeTab === 'home' && (
          <HomePage
            components={components}
            onSelectComponent={handleSelectComponent}
            onNavigate={(tab, cat) => handleNavigate(tab, cat)}
            onSearch={handleSearch}
          />
        )}

        {activeTab === 'explore' && (
          <ExplorePage
            components={components}
            initialCategory={categoryFilter}
            initialSearch={searchFilter}
            onSelectComponent={handleSelectComponent}
            onNavigateHome={() => handleNavigate('home')}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesPage
            components={components}
            onSelectCategory={(cat: RocketCategory) => {
              setCategoryFilter(cat);
              setActiveTab('explore');
              scrollToTop();
            }}
            onSelectComponent={handleSelectComponent}
          />
        )}

        {activeTab === 'details' && (
          currentComponent ? (
            <ComponentDetailsPage
              component={currentComponent}
              onBack={() => {
                setActiveTab('explore');
                scrollToTop();
              }}
              onSelectRelated={handleSelectComponent}
              allComponents={components}
            />
          ) : (
            <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
              <h2 className="text-xl font-bold text-black">Component Record Not Found</h2>
              <p className="text-zinc-600 text-sm">
                The requested aerospace component was removed or does not exist in local records.
              </p>
              <button
                onClick={() => handleNavigate('explore')}
                className="px-4 py-2 bg-black text-white font-mono text-xs font-semibold rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Return to Component Catalog
              </button>
            </div>
          )
        )}

        {activeTab === 'admin' && (
          <AdminPage
            components={components}
            onViewComponent={handleSelectComponent}
            onAddComponent={handleAddComponent}
            onEditComponent={handleEditComponent}
            onDeleteComponent={handleDeleteComponent}
            onResetDefaults={handleResetDefaults}
            onToggleFeatured={handleToggleFeatured}
            onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
            onSyncSupabase={handleSyncSupabase}
            isSupabaseOnline={isSupabaseOnline}
          />
        )}

        {activeTab === 'about' && <AboutPage />}
      </main>

      {/* Supabase Configuration & Diagnostics Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onDataRefreshed={handleDataRefreshed}
      />

      {/* Footer */}
      <Footer onNavigate={(tab) => handleNavigate(tab)} />
    </div>
  );
}
