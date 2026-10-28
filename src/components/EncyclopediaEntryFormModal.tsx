import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Check, AlertCircle, Upload, Link as LinkIcon, Trash2, Eye, 
  RefreshCw, CheckCircle2, FileText, Image as ImageIcon, Sparkles, Layers
} from 'lucide-react';
import { RocketComponent, RocketCategory, VerificationStatus, EntryStatus } from '../types/rocket';
import { ComponentService } from '../services/componentService';
import { StorageService } from '../services/storageService';
import { EncyclopediaLivePreview } from './EncyclopediaLivePreview';

interface EncyclopediaEntryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Partial<RocketComponent>) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
  initialData?: RocketComponent | null;
}

const DEFAULT_CATEGORIES: string[] = [
  'Airframe, structures & flight controls',
  'Propulsion',
  'Structures',
  'Avionics',
  'Guidance & Control',
  'Electrical Systems',
  'Thermal Protection',
  'Recovery Systems'
];

export const EncyclopediaEntryFormModal: React.FC<EncyclopediaEntryFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData
}) => {
  const isEditing = !!initialData;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active view on mobile (Form vs Live Preview)
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');

  // Form State
  const [entryNumber, setEntryNumber] = useState('');
  const [componentName, setComponentName] = useState('');
  const [category, setCategory] = useState('Airframe, structures & flight controls');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCat, setIsCustomCat] = useState(false);
  const [catalogId, setCatalogId] = useState('');
  const [catalogIdManualEdit, setCatalogIdManualEdit] = useState(false);

  // Content Sections
  const [definitionDescription, setDefinitionDescription] = useState('');
  const [purposeEngineeringValue, setPurposeEngineeringValue] = useState('');
  const [operatingPrinciple, setOperatingPrinciple] = useState('');
  const [locationInstallationContext, setLocationInstallationContext] = useState('');
  const [applicationsOperatingContext, setApplicationsOperatingContext] = useState('');
  const [interfacesSystemConnections, setInterfacesSystemConnections] = useState('');
  const [identificationVerificationGuidance, setIdentificationVerificationGuidance] = useState('');
  const [safetyLimitations, setSafetyLimitations] = useState('');
  const [technicalReferenceGuidance, setTechnicalReferenceGuidance] = useState('');

  // Image Source Mode & Data
  const [imageSourceMode, setImageSourceMode] = useState<'upload' | 'url'>('url');
  const [uploadedImageData, setUploadedImageData] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [urlImageError, setUrlImageError] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Image Metadata
  const [imageTitle, setImageTitle] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageAltText, setImageAltText] = useState('');
  const [imageSource, setImageSource] = useState('');
  const [imageSourceUrl, setImageSourceUrl] = useState('');
  const [imageVerificationStatus, setImageVerificationStatus] = useState<VerificationStatus>('Verified');
  const [imageVerifiedAt, setImageVerifiedAt] = useState('');

  // Administrative Lifecycle
  const [reviewDate, setReviewDate] = useState('');
  const [featured, setFeatured] = useState(false);

  // Validation & Dirtiness
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Populate or Reset Form
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setEntryNumber(initialData.entry_number || '001');
      setComponentName(initialData.component_name || initialData.name || '');
      
      const cat = initialData.category || 'Airframe, structures & flight controls';
      if (DEFAULT_CATEGORIES.includes(cat)) {
        setCategory(cat);
        setIsCustomCat(false);
        setCustomCategory('');
      } else {
        setCategory('Other');
        setIsCustomCat(true);
        setCustomCategory(cat);
      }

      setCatalogId(initialData.catalog_id || '');
      setCatalogIdManualEdit(true);

      setDefinitionDescription(initialData.definition_description || initialData.overview || '');
      setPurposeEngineeringValue(initialData.purpose_engineering_value || initialData.purpose || '');
      setOperatingPrinciple(initialData.operating_principle || initialData.operatingPrinciples || '');
      setLocationInstallationContext(initialData.location_installation_context || initialData.stageLocation || '');
      setApplicationsOperatingContext(initialData.applications_operating_context || '');
      setInterfacesSystemConnections(initialData.interfaces_system_connections || '');
      setIdentificationVerificationGuidance(initialData.identification_verification_guidance || '');
      setSafetyLimitations(initialData.safety_limitations || '');
      setTechnicalReferenceGuidance(initialData.technical_reference_guidance || '');

      // Image selection
      if (initialData.image_storage_path) {
        setImageSourceMode('upload');
        setUploadedImageData(initialData.image_storage_path);
        setImageUrl('');
      } else if (initialData.image_url || initialData.imageUrl) {
        setImageSourceMode('url');
        setImageUrl(initialData.image_url || initialData.imageUrl || '');
        setUploadedImageData(null);
      } else {
        setImageSourceMode('url');
        setImageUrl('');
        setUploadedImageData(null);
      }

      setImageTitle(initialData.image_title || '');
      setImageCaption(initialData.image_caption || '');
      setImageAltText(initialData.image_alt_text || '');
      setImageSource(initialData.image_source || '');
      setImageSourceUrl(initialData.image_source_url || '');
      setImageVerificationStatus(initialData.image_verification_status || 'Verified');
      setImageVerifiedAt(initialData.image_verified_at || new Date().toISOString().slice(0, 10));

      setReviewDate(initialData.review_date || new Date().toISOString().slice(0, 10));
      setFeatured(initialData.featured ?? false);
      setIsDirty(false);
    } else {
      // New Entry Defaults
      const autoNum = ComponentService.getNextEntryNumber();
      setEntryNumber(autoNum);
      setComponentName('');
      setCategory('Airframe, structures & flight controls');
      setIsCustomCat(false);
      setCustomCategory('');
      setCatalogId('');
      setCatalogIdManualEdit(false);

      setDefinitionDescription('');
      setPurposeEngineeringValue('');
      setOperatingPrinciple('');
      setLocationInstallationContext('');
      setApplicationsOperatingContext('');
      setInterfacesSystemConnections('');
      setIdentificationVerificationGuidance('');
      setSafetyLimitations('');
      setTechnicalReferenceGuidance('');

      setImageSourceMode('url');
      setUploadedImageData(null);
      setImageUrl('https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80');
      setImageTitle('');
      setImageCaption('');
      setImageAltText('');
      setImageSource('Aerospace Technical Archive');
      setImageSourceUrl('');
      setImageVerificationStatus('Verified');
      setImageVerifiedAt(new Date().toISOString().slice(0, 10));

      setReviewDate(new Date().toISOString().slice(0, 10));
      setFeatured(false);
      setIsDirty(false);
    }
    setSelectedImageFile(null);
    setIsUploadingImage(false);
    setErrors({});
    setUrlImageError(false);
    setUploadError(null);
  }, [isOpen, initialData]);

  // Auto-generate suggested catalog ID if user hasn't manually overridden it
  const handleComponentNameChange = (val: string) => {
    setComponentName(val);
    setIsDirty(true);
    if (!catalogIdManualEdit) {
      const suggested = ComponentService.suggestCatalogId(val);
      setCatalogId(suggested);
    }
  };

  const handleCatalogIdChange = (val: string) => {
    setCatalogId(val.toLowerCase());
    setCatalogIdManualEdit(true);
    setIsDirty(true);
  };

  // File Upload Handler (Option A)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid format. Accepted formats: JPG, JPEG, PNG, WebP.');
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File exceeds 10MB limit. Please upload a smaller image.');
      return;
    }

    setSelectedImageFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedImageData(reader.result);
        setImageSourceMode('upload');
        setIsDirty(true);
        if (!imageTitle) {
          setImageTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file from device.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveUploadedImage = () => {
    setUploadedImageData(null);
    setSelectedImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsDirty(true);
  };

  // Determine active preview image based on active source mode
  const currentActiveImage = imageSourceMode === 'upload' ? uploadedImageData : imageUrl;

  // Real-time preview object representation
  const liveEntryData: Partial<RocketComponent> = {
    entry_number: entryNumber,
    component_name: componentName || 'Fuselage',
    category: isCustomCat ? customCategory || 'Custom Category' : category,
    catalog_id: catalogId || 'fuselage',
    definition_description: definitionDescription,
    purpose_engineering_value: purposeEngineeringValue,
    operating_principle: operatingPrinciple,
    location_installation_context: locationInstallationContext,
    applications_operating_context: applicationsOperatingContext,
    interfaces_system_connections: interfacesSystemConnections,
    identification_verification_guidance: identificationVerificationGuidance,
    safety_limitations: safetyLimitations,
    technical_reference_guidance: technicalReferenceGuidance,
    image_storage_path: imageSourceMode === 'upload' ? uploadedImageData : null,
    image_url: imageSourceMode === 'url' ? imageUrl : null,
    image_title: imageTitle,
    image_caption: imageCaption,
    image_alt_text: imageAltText,
    image_source: imageSource,
    image_source_url: imageSourceUrl,
    image_verification_status: imageVerificationStatus,
    image_verified_at: imageVerifiedAt,
    status: initialData?.status || 'draft',
    review_date: reviewDate,
    featured: featured
  };

  // Validation
  const validateForm = (targetStatus: EntryStatus): boolean => {
    const newErrors: Record<string, string> = {};

    if (!componentName.trim()) {
      newErrors.component_name = 'Component Name is required.';
    }

    if (!catalogId.trim()) {
      newErrors.catalog_id = 'Catalog ID is required.';
    } else {
      const isUnique = ComponentService.isCatalogIdUnique(catalogId.trim(), initialData?.id);
      if (!isUnique) {
        newErrors.catalog_id = `Catalog ID "${catalogId.trim()}" is already in use by another entry.`;
      }
    }

    const effectiveCategory = isCustomCat ? customCategory.trim() : category;
    if (!effectiveCategory) {
      newErrors.category = 'Category is required.';
    }

    // If publishing, ensure key core definitions are provided
    if (targetStatus === 'published') {
      if (!definitionDescription.trim()) {
        newErrors.definition_description = 'Definition and description is required before publishing.';
      }
      if (!purposeEngineeringValue.trim()) {
        newErrors.purpose_engineering_value = 'Purpose and engineering value is required before publishing.';
      }
      if (!operatingPrinciple.trim()) {
        newErrors.operating_principle = 'Operating principle is required before publishing.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save handler (Draft vs Published)
  const handleSave = async (targetStatus: EntryStatus) => {
    if (!validateForm(targetStatus)) {
      return;
    }

    let finalStoredPath = initialData?.image_storage_path || null;
    let finalImageUrl = imageSourceMode === 'url' ? imageUrl.trim() : (initialData?.image_url || null);

    if (imageSourceMode === 'upload') {
      if (selectedImageFile) {
        setIsUploadingImage(true);
        try {
          const uploadRes = await StorageService.uploadComponentImage(selectedImageFile, catalogId || entryNumber);
          if (uploadRes.success) {
            finalStoredPath = uploadRes.storagePath || null;
            finalImageUrl = uploadRes.publicUrl || uploadedImageData;
          } else {
            finalStoredPath = uploadedImageData;
            finalImageUrl = uploadedImageData;
          }
        } catch {
          finalStoredPath = uploadedImageData;
          finalImageUrl = uploadedImageData;
        } finally {
          setIsUploadingImage(false);
        }
      } else {
        finalStoredPath = uploadedImageData;
        finalImageUrl = uploadedImageData;
      }
    }

    const effectiveCategory = isCustomCat ? customCategory.trim() : category;

    await onSave({
      entry_number: entryNumber.trim() || '001',
      component_name: componentName.trim(),
      category: effectiveCategory,
      catalog_id: catalogId.trim().toLowerCase(),
      definition_description: definitionDescription.trim(),
      purpose_engineering_value: purposeEngineeringValue.trim(),
      operating_principle: operatingPrinciple.trim(),
      location_installation_context: locationInstallationContext.trim(),
      applications_operating_context: applicationsOperatingContext.trim(),
      interfaces_system_connections: interfacesSystemConnections.trim(),
      identification_verification_guidance: identificationVerificationGuidance.trim(),
      safety_limitations: safetyLimitations.trim(),
      technical_reference_guidance: technicalReferenceGuidance.trim(),
      image_storage_path: finalStoredPath,
      image_url: finalImageUrl,
      image_title: imageTitle.trim() || undefined,
      image_caption: imageCaption.trim() || undefined,
      image_alt_text: imageAltText.trim() || undefined,
      image_source: imageSource.trim() || undefined,
      image_source_url: imageSourceUrl.trim() || undefined,
      image_verification_status: imageVerificationStatus,
      image_verified_at: imageVerifiedAt || undefined,
      status: targetStatus,
      review_date: reviewDate || undefined,
      featured: featured
    });

    setIsDirty(false);
    onClose();
  };

  // Safe Exit Handling
  const handleAttemptClose = () => {
    if (isDirty) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="w-full max-w-7xl my-4 sm:my-8 bg-white border border-zinc-300 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        role="dialog"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-zinc-50 shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-white font-mono text-xs uppercase tracking-widest bg-black px-2 py-0.5 rounded font-bold">
                {isEditing ? 'EDIT ENTRY' : 'NEW ENCYCLOPEDIA ENTRY'}
              </span>
              <span className="font-mono text-xs text-zinc-500">
                Aerospace Science & Engineering Taxonomy
              </span>
            </div>
            <div className="flex items-center space-x-3 mt-1 flex-wrap gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-black">
                {isEditing ? `Edit: ${initialData?.component_name || initialData?.name}` : 'Add Encyclopedia Entry'}
              </h2>
              {/* Header Quick Toggle Badge */}
              <button
                type="button"
                onClick={() => {
                  setFeatured(!featured);
                  setIsDirty(true);
                }}
                className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border transition-colors cursor-pointer ${
                  featured
                    ? 'bg-black text-white border-black shadow-xs'
                    : 'bg-white text-zinc-600 border-zinc-300 hover:border-black hover:text-black'
                }`}
                title="Toggle Featured on Homepage"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{featured ? '★ FEATURED ON HOME' : '☆ NOT FEATURED'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Mobile View Toggle */}
            <div className="lg:hidden flex items-center border border-zinc-300 rounded-lg overflow-hidden bg-white text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`px-3 py-1.5 font-semibold ${activeTab === 'form' ? 'bg-black text-white' : 'text-zinc-600'}`}
              >
                Form
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 font-semibold ${activeTab === 'preview' ? 'bg-black text-white' : 'text-zinc-600'}`}
              >
                Live Preview
              </button>
            </div>

            <button
              onClick={handleAttemptClose}
              className="text-zinc-500 hover:text-black p-2 rounded-lg hover:bg-zinc-200 transition-colors"
              title="Close form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Error Notice if any */}
        {Object.keys(errors).length > 0 && (
          <div className="mx-6 mt-4 p-3 bg-zinc-100 border border-black rounded-lg text-xs font-mono text-black flex items-center space-x-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Please review highlighted fields before proceeding: {Object.values(errors)[0]}</span>
          </div>
        )}

        {/* Two-Column Body: Form on Left, Live Preview on Right */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200">
          {/* Left Column: Structured Form (7 Cols on wide screens) */}
          <div className={`lg:col-span-7 overflow-y-auto p-6 space-y-8 bg-white ${activeTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
            
            {/* TOP POSITION: Homepage Presentation Featured Highlights Toggle */}
            <div className={`p-4 rounded-xl border-2 transition-all ${
              featured 
                ? 'bg-zinc-950 text-white border-black shadow-md' 
                : 'bg-zinc-50 text-black border-zinc-300 hover:border-zinc-400'
            }`}>
              <label htmlFor="top-featured-checkbox" className="flex items-center justify-between cursor-pointer gap-4">
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                    featured ? 'bg-white text-black border-white' : 'bg-white text-zinc-400 border-zinc-200'
                  }`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="font-mono text-sm font-bold uppercase tracking-tight">
                        Feature on Homepage Highlights
                      </span>
                      {featured ? (
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-white text-black rounded">
                          ★ Featured Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-mono text-zinc-500 uppercase tracking-wider bg-zinc-200/80 rounded">
                          Standard Catalog
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 ${featured ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      Showcase this flight hardware component in the curated highlights on the AERION homepage.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <input
                    type="checkbox"
                    id="top-featured-checkbox"
                    checked={featured}
                    onChange={(e) => {
                      setFeatured(e.target.checked);
                      setIsDirty(true);
                    }}
                    className="h-5 w-5 rounded border-2 border-zinc-400 text-black focus:ring-black accent-black cursor-pointer"
                  />
                  <span className="font-mono text-xs font-bold uppercase hidden sm:inline">
                    {featured ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </label>
            </div>

            {/* Section 1: Basic Information */}
            <section className="space-y-4">
              <div className="border-b border-zinc-200 pb-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-black" />
                  <span>01 / Basic Information & Catalog Identification</span>
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Universal taxonomic identifiers and sequential catalog registers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Entry Number */}
                <div className="space-y-1">
                  <label className="block font-mono text-[11px] text-zinc-700 font-semibold">
                    Entry Number <span className="text-zinc-400 font-normal">(Auto-generated)</span>
                  </label>
                  <input
                    type="text"
                    value={entryNumber}
                    onChange={(e) => {
                      setEntryNumber(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="001"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-black font-mono text-xs focus:outline-none focus:border-black"
                  />
                </div>

                {/* Component Name */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="block font-mono text-[11px] text-zinc-700 font-semibold">
                    Component Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={componentName}
                    onChange={(e) => handleComponentNameChange(e.target.value)}
                    placeholder="e.g. Fuselage or Wing"
                    className={`w-full px-3 py-2 bg-white border rounded-lg text-black text-xs font-medium focus:outline-none focus:border-black ${
                      errors.component_name ? 'border-red-600' : 'border-zinc-300'
                    }`}
                  />
                  {errors.component_name && (
                    <span className="text-[10px] text-red-600 font-mono block">{errors.component_name}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Selection */}
                <div className="space-y-1">
                  <label className="block font-mono text-[11px] text-zinc-700 font-semibold">
                    Category <span className="text-red-600">*</span>
                  </label>
                  {!isCustomCat ? (
                    <select
                      value={category}
                      onChange={(e) => {
                        if (e.target.value === 'Other') {
                          setIsCustomCat(true);
                        } else {
                          setCategory(e.target.value);
                        }
                        setIsDirty(true);
                      }}
                      className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-black font-mono text-xs focus:outline-none focus:border-black"
                    >
                      {DEFAULT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="Other">+ Enter Custom Category...</option>
                    </select>
                  ) : (
                    <div className="flex items-center space-x-1.5">
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => {
                          setCustomCategory(e.target.value);
                          setIsDirty(true);
                        }}
                        placeholder="e.g. Aerothermodynamics & Hypersonics"
                        className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-black font-mono text-xs focus:outline-none focus:border-black"
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomCat(false)}
                        className="p-2 text-xs font-mono text-zinc-500 hover:text-black border border-zinc-300 rounded-lg"
                        title="Back to list"
                      >
                        Reset
                      </button>
                    </div>
                  )}
                  {errors.category && (
                    <span className="text-[10px] text-red-600 font-mono block">{errors.category}</span>
                  )}
                </div>

                {/* Catalog ID */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block font-mono text-[11px] text-zinc-700 font-semibold">
                      Catalog ID <span className="text-red-600">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-zinc-400">Unique lowercase ID</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={catalogId}
                    onChange={(e) => handleCatalogIdChange(e.target.value)}
                    placeholder="e.g. fuselage"
                    className={`w-full px-3 py-2 bg-white border rounded-lg text-black font-mono text-xs focus:outline-none focus:border-black ${
                      errors.catalog_id ? 'border-red-600' : 'border-zinc-300'
                    }`}
                  />
                  {errors.catalog_id && (
                    <span className="text-[10px] text-red-600 font-mono block">{errors.catalog_id}</span>
                  )}
                </div>
              </div>
            </section>

            {/* Section 2: Technical Definitions & Engineering Principles */}
            <section className="space-y-4">
              <div className="border-b border-zinc-200 pb-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-black" />
                  <span>02 / Definition, Purpose & Operating Principles</span>
                </h3>
              </div>

              {/* Definition and description */}
              <div className="space-y-1">
                <label className="block font-mono text-[11px] text-zinc-700 font-semibold">
                  Definition and description <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={definitionDescription}
                  onChange={(e) => {
                    setDefinitionDescription(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Primary body shell that carries crew, passengers, payload, and systems..."
                  className={`w-full px-3 py-2 bg-white border rounded-lg text-black text-xs leading-relaxed focus:outline-none focus:border-black ${
                    errors.definition_description ? 'border-red-600' : 'border-zinc-300'
                  }`}
                />
              </div>

              {/* Purpose and engineering value */}
              <div className="space-y-1">
                <label className="block font-mono text-[11px] text-zinc-700 font-semibold">
                  Purpose and engineering value <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={purposeEngineeringValue}
                  onChange={(e) => {
                    setPurposeEngineeringValue(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Provides the main load path and encloses equipment..."
                  className={`w-full px-3 py-2 bg-white border rounded-lg text-black text-xs leading-relaxed focus:outline-none focus:border-black ${
                    errors.purpose_engineering_value ? 'border-red-600' : 'border-zinc-300'
                  }`}
                />
              </div>

              {/* Operating principle — how it works */}
              <div className="space-y-1">
                <label className="block font-mono text-[11px] text-zinc-700 font-semibold">
                  Operating principle — how it works <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={operatingPrinciple}
                  onChange={(e) => {
                    setOperatingPrinciple(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Skin, frames, stringers, and bulkheads share bending, shear, pressure, and torsion loads..."
                  className={`w-full px-3 py-2 bg-white border rounded-lg text-black text-xs leading-relaxed focus:outline-none focus:border-black ${
                    errors.operating_principle ? 'border-red-600' : 'border-zinc-300'
                  }`}
                />
              </div>
            </section>

            {/* Section 3: Context, Applications & Interfaces */}
            <section className="space-y-4">
              <div className="border-b border-zinc-200 pb-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-black" />
                  <span>03 / Location, Applications & System Interfaces</span>
                </h3>
              </div>

              {/* Location and installation context */}
              <div className="space-y-1">
                <label className="block font-mono text-[11px] text-zinc-700 font-semibold">
                  Location and installation context
                </label>
                <textarea
                  rows={2}
                  value={locationInstallationContext}
                  onChange={(e) => {
                    setLocationInstallationContext(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Aircraft center body from nose to tail..."
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-black text-xs leading-relaxed focus:outline-none focus:border-black"
                />
              </div>

              {/* Applications and operating context */}
              <div className="space-y-1">
                <label className="block font-mono text-[11px] text-zinc-700 font-semibold">
                  Applications and operating context
                </label>
                <textarea
                  rows={2}
                  value={applicationsOperatingContext}
                  onChange={(e) => {
                    setApplicationsOperatingContext(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Operational flight envelopes, vehicle classes, altitude regimes..."
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-black text-xs leading-relaxed focus:outline-none focus:border-black"
                />
              </div>

              {/* Interfaces and system connections */}
              <div className="space-y-1">
                <label className="block font-mono text-[11px] text-zinc-700 font-semibold">
                  Interfaces and system connections
                </label>
                <textarea
                  rows={2}
                  value={interfacesSystemConnections}
                  onChange={(e) => {
                    setInterfacesSystemConnections(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Structural attachments, electrical harnesses, hydraulic feeds..."
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-black text-xs leading-relaxed focus:outline-none focus:border-black"
                />
              </div>
            </section>

            {/* Section 4: Verification, Safety & Standards */}
            <section className="space-y-4">
              <div className="border-b border-zinc-200 pb-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>04 / Verification, Safety & Technical Reference</span>
                </h3>
              </div>

              {/* Identification and verification guidance */}
              <div className="space-y-1">
                <label className="block font-mono text-[11px] text-zinc-700 font-semibold">
                  Identification and verification guidance
                </label>
                <textarea
                  rows={2}
                  value={identificationVerificationGuidance}
                  onChange={(e) => {
                    setIdentificationVerificationGuidance(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Part numbers, eddy current inspections, ultrasonic testing methods..."
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-black text-xs leading-relaxed focus:outline-none focus:border-black"
                />
              </div>

              {/* Safety and limitations */}
              <div className="space-y-1">
                <label className="block font-mono text-[11px] text-zinc-700 font-semibold">
                  Safety and limitations
                </label>
                <textarea
                  rows={2}
                  value={safetyLimitations}
                  onChange={(e) => {
                    setSafetyLimitations(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Fatigue life limits, maximum differential cabin pressure, dynamic limits..."
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-black text-xs leading-relaxed focus:outline-none focus:border-black"
                />
              </div>

              {/* Technical reference guidance */}
              <div className="space-y-1">
                <label className="block font-mono text-[11px] text-zinc-700 font-semibold">
                  Technical reference guidance
                </label>
                <textarea
                  rows={2}
                  value={technicalReferenceGuidance}
                  onChange={(e) => {
                    setTechnicalReferenceGuidance(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="FAA Handbooks, AIAA design manuals, NASA Technical Reports..."
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-black text-xs leading-relaxed focus:outline-none focus:border-black"
                />
              </div>
            </section>

            {/* Section 5: Image Upload and Image Link */}
            <section className="space-y-4">
              <div className="border-b border-zinc-200 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4 text-black" />
                    <span>05 / Visual Hardware Documentation</span>
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Attach reference imagery via local device upload or external URL.
                  </p>
                </div>

                {/* Source Selection Toggle */}
                <div className="inline-flex rounded-lg border border-zinc-300 p-0.5 bg-zinc-100 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setImageSourceMode('upload');
                      setIsDirty(true);
                    }}
                    className={`px-3 py-1 rounded-md transition-colors flex items-center space-x-1 font-semibold ${
                      imageSourceMode === 'upload' ? 'bg-black text-white shadow-xs' : 'text-zinc-600 hover:text-black'
                    }`}
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageSourceMode('url');
                      setIsDirty(true);
                    }}
                    className={`px-3 py-1 rounded-md transition-colors flex items-center space-x-1 font-semibold ${
                      imageSourceMode === 'url' ? 'bg-black text-white shadow-xs' : 'text-zinc-600 hover:text-black'
                    }`}
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>Image URL</span>
                  </button>
                </div>
              </div>

              {/* Option A: Upload from Device */}
              {imageSourceMode === 'upload' && (
                <div className="p-4 bg-zinc-50 border border-zinc-300 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-black uppercase">
                      Option A: Device Image Upload
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      JPG, JPEG, PNG, WebP (max 10MB)
                    </span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {uploadedImageData ? (
                    <div className="space-y-3">
                      <div className="relative w-full h-44 rounded-lg overflow-hidden border border-zinc-300 bg-zinc-100 flex items-center justify-center">
                        <img
                          src={uploadedImageData}
                          alt="Uploaded hardware preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-emerald-700 flex items-center space-x-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Image loaded into persistent storage</span>
                        </span>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1 text-xs font-mono bg-white border border-zinc-300 rounded hover:bg-zinc-100 text-black font-semibold"
                          >
                            Replace Image
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveUploadedImage}
                            className="px-2.5 py-1 text-xs font-mono bg-white border border-red-300 rounded hover:bg-red-50 text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-zinc-300 hover:border-black rounded-lg p-6 text-center cursor-pointer transition-colors bg-white space-y-2"
                    >
                      <Upload className="w-8 h-8 mx-auto text-zinc-400" />
                      <div className="text-xs font-bold text-black font-mono">
                        Click to select an image from your computer
                      </div>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        Supports standard aerospace imagery in JPG, PNG, or WebP.
                      </p>
                    </div>
                  )}

                  {uploadError && (
                    <div className="text-xs font-mono text-red-600 bg-red-50 p-2 rounded border border-red-200">
                      {uploadError}
                    </div>
                  )}
                </div>
              )}

              {/* Option B: Image URL */}
              {imageSourceMode === 'url' && (
                <div className="p-4 bg-zinc-50 border border-zinc-300 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-black uppercase">
                      Option B: Direct Image URL
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      Hosted HTTPS Link
                    </span>
                  </div>

                  <div className="space-y-1">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setUrlImageError(false);
                        setIsDirty(true);
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-black font-mono text-xs focus:outline-none focus:border-black"
                    />
                  </div>

                  {imageUrl && (
                    <div className="space-y-2">
                      <div className="relative w-full h-44 rounded-lg overflow-hidden border border-zinc-300 bg-zinc-100 flex items-center justify-center">
                        <img
                          src={imageUrl}
                          alt="External URL preview"
                          className="w-full h-full object-cover"
                          onError={() => setUrlImageError(true)}
                          onLoad={() => setUrlImageError(false)}
                        />
                      </div>
                      {urlImageError ? (
                        <div className="text-xs font-mono text-red-600 bg-red-50 p-2 rounded border border-red-200">
                          Error: The provided URL could not be loaded as an image. Please verify the link.
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-emerald-700 flex items-center space-x-1 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Valid external image verified</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setImageUrl('');
                              setIsDirty(true);
                            }}
                            className="text-xs font-mono text-zinc-500 hover:text-red-600"
                          >
                            Clear URL
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Optional Image Metadata */}
              <div className="pt-2 space-y-3">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-700 block">
                  Image Metadata & Attribution (Optional)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-mono text-[10px] text-zinc-600">Image Title</label>
                    <input
                      type="text"
                      value={imageTitle}
                      onChange={(e) => {
                        setImageTitle(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="e.g. Semi-monocoque Airframe Section"
                      className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 rounded text-xs text-black"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-mono text-[10px] text-zinc-600">Alt Text (Accessibility)</label>
                    <input
                      type="text"
                      value={imageAltText}
                      onChange={(e) => {
                        setImageAltText(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="e.g. Aluminum-lithium aircraft fuselage barrel"
                      className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 rounded text-xs text-black"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-mono text-[10px] text-zinc-600">Image Caption</label>
                  <input
                    type="text"
                    value={imageCaption}
                    onChange={(e) => {
                      setImageCaption(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="e.g. Ring frames and longitudinal stringers visible during fuselage assembly"
                    className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 rounded text-xs text-black"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-mono text-[10px] text-zinc-600">Source / Attribution</label>
                    <input
                      type="text"
                      value={imageSource}
                      onChange={(e) => {
                        setImageSource(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="e.g. NASA Langley Research Center"
                      className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 rounded text-xs text-black"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-mono text-[10px] text-zinc-600">Source Website / Reference URL</label>
                    <input
                      type="url"
                      value={imageSourceUrl}
                      onChange={(e) => {
                        setImageSourceUrl(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="https://..."
                      className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 rounded text-xs text-black font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-mono text-[10px] text-zinc-600">Verification Status</label>
                    <select
                      value={imageVerificationStatus}
                      onChange={(e) => {
                        setImageVerificationStatus(e.target.value as VerificationStatus);
                        setIsDirty(true);
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 rounded text-xs text-black font-mono"
                    >
                      <option value="Verified">Verified</option>
                      <option value="Unverified">Unverified</option>
                      <option value="Pending Review">Pending Review</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-mono text-[10px] text-zinc-600">Date Verified</label>
                    <input
                      type="date"
                      value={imageVerifiedAt}
                      onChange={(e) => {
                        setImageVerifiedAt(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 rounded text-xs text-black font-mono"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6: Administrative Review Date & Presentation Controls */}
            <section className="space-y-4 pt-2">
              <div className="border-b border-zinc-200 pb-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-black" />
                  <span>06 / Review & Publishing Controls</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-mono text-[11px] text-zinc-700 font-semibold">
                    Scheduled / Latest Review Date
                  </label>
                  <input
                    type="date"
                    value={reviewDate}
                    onChange={(e) => {
                      setReviewDate(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-black font-mono text-xs focus:outline-none focus:border-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-mono text-[11px] text-zinc-700 font-semibold">
                    Homepage Presentation <span className="text-zinc-500 font-normal">(Synced with top)</span>
                  </label>
                  <label className="flex items-center space-x-3 p-2.5 rounded-lg border border-zinc-300 bg-zinc-50 hover:bg-zinc-100 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => {
                        setFeatured(e.target.checked);
                        setIsDirty(true);
                      }}
                      className="h-4 w-4 rounded border-zinc-300 text-black focus:ring-black accent-black"
                    />
                    <div className="space-y-0.5">
                      <span className="block font-mono text-xs font-bold text-black flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-black" />
                        <span>Feature on Homepage Highlights</span>
                      </span>
                      <span className="block text-[10px] text-zinc-600 font-mono">
                        {featured ? '★ Active on Homepage (Enabled)' : 'Standard catalog listing (Disabled)'}
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Real-Time Live Preview (5 Cols on wide screens) */}
          <div className={`lg:col-span-5 overflow-y-auto p-6 bg-zinc-50 space-y-4 ${activeTab === 'form' ? 'hidden lg:block' : 'block'}`}>
            <div className="sticky top-0 bg-zinc-50 pb-2 flex items-center justify-between border-b border-zinc-200">
              <span className="font-mono text-xs uppercase font-bold text-black flex items-center space-x-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>Published Format Preview</span>
              </span>
              <span className="font-mono text-[10px] text-zinc-500">
                Updates in real-time
              </span>
            </div>

            <EncyclopediaLivePreview 
              data={liveEntryData}
              activeImageSource={currentActiveImage}
            />
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleAttemptClose}
              className="px-4 py-2 rounded-lg text-xs font-mono font-semibold text-black bg-white hover:bg-zinc-100 border border-zinc-300 transition-colors"
            >
              Cancel
            </button>
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (initialData?.id) {
                    onDelete(initialData.id);
                  }
                }}
                className="px-3 py-2 rounded-lg text-xs font-mono font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-colors flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Entry</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              disabled={isUploadingImage}
              onClick={() => handleSave('draft')}
              className="px-4 py-2 rounded-lg text-xs font-mono font-semibold text-zinc-900 bg-zinc-200 hover:bg-zinc-300 disabled:opacity-50 transition-colors"
            >
              Save Draft
            </button>
            <button
              type="button"
              disabled={isUploadingImage}
              onClick={() => handleSave('published')}
              className="px-5 py-2 rounded-lg text-xs font-mono font-bold text-white bg-black hover:bg-zinc-800 disabled:opacity-50 transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              {isUploadingImage ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Uploading & Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? 'Save & Publish Updates' : 'Publish Entry'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Accidental Data Loss Prompt */}
        {showExitConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white border border-zinc-300 rounded-xl p-5 max-w-sm w-full space-y-3 shadow-xl">
              <h3 className="font-bold text-black text-sm">Discard Unsaved Changes?</h3>
              <p className="text-xs text-zinc-600">
                You have unsaved edits in this encyclopedia form. Closing now will discard your modifications.
              </p>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(false)}
                  className="px-3 py-1.5 text-xs font-mono font-semibold bg-zinc-100 hover:bg-zinc-200 text-black rounded"
                >
                  Keep Editing
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExitConfirm(false);
                    onClose();
                  }}
                  className="px-3 py-1.5 text-xs font-mono font-semibold bg-red-600 hover:bg-red-700 text-white rounded"
                >
                  Discard Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
