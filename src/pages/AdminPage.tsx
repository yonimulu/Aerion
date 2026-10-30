import React, { useState } from 'react';
import { 
  Settings, Plus, Pencil, Trash2, Eye, RefreshCw, Search, CheckCircle, 
  Filter, FileText, CheckCircle2, Clock, Star, Sparkles
} from 'lucide-react';
import { RocketComponent, EntryStatus } from '../types/rocket';
import { getCategoryBadgeStyle } from '../components/ComponentCard';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { EncyclopediaEntryFormModal } from '../components/EncyclopediaEntryFormModal';
import { StorageService } from '../services/storageService';

interface AdminPageProps {
  components: RocketComponent[];
  categories?: string[];
  onViewComponent: (id: string) => void;
  onAddComponent: (item: Partial<RocketComponent>) => void | Promise<void>;
  onEditComponent: (id: string, updates: Partial<RocketComponent>) => void | Promise<void>;
  onDeleteComponent: (id: string) => void | Promise<void>;
  onResetDefaults: () => void | Promise<void>;
  onToggleFeatured?: (id: string) => void | Promise<boolean | void>;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  components,
  categories: categoriesProp,
  onViewComponent,
  onAddComponent,
  onEditComponent,
  onDeleteComponent,
  onResetDefaults,
  onToggleFeatured
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

  const categories = React.useMemo(() => {
    const catSet = new Set<string>();
    catSet.add('All');

    if (categoriesProp && categoriesProp.length > 0) {
      categoriesProp.forEach((c) => catSet.add(c));
    }

    components.forEach((c) => {
      if (c.category) catSet.add(c.category);
    });

    return Array.from(catSet);
  }, [categoriesProp, components]);

  const publishedCount = components.filter((c) => (c.status || 'published') === 'published').length;
  const draftCount = components.filter((c) => c.status === 'draft').length;
  const featuredCount = components.filter((c) => c.featured).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-white dark:bg-black min-h-[85vh] transition-colors duration-200">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-black dark:bg-white text-white dark:text-black px-4 py-3 rounded-xl shadow-xl font-mono text-xs animate-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-white dark:text-black" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-zinc-600 dark:text-zinc-400 font-mono text-xs uppercase tracking-widest font-semibold">
            <Settings className="w-4 h-4 text-black dark:text-white" />
            <span>Administration</span>
          </div>
          <h1 className="text-3xl font-extrabold text-black dark:text-white tracking-tight">
            Manage Components
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
            Add new aerospace hardware records, manage definitions, attach imagery, and toggle homepage highlights.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setConfirmReset(true)}
            className="px-3.5 py-2 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-black dark:text-white border border-zinc-300 dark:border-zinc-700 text-xs font-mono font-semibold transition-colors flex items-center space-x-1.5 shadow-xs"
            title="Restore baseline sample data"
          >
            <RefreshCw className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
            <span>Reset Baseline</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-lg bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black font-mono text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Component</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-1">
          <div className="text-zinc-500 dark:text-zinc-400 font-mono text-xs uppercase font-semibold">Total Components</div>
          <div className="text-2xl font-bold text-black dark:text-white font-mono">{components.length}</div>
        </div>

        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-1">
          <div className="text-zinc-500 dark:text-zinc-400 font-mono text-xs uppercase font-semibold">Published</div>
          <div className="text-2xl font-bold text-black dark:text-white font-mono flex items-center space-x-1.5">
            <CheckCircle2 className="w-5 h-5 text-black dark:text-white" />
            <span>{publishedCount}</span>
          </div>
        </div>

        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-1">
          <div className="text-zinc-500 dark:text-zinc-400 font-mono text-xs uppercase font-semibold">Drafts</div>
          <div className="text-2xl font-bold text-black dark:text-white font-mono flex items-center space-x-1.5">
            <Clock className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            <span>{draftCount}</span>
          </div>
        </div>

        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-1">
          <div className="text-zinc-500 dark:text-zinc-400 font-mono text-xs uppercase font-semibold">Featured</div>
          <div className="text-2xl font-bold text-black dark:text-white font-mono flex items-center space-x-1.5">
            <Star className="w-5 h-5 fill-black dark:fill-white text-black dark:text-white" />
            <span>{featuredCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by component name, catalog ID, or category..."
            className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-mono text-black dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-black dark:focus:border-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="text-zinc-600 dark:text-zinc-400 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white text-xs font-mono focus:outline-none focus:border-black dark:focus:border-white"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-zinc-600 dark:text-zinc-400 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white text-xs font-mono focus:outline-none focus:border-black dark:focus:border-white"
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
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 font-mono text-zinc-600 dark:text-zinc-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Component</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-center">Featured</th>
                <th className="px-4 py-3.5">Image</th>
                <th className="px-4 py-3.5">Review Date</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-sans">
              {filteredComponents.length > 0 ? (
                filteredComponents.map((item) => {
                  const badge = getCategoryBadgeStyle(item.category);
                  const CategoryIcon = badge.icon;
                  const itemImg = StorageService.resolveComponentImageUrl(item);
                  const isPublished = (item.status || 'published') === 'published';

                  return (
                    <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors">
                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          {itemImg ? (
                            <img
                              src={itemImg}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shrink-0"
                              onError={async (e) => {
                                if (item.image_storage_path && !item.image_storage_path.startsWith('data:')) {
                                  const signed = await StorageService.getSignedUrl(item.image_storage_path);
                                  if (signed) {
                                    (e.currentTarget as HTMLImageElement).src = signed;
                                    return;
                                  }
                                }
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 dark:text-zinc-500 shrink-0 font-mono text-[10px]">
                              N/A
                            </div>
                          )}
                          <div>
                            <div 
                              className="font-bold text-black dark:text-white hover:underline cursor-pointer"
                              onClick={() => onViewComponent(item.id)}
                            >
                              {item.component_name || item.name}
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
                              ? 'bg-black dark:bg-white text-white dark:text-black'
                              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
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
                              ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-xs'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700'
                          }`}
                          title={item.featured ? 'Remove from Homepage Highlights' : 'Feature on Homepage Highlights'}
                        >
                          <Star className={`w-3 h-3 ${item.featured ? 'fill-white dark:fill-black text-white dark:text-black' : ''}`} />
                          <span>{item.featured ? 'Featured' : 'Standard'}</span>
                        </button>
                      </td>

                      {/* Image Source */}
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                        {item.image_storage_path ? (
                          <span className="text-black dark:text-white font-semibold">Device Upload</span>
                        ) : item.image_url || item.imageUrl ? (
                          <span className="text-zinc-600 dark:text-zinc-400">External URL</span>
                        ) : (
                          <span className="text-zinc-400 dark:text-zinc-500">No Image</span>
                        )}
                      </td>

                      {/* Review Date */}
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                        {item.review_date || item.updated_at?.slice(0, 10) || 'Pending'}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center space-x-1.5 font-mono">
                          <button
                            onClick={() => onViewComponent(item.id)}
                            className="p-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Edit Record"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingItem(item)}
                            className="p-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
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
                  <td colSpan={8} className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400 font-mono">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-black dark:text-white">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">Restore Baseline Catalog</h3>
                <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">Reset Local Records</p>
              </div>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              This will re-initialize the component database with the default authentic aerospace engineering hardware records (Fuselage, RS-25 Engine, Flight Computer, Grid Fins, etc.). Any manual edits will be overwritten.
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setConfirmReset(false)}
                className="px-4 py-2 rounded-lg text-xs font-mono text-black dark:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteReset}
                className="px-4 py-2 rounded-lg text-xs font-mono font-bold text-white dark:text-black bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200"
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
        availableCategories={categories.filter((c) => c !== 'All')}
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
