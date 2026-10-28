import React, { useState } from 'react';
import { 
  Settings, Plus, Pencil, Trash2, Eye, RefreshCw, Search, CheckCircle, 
  Database, Filter, FileText, CheckCircle2, Clock, Star, Sparkles
} from 'lucide-react';
import { RocketComponent, EntryStatus } from '../types/rocket';
import { getCategoryBadgeStyle } from '../components/ComponentCard';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { EncyclopediaEntryFormModal } from '../components/EncyclopediaEntryFormModal';

interface AdminPageProps {
  components: RocketComponent[];
  onViewComponent: (id: string) => void;
  onAddComponent: (item: Partial<RocketComponent>) => void | Promise<void>;
  onEditComponent: (id: string, updates: Partial<RocketComponent>) => void | Promise<void>;
  onDeleteComponent: (id: string) => void | Promise<void>;
  onResetDefaults: () => void | Promise<void>;
  onToggleFeatured?: (id: string) => void | Promise<boolean | void>;
  onOpenSupabaseConfig?: () => void;
  onSyncSupabase?: () => Promise<void> | void;
  isSupabaseOnline?: boolean;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  components,
  onViewComponent,
  onAddComponent,
  onEditComponent,
  onDeleteComponent,
  onResetDefaults,
  onToggleFeatured,
  onOpenSupabaseConfig,
  onSyncSupabase,
  isSupabaseOnline = false
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RocketComponent | null>(null);

  // Delete modal state
  const [deletingItem, setDeletingItem] = useState<RocketComponent | null>(null);

  // Reset defaults confirmation
  const [confirmReset, setConfirmReset] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: RocketComponent) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleSaveForm = (data: Partial<RocketComponent>) => {
    if (editingItem) {
      onEditComponent(editingItem.id, data);
      showNotification(`Updated entry "${data.component_name || data.name}"`);
    } else {
      onAddComponent(data);
      showNotification(`Created entry "${data.component_name || data.name}"`);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingItem) {
      onDeleteComponent(deletingItem.id);
      showNotification(`Deleted entry "${deletingItem.component_name || deletingItem.name}"`);
      setDeletingItem(null);
    }
  };

  const handleExecuteReset = () => {
    onResetDefaults();
    setConfirmReset(false);
    showNotification('Catalog reset to baseline educational sample data');
  };

  // Filter components by search (Name, Catalog ID, Category), Category filter, and Status filter
  const filteredComponents = components.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus =
      selectedStatus === 'All'
        ? true
        : selectedStatus === 'featured'
        ? Boolean(item.featured)
        : (item.status || 'published') === selectedStatus;
    
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.component_name?.toLowerCase().includes(q) ||
      item.name?.toLowerCase().includes(q) ||
      item.catalog_id?.toLowerCase().includes(q) ||
      item.designation?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.entry_number?.toLowerCase().includes(q);

    return matchesCategory && matchesStatus && matchesSearch;
  });

  const categories = [
    'All',
    'Airframe, structures & flight controls',
    'Propulsion',
    'Structures',
    'Avionics',
    'Guidance & Control',
    'Electrical Systems',
    'Thermal Protection',
    'Recovery Systems'
  ];

  const publishedCount = components.filter((c) => (c.status || 'published') === 'published').length;
  const draftCount = components.filter((c) => c.status === 'draft').length;
  const featuredCount = components.filter((c) => c.featured).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-white min-h-[85vh]">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-black text-white px-4 py-3 rounded-xl shadow-xl font-mono text-xs animate-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-white" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-zinc-600 font-mono text-xs uppercase tracking-widest font-semibold">
            <Settings className="w-4 h-4 text-black" />
            <span>Encyclopedia Administration & Registry</span>
          </div>
          <h1 className="text-3xl font-extrabold text-black tracking-tight">
            Encyclopedia Entry Management
          </h1>
          <p className="text-zinc-600 text-xs sm:text-sm">
            Add new aerospace hardware records, manage definitions, attach device or URL imagery, and toggle homepage featured highlights.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setConfirmReset(true)}
            className="px-3.5 py-2 rounded-lg bg-white hover:bg-zinc-100 text-black border border-zinc-300 text-xs font-mono font-semibold transition-colors flex items-center space-x-1.5 shadow-xs"
            title="Restore baseline sample data"
          >
            <RefreshCw className="w-3.5 h-3.5 text-zinc-700" />
            <span>Reset Baseline</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-lg bg-black hover:bg-zinc-800 text-white font-mono text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Encyclopedia Entry</span>
          </button>
        </div>
      </div>

      {/* Database Integration & Status Card */}
      <div className="bg-zinc-50 border border-zinc-300 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-black">
                Database Engine: {isSupabaseOnline ? 'Supabase PostgreSQL (Connected)' : 'Local Persistent Cache (Supabase-Ready)'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                isSupabaseOnline ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-zinc-200 text-zinc-700'
              }`}>
                {isSupabaseOnline ? '● Live Cloud' : 'Offline / Cache'}
              </span>
            </div>
            <p className="text-xs text-zinc-600 font-mono mt-0.5">
              Table: <span className="font-bold text-black">public.encyclopedia_entries</span> | Storage: <span className="font-bold text-black">aerospace-media</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0 w-full sm:w-auto">
          {onSyncSupabase && (
            <button
              onClick={onSyncSupabase}
              className="px-3 py-1.5 bg-white hover:bg-zinc-100 border border-zinc-300 text-black text-xs font-mono font-bold rounded-lg transition-colors flex items-center space-x-1.5"
              title="Sync local flight hardware entries to Supabase"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync to Cloud</span>
            </button>
          )}
          {onOpenSupabaseConfig && (
            <button
              onClick={onOpenSupabaseConfig}
              className="px-3.5 py-1.5 bg-black hover:bg-zinc-800 text-white text-xs font-mono font-bold rounded-lg transition-colors flex items-center space-x-1.5 shadow-xs"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Supabase & Auth</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
          <div className="text-zinc-500 font-mono text-xs uppercase font-semibold">Total Entries</div>
          <div className="text-2xl font-bold text-black font-mono">{components.length}</div>
          <div className="text-[11px] text-zinc-500 font-mono">Registered hardware items</div>
        </div>

        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
          <div className="text-zinc-500 font-mono text-xs uppercase font-semibold">Published</div>
          <div className="text-2xl font-bold text-black font-mono flex items-center space-x-1.5">
            <CheckCircle2 className="w-5 h-5 text-black" />
            <span>{publishedCount}</span>
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">Live in public catalog</div>
        </div>

        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
          <div className="text-zinc-500 font-mono text-xs uppercase font-semibold">Drafts</div>
          <div className="text-2xl font-bold text-black font-mono flex items-center space-x-1.5">
            <Clock className="w-5 h-5 text-zinc-600" />
            <span>{draftCount}</span>
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">Unpublished revisions</div>
        </div>

        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
          <div className="text-zinc-500 font-mono text-xs uppercase font-semibold">Featured Highlights</div>
          <div className="text-2xl font-bold text-black font-mono flex items-center space-x-1.5">
            <Star className="w-5 h-5 fill-black text-black" />
            <span>{featuredCount}</span>
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">Showcased on homepage</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-zinc-50 p-3 rounded-xl border border-zinc-200">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by component name, catalog ID, or category..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-mono text-black placeholder-zinc-400 focus:outline-none focus:border-black"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="text-zinc-600 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-zinc-300 rounded-lg text-black text-xs font-mono focus:outline-none focus:border-black"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-zinc-600 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-zinc-300 rounded-lg text-black text-xs font-mono focus:outline-none focus:border-black"
            >
              <option value="All">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="featured">Featured Highlights Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 font-mono text-zinc-600 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">No.</th>
                <th className="px-4 py-3.5">Component & Catalog ID</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-center">Featured</th>
                <th className="px-4 py-3.5">Image Source</th>
                <th className="px-4 py-3.5">Review Date</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 font-sans">
              {filteredComponents.length > 0 ? (
                filteredComponents.map((item) => {
                  const badge = getCategoryBadgeStyle(item.category);
                  const CategoryIcon = badge.icon;
                  const itemImg = item.image_storage_path || item.image_url || item.imageUrl;
                  const isPublished = (item.status || 'published') === 'published';

                  return (
                    <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                      {/* Entry Number */}
                      <td className="px-4 py-3 font-mono font-bold text-black whitespace-nowrap">
                        {item.entry_number || '001'}
                      </td>

                      {/* Name & Catalog ID */}
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          {itemImg ? (
                            <img
                              src={itemImg}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover bg-zinc-100 border border-zinc-200 shrink-0"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 shrink-0 font-mono text-[10px]">
                              N/A
                            </div>
                          )}
                          <div className="space-y-0.5">
                            <div 
                              className="font-bold text-black hover:underline cursor-pointer"
                              onClick={() => onViewComponent(item.id)}
                            >
                              {item.component_name || item.name}
                            </div>
                            <div className="font-mono text-[11px] text-zinc-500">
                              id: <span className="text-zinc-800">{item.catalog_id || item.designation || 'unassigned'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Subsystem */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono border ${badge.bg}`}>
                          <CategoryIcon className="w-3 h-3" />
                          <span className="truncate max-w-[180px]">{item.category}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                            isPublished
                              ? 'bg-black text-white'
                              : 'bg-zinc-200 text-zinc-800'
                          }`}
                        >
                          {isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>

                      {/* Featured Quick Toggle */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            if (onToggleFeatured) {
                              onToggleFeatured(item.id);
                              showNotification(
                                item.featured
                                  ? `Removed "${item.component_name || item.name}" from homepage highlights`
                                  : `Marked "${item.component_name || item.name}" as featured on homepage`
                              );
                            }
                          }}
                          className={`px-2 py-1 rounded-md text-[10px] font-mono font-semibold transition-all inline-flex items-center space-x-1.5 ${
                            item.featured
                              ? 'bg-black text-white hover:bg-zinc-800 shadow-xs'
                              : 'bg-zinc-100 text-zinc-500 hover:text-black hover:bg-zinc-200 border border-zinc-200'
                          }`}
                          title={item.featured ? 'Remove from Homepage Highlights' : 'Feature on Homepage Highlights'}
                        >
                          <Star className={`w-3 h-3 ${item.featured ? 'fill-white text-white' : ''}`} />
                          <span>{item.featured ? 'Featured' : 'Standard'}</span>
                        </button>
                      </td>

                      {/* Image Source */}
                      <td className="px-4 py-3 text-zinc-600 font-mono text-[11px] whitespace-nowrap">
                        {item.image_storage_path ? (
                          <span className="text-black font-semibold">Device Upload</span>
                        ) : item.image_url || item.imageUrl ? (
                          <span className="text-zinc-600">External URL</span>
                        ) : (
                          <span className="text-zinc-400">No Image</span>
                        )}
                      </td>

                      {/* Review Date */}
                      <td className="px-4 py-3 text-zinc-600 font-mono text-[11px] whitespace-nowrap">
                        {item.review_date || item.updated_at?.slice(0, 10) || 'Pending'}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center space-x-1.5 font-mono">
                          <button
                            onClick={() => onViewComponent(item.id)}
                            className="p-1.5 rounded-lg text-zinc-700 hover:text-black hover:bg-zinc-100 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg text-zinc-700 hover:text-black hover:bg-zinc-100 transition-colors"
                            title="Edit Record"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingItem(item)}
                            className="p-1.5 rounded-lg text-zinc-700 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Component"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-zinc-500 font-mono">
                    No encyclopedia entries match the current filter or search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Resetting to Defaults */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-zinc-300 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-300 flex items-center justify-center text-black">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-black">Restore Baseline Catalog</h3>
                <p className="text-xs font-mono text-zinc-500">Reset Local Records</p>
              </div>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              This will re-initialize the component database with the default authentic aerospace engineering hardware records (Fuselage, RS-25 Engine, Flight Computer, Grid Fins, etc.). Any manual edits will be overwritten.
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setConfirmReset(false)}
                className="px-4 py-2 rounded-lg text-xs font-mono text-black bg-zinc-100 hover:bg-zinc-200 border border-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteReset}
                className="px-4 py-2 rounded-lg text-xs font-mono font-bold text-white bg-black hover:bg-zinc-800"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Encyclopedia Entry Modal */}
      <EncyclopediaEntryFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveForm}
        onDelete={(id) => {
          setIsFormOpen(false);
          const target = components.find((c) => c.id === id);
          if (target) setDeletingItem(target);
        }}
        initialData={editingItem}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        component={deletingItem}
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
