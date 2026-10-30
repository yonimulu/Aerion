import { RocketComponent } from '../types/rocket';
import { INITIAL_COMPONENTS, DEFAULT_FALLBACK_CATEGORIES } from '../data/initialRocketComponents';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { StorageService } from './storageService';

const STORAGE_KEY = 'aerion_encyclopedia_catalog_v2';
const CATEGORIES_KEY = 'aerion_categories_catalog_v2';
const IDB_NAME = 'aerion_encyclopedia_db';
const IDB_VERSION = 2;
const IDB_STORE_ENTRIES = 'encyclopedia_entries';

/**
 * Open or upgrade the IndexedDB database for persistent local storage.
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = indexedDB.open(IDB_NAME, IDB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(IDB_STORE_ENTRIES)) {
        db.createObjectStore(IDB_STORE_ENTRIES, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Syncs the in-memory/localStorage list into IndexedDB asynchronously.
 */
async function syncToIndexedDB(items: RocketComponent[]): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(IDB_STORE_ENTRIES, 'readwrite');
    const store = tx.objectStore(IDB_STORE_ENTRIES);

    store.clear();
    for (const item of items) {
      store.put(item);
    }
  } catch (err) {
    console.warn('Could not sync to IndexedDB, fallback active:', err);
  }
}

/**
 * Transforms a Supabase PostgreSQL row into a frontend RocketComponent object.
 */
function rowToComponent(row: any, index: number = 0): RocketComponent {
  const compName = row.component_name || row.name || 'Aerospace Component';
  const catId = row.catalog_id || `entry-${index + 1}`;
  const entryNum = row.entry_number || String(index + 1).padStart(3, '0');
  const now = new Date().toISOString();

  // Robustly resolve displayable URL from image_url, imageUrl, or image_storage_path
  const rawUrl = row.image_url || row.imageUrl || null;
  const rawPath = row.image_storage_path || null;
  const resolvedImg = StorageService.resolveImageUrl(rawUrl, rawPath);

  return {
    id: String(row.id || `aerion-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`),
    entry_number: entryNum,
    component_name: compName,
    category: row.category || 'Airframe, structures & flight controls',
    catalog_id: catId,

    definition_description: row.definition_description || row.overview || '',
    purpose_engineering_value: row.purpose_engineering_value || row.purpose || '',
    operating_principle: row.operating_principle || row.operatingPrinciples || '',
    location_installation_context: row.location_installation_context || row.stageLocation || '',
    applications_operating_context: row.applications_operating_context || 'Commercial and aerospace launch vehicles across flight envelope.',
    interfaces_system_connections: row.interfaces_system_connections || 'Mechanical attachments, structural spars, and electronic harnesses.',
    identification_verification_guidance: row.identification_verification_guidance || 'Part number verification and NDE weld inspections.',
    safety_limitations: row.safety_limitations || 'Aerodynamic dynamic pressure and temperature limits.',
    technical_reference_guidance: row.technical_reference_guidance || 'AIAA, FAA, and NASA aerospace standards.',

    image_storage_path: rawPath,
    image_url: resolvedImg || rawUrl || null,
    image_title: row.image_title || compName,
    image_caption: row.image_caption || '',
    image_alt_text: row.image_alt_text || `${compName} technical visual`,
    image_source: (() => {
      const raw = (row.image_source || '').trim();
      if (/wikimedia|commons/i.test(raw)) return '';
      return raw;
    })(),
    image_source_url: row.image_source_url || '',
    image_verification_status: row.image_verification_status || 'Verified',
    image_verified_at: row.image_verified_at || now.slice(0, 10),

    status: row.status || 'published',
    created_at: row.created_at || now,
    updated_at: row.updated_at || now,
    review_date: row.review_date || now.slice(0, 10),
    featured: Boolean(row.featured),

    // Convenience & legacy compatibility
    name: compName,
    designation: row.designation || catId.toUpperCase(),
    shortDescription: row.shortDescription || row.definition_description || '',
    overview: row.definition_description || row.overview || '',
    purpose: row.purpose_engineering_value || row.purpose || '',
    operatingPrinciples: row.operating_principle || row.operatingPrinciples || '',
    facts: Array.isArray(row.facts) ? row.facts : (typeof row.facts === 'string' ? JSON.parse(row.facts) : [
      'Engineered for aerospace vibration and aerodynamic loading.',
      'Meets flight hardware qualification criteria.'
    ]),
    imageUrl: resolvedImg,
    videoUrl: row.video_url || row.videoUrl,
    referenceLinks: Array.isArray(row.reference_links) ? row.reference_links : row.referenceLinks,
    specifications: row.specifications && typeof row.specifications === 'object' ? row.specifications : {},
    stageLocation: row.stage_location || row.location_installation_context || row.stageLocation || '',
    typicalMaterials: row.typical_materials || row.typicalMaterials || 'Aerospace-grade alloys & composites',
    createdAt: row.created_at || now,
    updatedAt: row.updated_at || now
  };
}

/**
 * Transforms a RocketComponent into a Supabase PostgreSQL row object.
 */
function componentToRow(item: Partial<RocketComponent>, isCreate: boolean = false): Record<string, any> {
  const compName = item.component_name || item.name || 'Aerospace Component';
  const catId = (item.catalog_id || compName.toLowerCase().replace(/[^a-z0-9]+/g, '-')).toLowerCase().trim();
  const entryNum = item.entry_number || '001';
  const now = new Date().toISOString();

  const row: Record<string, any> = {
    entry_number: entryNum,
    component_name: compName,
    category: item.category || 'Airframe, structures & flight controls',
    catalog_id: catId,
    
    definition_description: item.definition_description || item.overview || '',
    purpose_engineering_value: item.purpose_engineering_value || item.purpose || '',
    operating_principle: item.operating_principle || item.operatingPrinciples || '',
    location_installation_context: item.location_installation_context || item.stageLocation || '',
    applications_operating_context: item.applications_operating_context || '',
    interfaces_system_connections: item.interfaces_system_connections || '',
    identification_verification_guidance: item.identification_verification_guidance || '',
    safety_limitations: item.safety_limitations || '',
    technical_reference_guidance: item.technical_reference_guidance || '',

    image_storage_path: item.image_storage_path || null,
    image_url: item.image_url || item.imageUrl || null,
    image_title: item.image_title || compName,
    image_caption: item.image_caption || '',
    image_alt_text: item.image_alt_text || `${compName} technical visual`,
    image_source: (() => {
      const raw = (item.image_source || '').trim();
      if (/wikimedia|commons/i.test(raw)) return null;
      return raw || null;
    })(),
    image_source_url: item.image_source_url || '',
    image_verification_status: item.image_verification_status || 'Verified',
    image_verified_at: item.image_verified_at ? item.image_verified_at.slice(0, 10) : now.slice(0, 10),

    status: item.status || 'published',
    review_date: item.review_date ? item.review_date.slice(0, 10) : now.slice(0, 10),
    featured: Boolean(item.featured),

    facts: item.facts || [],
    specifications: item.specifications || {},
    reference_links: item.referenceLinks || [],
    video_url: item.videoUrl || null,
    stage_location: item.location_installation_context || item.stageLocation || '',
    typical_materials: item.typicalMaterials || 'Aerospace-grade alloys & composites',
    updated_at: now
  };

  if (isCreate) {
    if (item.id) {
      row.id = item.id;
    }
    row.created_at = item.created_at || item.createdAt || now;
  }

  return row;
}

export const ComponentService = {
  /**
   * Synchronous getter for instant render from localStorage / cache.
   */
  getAllComponents(): RocketComponent[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        const seeded = INITIAL_COMPONENTS.map((c, i) => rowToComponent(c, i));
        this.saveAll(seeded);
        return seeded;
      }
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        const seeded = INITIAL_COMPONENTS.map((c, i) => rowToComponent(c, i));
        this.saveAll(seeded);
        return seeded;
      }
      return parsed.map((c, i) => rowToComponent(c, i));
    } catch (e) {
      console.warn('Could not read from localStorage, using initial baseline', e);
      return INITIAL_COMPONENTS.map((c, i) => rowToComponent(c, i));
    }
  },

  /**
   * Asynchronously fetches components from Supabase database.
   * If Supabase is empty or unseeded, seeds initial catalog entries.
   * Caches results into localStorage & IndexedDB.
   */
  async fetchComponents(): Promise<{ components: RocketComponent[]; source: 'supabase' | 'cache'; error?: string }> {
    const supabase = getSupabase();

    if (!supabase) {
      return {
        components: this.getAllComponents(),
        source: 'cache'
      };
    }

    try {
      const { data, error } = await supabase
        .from('encyclopedia_entries')
        .select('*')
        .order('entry_number', { ascending: true });

      if (error) {
        console.warn('Supabase fetch failed, falling back to local cache:', error.message);
        return {
          components: this.getAllComponents(),
          source: 'cache',
          error: error.message
        };
      }

      if (!data || data.length === 0) {
        // If Supabase table exists but has 0 records, automatically seed it with initial components!
        console.info('Supabase encyclopedia_entries is empty. Seeding initial flight hardware dataset...');
        const seeded = await this.seedSupabase();
        return {
          components: seeded,
          source: 'supabase'
        };
      }

      const list = data.map((row, i) => rowToComponent(row, i));
      this.saveAll(list);
      return {
        components: list,
        source: 'supabase'
      };
    } catch (err: any) {
      console.warn('Network exception while fetching Supabase records:', err);
      return {
        components: this.getAllComponents(),
        source: 'cache',
        error: err?.message || 'Network exception'
      };
    }
  },

  /**
   * Writes components list to persistent localStorage and mirrors to IndexedDB.
   */
  saveAll(list: RocketComponent[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      syncToIndexedDB(list);
    } catch (e) {
      console.error('Failed to write to local persistent storage:', e);
    }
  },

  /**
   * Retrieves a single component by its primary key ID.
   */
  getComponentById(id: string): RocketComponent | undefined {
    const list = this.getAllComponents();
    return list.find((item) => item.id === id);
  },

  /**
   * Calculates the next sequential entry number formatted as "001", "002", etc.
   */
  getNextEntryNumber(): string {
    const list = this.getAllComponents();
    let maxNum = 0;
    for (const item of list) {
      const parsed = parseInt(item.entry_number, 10);
      if (!isNaN(parsed) && parsed > maxNum) {
        maxNum = parsed;
      }
    }
    return String(maxNum + 1).padStart(3, '0');
  },

  /**
   * Generates a suggested lowercase catalog ID from a component name.
   */
  suggestCatalogId(name: string): string {
    if (!name) return '';
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  /**
   * Checks whether a catalog ID is unique among all existing entries.
   */
  isCatalogIdUnique(catalogId: string, excludeId?: string): boolean {
    if (!catalogId) return false;
    const cleanId = catalogId.trim().toLowerCase();
    const list = this.getAllComponents();
    const conflict = list.find(
      (item) => item.catalog_id?.trim().toLowerCase() === cleanId && item.id !== excludeId
    );
    return !conflict;
  },

  /**
   * Creates a new encyclopedia entry in Supabase (with fallback to local storage).
   */
  async createComponent(entryData: Partial<RocketComponent>): Promise<{ component: RocketComponent; error?: string }> {
    const nextNum = entryData.entry_number || this.getNextEntryNumber();
    const newId = entryData.id || `aerion-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const fullItem = rowToComponent({
      ...entryData,
      id: newId,
      entry_number: nextNum,
      featured: entryData.featured ?? false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    const supabase = getSupabase();

    if (supabase) {
      try {
        const rowData = componentToRow(fullItem, true);
        const { data, error } = await supabase
          .from('encyclopedia_entries')
          .insert([rowData])
          .select()
          .single();

        if (error) {
          console.error('Supabase insert failed:', error.message);
          // Still save locally so data isn't lost
          const localList = [fullItem, ...this.getAllComponents()];
          this.saveAll(localList);
          return { component: fullItem, error: error.message };
        }

        const inserted = rowToComponent(data);
        const updatedList = [inserted, ...this.getAllComponents().filter(c => c.id !== inserted.id)];
        this.saveAll(updatedList);
        return { component: inserted };
      } catch (err: any) {
        console.error('Exception during Supabase insert:', err);
        const localList = [fullItem, ...this.getAllComponents()];
        this.saveAll(localList);
        return { component: fullItem, error: err?.message || 'Insert error' };
      }
    }

    // Local-only mode
    const list = [fullItem, ...this.getAllComponents()];
    this.saveAll(list);
    return { component: fullItem };
  },

  /**
   * Updates an existing entry by ID in Supabase and local cache.
   */
  async updateComponent(id: string, updates: Partial<RocketComponent>): Promise<{ component: RocketComponent | null; error?: string }> {
    const list = this.getAllComponents();
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) return { component: null, error: 'Component not found' };

    const existing = list[index];
    const merged = rowToComponent({
      ...existing,
      ...updates,
      id: existing.id,
      updated_at: new Date().toISOString()
    });

    const supabase = getSupabase();

    if (supabase) {
      try {
        const rowData = componentToRow(merged, false);
        const { data, error } = await supabase
          .from('encyclopedia_entries')
          .update(rowData)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Supabase update failed:', error.message);
          list[index] = merged;
          this.saveAll(list);
          return { component: merged, error: error.message };
        }

        const updated = rowToComponent(data);
        list[index] = updated;
        this.saveAll(list);
        return { component: updated };
      } catch (err: any) {
        console.error('Exception during Supabase update:', err);
        list[index] = merged;
        this.saveAll(list);
        return { component: merged, error: err?.message };
      }
    }

    list[index] = merged;
    this.saveAll(list);
    return { component: merged };
  },

  /**
   * Deletes a component by ID from Supabase and local cache.
   */
  async deleteComponent(id: string): Promise<{ success: boolean; error?: string }> {
    const list = this.getAllComponents();
    const existing = list.find((c) => c.id === id);
    const filtered = list.filter((item) => item.id !== id);

    // Optionally delete associated storage image if path exists
    if (existing?.image_storage_path) {
      StorageService.deleteImage(existing.image_storage_path).catch(() => {});
    }

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase
          .from('encyclopedia_entries')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Supabase delete error:', error.message);
          this.saveAll(filtered);
          return { success: true, error: error.message };
        }
      } catch (err: any) {
        console.error('Exception during Supabase delete:', err);
      }
    }

    this.saveAll(filtered);
    return { success: true };
  },

  /**
   * Toggles the featured status of a component in Supabase & local cache.
   */
  async toggleFeatured(id: string): Promise<boolean> {
    const list = this.getAllComponents();
    const item = list.find((c) => c.id === id);
    if (!item) return false;

    const newFeatured = !item.featured;
    item.featured = newFeatured;
    item.updated_at = new Date().toISOString();
    this.saveAll(list);

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase
          .from('encyclopedia_entries')
          .update({ featured: newFeatured, updated_at: new Date().toISOString() })
          .eq('id', id);
      } catch (err) {
        console.warn('Failed to update featured flag in Supabase:', err);
      }
    }

    return newFeatured;
  },

  /**
   * Seeds the Supabase database with the initial foundational dataset.
   */
  async seedSupabase(): Promise<RocketComponent[]> {
    const supabase = getSupabase();
    const baseItems = INITIAL_COMPONENTS.map((c, i) => rowToComponent(c, i));

    if (!supabase) {
      this.saveAll(baseItems);
      return baseItems;
    }

    try {
      const rows = baseItems.map(item => componentToRow(item, true));
      const { data, error } = await supabase
        .from('encyclopedia_entries')
        .upsert(rows, { onConflict: 'entry_number' })
        .select();

      if (error) {
        console.error('Failed to seed Supabase database:', error.message);
        this.saveAll(baseItems);
        return baseItems;
      }

      if (data && data.length > 0) {
        const synced = data.map((r, i) => rowToComponent(r, i));
        this.saveAll(synced);
        return synced;
      }
    } catch (err) {
      console.error('Exception during Supabase seeding:', err);
    }

    this.saveAll(baseItems);
    return baseItems;
  },

  /**
   * Resets local cache and re-seeds Supabase database to default hardware catalog.
   */
  async resetToDefaults(): Promise<RocketComponent[]> {
    const fresh = await this.seedSupabase();
    await this.fetchCategories();
    return fresh;
  },

  /**
   * Synchronously returns cached categories or extracts distinct categories from local components.
   */
  getCachedCategories(): string[] {
    try {
      const stored = localStorage.getItem(CATEGORIES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    // Extract from loaded components
    const list = this.getAllComponents();
    const set = new Set<string>();
    list.forEach((c) => {
      if (c.category && typeof c.category === 'string') {
        const trimmed = c.category.trim();
        if (trimmed) set.add(trimmed);
      }
    });

    if (set.size > 0) {
      const arr = Array.from(set);
      try {
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(arr));
      } catch {}
      return arr;
    }

    return DEFAULT_FALLBACK_CATEGORIES;
  },

  /**
   * Asynchronously queries the live database for real distinct categories.
   * Checks Supabase encyclopedia_entries and any dedicated categories table,
   * merges with local records, caches, and returns sorted categories.
   */
  async fetchCategories(): Promise<string[]> {
    const supabase = getSupabase();
    const categoriesSet = new Set<string>();

    if (supabase) {
      try {
        // 1. Try querying dedicated 'categories' table if it exists in Supabase
        try {
          const { data: catTable, error: catTableErr } = await supabase
            .from('categories')
            .select('name, title, id');

          if (!catTableErr && catTable && catTable.length > 0) {
            catTable.forEach((r: any) => {
              const val = r.name || r.title || r.id;
              if (val && typeof val === 'string' && val.trim()) {
                categoriesSet.add(val.trim());
              }
            });
          }
        } catch {
          // dedicated categories table is optional
        }

        // 2. Fetch distinct categories from live encyclopedia_entries table
        const { data: entryRows, error: entryErr } = await supabase
          .from('encyclopedia_entries')
          .select('category');

        if (!entryErr && entryRows && entryRows.length > 0) {
          entryRows.forEach((r: any) => {
            if (r.category && typeof r.category === 'string' && r.category.trim()) {
              categoriesSet.add(r.category.trim());
            }
          });
        }
      } catch (err) {
        console.warn('Network exception while fetching Supabase categories:', err);
      }
    }

    // 3. Only if database didn't return any categories (e.g. offline mode), check local components
    if (categoriesSet.size === 0) {
      const localComps = this.getAllComponents();
      localComps.forEach((c) => {
        if (c.category && typeof c.category === 'string' && c.category.trim()) {
          categoriesSet.add(c.category.trim());
        }
      });
    }

    // 4. Final fallback only if database and local cache are completely empty
    if (categoriesSet.size === 0) {
      DEFAULT_FALLBACK_CATEGORIES.forEach((cat) => categoriesSet.add(cat));
    }

    const result = Array.from(categoriesSet);

    // Cache to localStorage
    try {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(result));
    } catch (e) {
      console.warn('Failed to cache categories to localStorage:', e);
    }

    return result;
  }
};
