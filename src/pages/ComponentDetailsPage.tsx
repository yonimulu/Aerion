import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ExternalLink, Play, CheckCircle2, ShieldCheck, Layers, 
  Info, Video, BookOpen, Share2, Check, FileText, 
  ShieldAlert, Compass
} from 'lucide-react';
import { RocketComponent } from '../types/rocket';
import { getCategoryBadgeStyle } from '../components/ComponentCard';
import { StorageService } from '../services/storageService';

interface ComponentDetailsPageProps {
  component: RocketComponent;
  onBack: () => void;
  onSelectRelated?: (id: string) => void;
  allComponents?: RocketComponent[];
}

export const ComponentDetailsPage: React.FC<ComponentDetailsPageProps> = ({
  component,
  onBack,
  onSelectRelated,
  allComponents = []
}) => {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [triedSigned, setTriedSigned] = useState(false);
  const [displayImage, setDisplayImage] = useState<string>(() => StorageService.resolveComponentImageUrl(component));
  const badge = getCategoryBadgeStyle(component.category);
  const CategoryIcon = badge.icon;

  useEffect(() => {
    setDisplayImage(StorageService.resolveComponentImageUrl(component));
    setImageError(false);
    setTriedSigned(false);
  }, [component.id, component.image_url, component.image_storage_path, component.imageUrl]);

  const handleImageError = async () => {
    if (!triedSigned && component.image_storage_path && !component.image_storage_path.startsWith('data:')) {
      setTriedSigned(true);
      const signed = await StorageService.getSignedUrl(component.image_storage_path);
      if (signed) {
        setDisplayImage(signed);
        return;
      }
    }
    setImageError(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const youtubeEmbedUrl = getYouTubeEmbedUrl(component.videoUrl);

  const relatedComponents = allComponents
    .filter((c) => c.category === component.category && c.id !== component.id)
    .slice(0, 3);

  const compName = component.component_name || component.name;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 bg-white dark:bg-black transition-colors duration-200">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs font-mono font-semibold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalog</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center space-x-1.5 text-xs font-mono text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white bg-white dark:bg-zinc-900 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 transition-colors shadow-xs"
            title="Share Component URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-black dark:text-white" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Subsystem Category Tag */}
          <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-mono font-medium border ${badge.bg}`}>
            <CategoryIcon className="w-3.5 h-3.5" />
            <span>{component.category}</span>
          </span>

          {component.featured && (
            <span className="font-mono text-[10px] font-semibold text-white dark:text-black bg-black dark:bg-white px-2 py-0.5 rounded shadow-xs">
              FEATURED
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-black dark:text-white tracking-tight leading-tight">
          {compName}
        </h1>

        <p className="text-base sm:text-lg text-zinc-700 dark:text-zinc-300 max-w-4xl leading-relaxed">
          {component.definition_description || component.shortDescription || component.overview}
        </p>
      </div>

      {/* Large Technical Reference Image */}
      {displayImage && (
        <div className="relative w-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 shadow-sm">
          <div className="aspect-w-16 aspect-h-9 max-h-[520px] w-full flex items-center justify-center overflow-hidden">
            {!imageError ? (
              <img
                src={displayImage}
                alt={component.image_alt_text || compName}
                onError={handleImageError}
                className="w-full h-full object-cover max-h-[520px]"
              />
            ) : (
              <div className="w-full h-80 flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 font-mono text-sm p-8 text-center">
                <CategoryIcon className="w-12 h-12 mb-2 text-zinc-400 dark:text-zinc-500" />
                <span>[Aerospace Engineering Reference Visual]</span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{displayImage}</span>
              </div>
            )}
          </div>

          {/* Technical image footer overlay */}
          <div className="bg-white/95 dark:bg-zinc-950/95 border-t border-zinc-200 dark:border-zinc-800 px-4 py-2.5 flex flex-wrap items-center justify-between text-[11px] font-mono text-zinc-600 dark:text-zinc-400 gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white"></span>
              <span>{component.image_title || 'Flight Hardware Photographic Reference'}</span>
              {component.image_verification_status && (
                <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-800 dark:text-zinc-200 font-semibold border border-zinc-300 dark:border-zinc-700">
                  {component.image_verification_status}
                </span>
              )}
            </div>
            {component.image_source && !/wikimedia|commons/i.test(component.image_source) && (
              <span>Source: <span className="text-zinc-950 dark:text-white font-semibold">{component.image_source}</span></span>
            )}
          </div>
        </div>
      )}

      {/* Main Content Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): All Comprehensive Sections */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section: Overview */}
          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 sm:p-7 space-y-2.5 shadow-xs">
            <div className="flex items-center space-x-2 text-black dark:text-white font-mono text-xs uppercase tracking-wider font-bold">
              <FileText className="w-4 h-4" />
              <span>Overview</span>
            </div>
            <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
              {component.definition_description || component.overview}
            </p>
          </section>

          {/* Section: Purpose */}
          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 sm:p-7 space-y-2.5 shadow-xs">
            <div className="flex items-center space-x-2 text-black dark:text-white font-mono text-xs uppercase tracking-wider font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Purpose & Role</span>
            </div>
            <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
              {component.purpose_engineering_value || component.purpose}
            </p>
          </section>

          {/* Section: Operating principle */}
          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 sm:p-7 space-y-2.5 shadow-xs">
            <div className="flex items-center space-x-2 text-black dark:text-white font-mono text-xs uppercase tracking-wider font-bold">
              <Info className="w-4 h-4" />
              <span>Operating Principle</span>
            </div>
            <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
              {component.operating_principle || component.operatingPrinciples}
            </p>
          </section>

          {/* Section: Location and installation context */}
          {(component.location_installation_context || component.stageLocation) && (
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 sm:p-7 space-y-2.5 shadow-xs">
              <div className="flex items-center space-x-2 text-black dark:text-white font-mono text-xs uppercase tracking-wider font-bold">
                <Compass className="w-4 h-4" />
                <span>Installation Context</span>
              </div>
              <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                {component.location_installation_context || component.stageLocation}
              </p>
            </section>
          )}

          {/* Section: Applications and operating context */}
          {component.applications_operating_context && (
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 sm:p-7 space-y-2.5 shadow-xs">
              <div className="flex items-center space-x-2 text-black dark:text-white font-mono text-xs uppercase tracking-wider font-bold">
                <Layers className="w-4 h-4" />
                <span>Operational Applications</span>
              </div>
              <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                {component.applications_operating_context}
              </p>
            </section>
          )}

          {/* Section: Interfaces and system connections */}
          {component.interfaces_system_connections && (
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 sm:p-7 space-y-2.5 shadow-xs">
              <div className="flex items-center space-x-2 text-black dark:text-white font-mono text-xs uppercase tracking-wider font-bold">
                <FileText className="w-4 h-4" />
                <span>System Interfaces</span>
              </div>
              <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                {component.interfaces_system_connections}
              </p>
            </section>
          )}

          {/* Section: Identification and verification guidance */}
          {component.identification_verification_guidance && (
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 sm:p-7 space-y-2.5 shadow-xs">
              <div className="flex items-center space-x-2 text-black dark:text-white font-mono text-xs uppercase tracking-wider font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verification & Inspection</span>
              </div>
              <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                {component.identification_verification_guidance}
              </p>
            </section>
          )}

          {/* Section: Safety and limitations */}
          {component.safety_limitations && (
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 sm:p-7 space-y-2.5 shadow-xs">
              <div className="flex items-center space-x-2 text-black dark:text-white font-mono text-xs uppercase tracking-wider font-bold">
                <ShieldAlert className="w-4 h-4" />
                <span>Safety & Limits</span>
              </div>
              <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                {component.safety_limitations}
              </p>
            </section>
          )}

          {/* Section: Technical reference guidance */}
          {component.technical_reference_guidance && (
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 sm:p-7 space-y-2.5 shadow-xs">
              <div className="flex items-center space-x-2 text-black dark:text-white font-mono text-xs uppercase tracking-wider font-bold">
                <BookOpen className="w-4 h-4" />
                <span>Technical References</span>
              </div>
              <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                {component.technical_reference_guidance}
              </p>
            </section>
          )}

          {/* Key Insights (if present) */}
          {component.facts && component.facts.length > 0 && (
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 sm:p-7 space-y-4 shadow-xs">
              <div className="flex items-center space-x-2 text-black dark:text-white font-mono text-xs uppercase tracking-wider font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Key Insights</span>
              </div>
              <ul className="space-y-3">
                {component.facts.map((fact, idx) => (
                  <li key={idx} className="flex items-start space-x-3 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white shrink-0 mt-2" />
                    <span className="leading-relaxed">{fact}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Video Resource (if present) */}
          {component.videoUrl && (
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 sm:p-7 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-black dark:text-white font-mono text-xs uppercase tracking-wider font-bold">
                  <Video className="w-4 h-4" />
                  <span>Video Documentation</span>
                </div>
                <a
                  href={component.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center space-x-1"
                >
                  <span>Open Video in New Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {youtubeEmbedUrl ? (
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-950">
                  <iframe
                    src={youtubeEmbedUrl}
                    title={`${compName} Video Footage`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0"
                  />
                </div>
              ) : (
                <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-black dark:text-white">
                      <Play className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-black dark:text-white">External Video</h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate max-w-sm">{component.videoUrl}</p>
                    </div>
                  </div>
                  <a
                    href={component.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-lg bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black font-mono text-xs font-semibold"
                  >
                    Watch Video
                  </a>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Right Column: Technical Specs & References */}
        <div className="space-y-6">

          {/* Specifications Matrix Card (if present) */}
          {component.specifications && Object.keys(component.specifications).length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 shadow-xs">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">
                Technical Specifications
              </h3>
              <dl className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
                {Object.entries(component.specifications).map(([key, value]) => (
                  <div key={key} className="py-2.5 flex flex-col space-y-0.5">
                    <dt className="text-zinc-500 dark:text-zinc-400 font-mono text-[11px] font-medium">{key}</dt>
                    <dd className="text-zinc-950 dark:text-white font-bold">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Reference Links & Papers (if present) */}
          {component.referenceLinks && component.referenceLinks.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-3 shadow-xs">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2 flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Reference Documents</span>
              </h3>
              <ul className="space-y-2 text-xs">
                {component.referenceLinks.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-zinc-600 flex items-start justify-between transition-colors"
                    >
                      <span className="text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white font-medium leading-tight">
                        {link.title}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 group-hover:text-black dark:group-hover:text-white shrink-0 ml-2 mt-0.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Related Components in Same Category */}
          {relatedComponents.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-3 shadow-xs">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">
                Related Components
              </h3>
              <div className="space-y-2.5">
                {relatedComponents.map((rel) => (
                  <button
                    key={rel.id}
                    onClick={() => onSelectRelated && onSelectRelated(rel.id)}
                    className="w-full text-left p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-zinc-600 transition-all flex items-center justify-between group"
                  >
                    <div className="space-y-0.5 max-w-[85%]">
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white truncate">
                        {rel.component_name || rel.name}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 truncate">
                        {rel.category}
                      </div>
                    </div>
                    <ArrowLeft className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 group-hover:text-black dark:group-hover:text-white transform rotate-180" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
