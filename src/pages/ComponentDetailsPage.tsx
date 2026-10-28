import React, { useState } from 'react';
import { 
  ArrowLeft, ExternalLink, Play, CheckCircle2, ShieldCheck, Layers, 
  Info, Video, BookOpen, Share2, Check, AlertTriangle, FileText, 
  ShieldAlert, Compass, Calendar
} from 'lucide-react';
import { RocketComponent } from '../types/rocket';
import { getCategoryBadgeStyle } from '../components/ComponentCard';

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
  const badge = getCategoryBadgeStyle(component.category);
  const CategoryIcon = badge.icon;

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

  const displayImage = component.image_storage_path || component.image_url || component.imageUrl;
  const entryNum = component.entry_number || '001';
  const compName = component.component_name || component.name;
  const catalogId = component.catalog_id || component.designation || 'unassigned';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 bg-white">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs font-mono font-semibold text-black hover:bg-zinc-100 bg-white px-3.5 py-2 rounded-lg border border-zinc-300 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalog</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center space-x-1.5 text-xs font-mono text-zinc-700 hover:text-black bg-white px-3 py-2 rounded-lg border border-zinc-300 transition-colors shadow-xs"
            title="Share Component URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-black" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Entry Number Badge */}
          <span className="font-mono text-xs font-bold text-white bg-black px-2.5 py-1 rounded">
            ENTRY #{entryNum}
          </span>

          {/* Subsystem Category Tag */}
          <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-mono font-medium border ${badge.bg}`}>
            <CategoryIcon className="w-3.5 h-3.5" />
            <span>{component.category}</span>
          </span>

          {/* Catalog ID */}
          <span className="font-mono text-xs text-zinc-800 bg-zinc-100 px-3 py-1 rounded-md border border-zinc-300">
            CATALOG ID: <span className="font-bold lowercase">{catalogId}</span>
          </span>

          {/* Publication Status */}
          <span
            className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
              component.status === 'published'
                ? 'bg-zinc-100 text-black border border-zinc-300'
                : 'bg-zinc-200 text-zinc-700'
            }`}
          >
            {component.status || 'published'}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-black tracking-tight leading-tight">
          {entryNum}. {compName}
        </h1>

        <p className="text-base sm:text-lg text-zinc-700 max-w-4xl leading-relaxed">
          {component.definition_description || component.shortDescription || component.overview}
        </p>
      </div>

      {/* Large Technical Reference Image */}
      {displayImage && (
        <div className="relative w-full rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-300 shadow-sm">
          <div className="aspect-w-16 aspect-h-9 max-h-[520px] w-full flex items-center justify-center overflow-hidden">
            {!imageError ? (
              <img
                src={displayImage}
                alt={component.image_alt_text || compName}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover max-h-[520px]"
              />
            ) : (
              <div className="w-full h-80 flex flex-col items-center justify-center bg-zinc-100 text-zinc-500 font-mono text-sm p-8 text-center">
                <CategoryIcon className="w-12 h-12 mb-2 text-zinc-400" />
                <span>[Aerospace Engineering Reference Visual]</span>
                <span className="text-xs text-zinc-400 mt-1">{displayImage}</span>
              </div>
            )}
          </div>

          {/* Technical image footer overlay */}
          <div className="bg-white/95 border-t border-zinc-200 px-4 py-2.5 flex flex-wrap items-center justify-between text-[11px] font-mono text-zinc-600 gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              <span>{component.image_title || 'Flight Hardware Photographic Reference'}</span>
              {component.image_verification_status && (
                <span className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 font-semibold border border-zinc-300">
                  {component.image_verification_status}
                </span>
              )}
            </div>
            {component.image_source && (
              <span>Source: <span className="text-zinc-950 font-semibold">{component.image_source}</span></span>
            )}
          </div>
        </div>
      )}

      {/* Main Content Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): All Comprehensive Sections */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section: Definition and description */}
          <section className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-7 space-y-2.5 shadow-xs">
            <div className="flex items-center space-x-2 text-black font-mono text-xs uppercase tracking-wider font-bold">
              <FileText className="w-4 h-4" />
              <span>Definition and description</span>
            </div>
            <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-line">
              {component.definition_description || component.overview}
            </p>
          </section>

          {/* Section: Purpose and engineering value */}
          <section className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-7 space-y-2.5 shadow-xs">
            <div className="flex items-center space-x-2 text-black font-mono text-xs uppercase tracking-wider font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Purpose and engineering value</span>
            </div>
            <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-line">
              {component.purpose_engineering_value || component.purpose}
            </p>
          </section>

          {/* Section: Operating principle — how it works */}
          <section className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-7 space-y-2.5 shadow-xs">
            <div className="flex items-center space-x-2 text-black font-mono text-xs uppercase tracking-wider font-bold">
              <Info className="w-4 h-4" />
              <span>Operating principle — how it works</span>
            </div>
            <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-line">
              {component.operating_principle || component.operatingPrinciples}
            </p>
          </section>

          {/* Section: Location and installation context */}
          {(component.location_installation_context || component.stageLocation) && (
            <section className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-7 space-y-2.5 shadow-xs">
              <div className="flex items-center space-x-2 text-black font-mono text-xs uppercase tracking-wider font-bold">
                <Compass className="w-4 h-4" />
                <span>Location and installation context</span>
              </div>
              <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-line">
                {component.location_installation_context || component.stageLocation}
              </p>
            </section>
          )}

          {/* Section: Applications and operating context */}
          {component.applications_operating_context && (
            <section className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-7 space-y-2.5 shadow-xs">
              <div className="flex items-center space-x-2 text-black font-mono text-xs uppercase tracking-wider font-bold">
                <Layers className="w-4 h-4" />
                <span>Applications and operating context</span>
              </div>
              <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-line">
                {component.applications_operating_context}
              </p>
            </section>
          )}

          {/* Section: Interfaces and system connections */}
          {component.interfaces_system_connections && (
            <section className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-7 space-y-2.5 shadow-xs">
              <div className="flex items-center space-x-2 text-black font-mono text-xs uppercase tracking-wider font-bold">
                <FileText className="w-4 h-4" />
                <span>Interfaces and system connections</span>
              </div>
              <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-line">
                {component.interfaces_system_connections}
              </p>
            </section>
          )}

          {/* Section: Identification and verification guidance */}
          {component.identification_verification_guidance && (
            <section className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-7 space-y-2.5 shadow-xs">
              <div className="flex items-center space-x-2 text-black font-mono text-xs uppercase tracking-wider font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Identification and verification guidance</span>
              </div>
              <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-line">
                {component.identification_verification_guidance}
              </p>
            </section>
          )}

          {/* Section: Safety and limitations */}
          {component.safety_limitations && (
            <section className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-7 space-y-2.5 shadow-xs">
              <div className="flex items-center space-x-2 text-black font-mono text-xs uppercase tracking-wider font-bold">
                <ShieldAlert className="w-4 h-4" />
                <span>Safety and limitations</span>
              </div>
              <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-line">
                {component.safety_limitations}
              </p>
            </section>
          )}

          {/* Section: Technical reference guidance */}
          {component.technical_reference_guidance && (
            <section className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-7 space-y-2.5 shadow-xs">
              <div className="flex items-center space-x-2 text-black font-mono text-xs uppercase tracking-wider font-bold">
                <BookOpen className="w-4 h-4" />
                <span>Technical reference guidance</span>
              </div>
              <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-line">
                {component.technical_reference_guidance}
              </p>
            </section>
          )}

          {/* Key Educational Facts (if present) */}
          {component.facts && component.facts.length > 0 && (
            <section className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-7 space-y-4 shadow-xs">
              <div className="flex items-center space-x-2 text-black font-mono text-xs uppercase tracking-wider font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Key Educational Facts & Engineering Insights</span>
              </div>
              <ul className="space-y-3">
                {component.facts.map((fact, idx) => (
                  <li key={idx} className="flex items-start space-x-3 text-xs sm:text-sm text-zinc-700">
                    <span className="font-mono text-black text-xs shrink-0 mt-0.5 font-bold">
                      [{String(idx + 1).padStart(2, '0')}]
                    </span>
                    <span className="leading-relaxed">{fact}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Video Resource (if present) */}
          {component.videoUrl && (
            <section className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-7 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-black font-mono text-xs uppercase tracking-wider font-bold">
                  <Video className="w-4 h-4" />
                  <span>Video Resource & Live Test Footage</span>
                </div>
                <a
                  href={component.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-zinc-600 hover:text-black flex items-center space-x-1"
                >
                  <span>Open Video in New Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {youtubeEmbedUrl ? (
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-zinc-300 bg-zinc-100">
                  <iframe
                    src={youtubeEmbedUrl}
                    title={`${compName} Video Footage`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0"
                  />
                </div>
              ) : (
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-200 flex items-center justify-center text-black">
                      <Play className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-black">External Video Documentation</h4>
                      <p className="text-xs text-zinc-600 truncate max-w-sm">{component.videoUrl}</p>
                    </div>
                  </div>
                  <a
                    href={component.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-lg bg-black hover:bg-zinc-800 text-white font-mono text-xs font-semibold"
                  >
                    Watch Video
                  </a>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Right Column (1 col): Technical Specs Matrix & Reference Links */}
        <div className="space-y-6">
          {/* Record Metadata Card */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 text-xs font-mono text-zinc-600 space-y-2.5">
            <h3 className="font-bold text-black text-xs uppercase tracking-wider border-b border-zinc-200 pb-2">
              Website Record Specification
            </h3>
            <div className="flex justify-between">
              <span>Catalog ID:</span>
              <span className="text-black font-bold lowercase">{catalogId}</span>
            </div>
            <div className="flex justify-between">
              <span>Entry Number:</span>
              <span className="text-black font-bold">#{entryNum}</span>
            </div>
            <div className="flex justify-between">
              <span>Publication Status:</span>
              <span className="text-black font-semibold uppercase">{component.status || 'published'}</span>
            </div>
            {component.review_date && (
              <div className="flex justify-between">
                <span>Review Date:</span>
                <span className="text-black font-medium">{component.review_date}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>System Verification:</span>
              <span className="text-black font-bold">Aerospace Qualified</span>
            </div>
          </div>

          {/* Specifications Matrix Card (if present) */}
          {component.specifications && Object.keys(component.specifications).length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-xs">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black border-b border-zinc-200 pb-2">
                Technical Specifications
              </h3>
              <dl className="divide-y divide-zinc-200 text-xs">
                {Object.entries(component.specifications).map(([key, value]) => (
                  <div key={key} className="py-2.5 flex flex-col space-y-0.5">
                    <dt className="text-zinc-500 font-mono text-[11px] font-medium">{key}</dt>
                    <dd className="text-zinc-950 font-bold">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Reference Links & Papers (if present) */}
          {component.referenceLinks && component.referenceLinks.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-3 shadow-xs">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black border-b border-zinc-200 pb-2 flex items-center space-x-1.5">
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
                      className="group p-2.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 hover:border-black flex items-start justify-between transition-colors"
                    >
                      <span className="text-zinc-800 group-hover:text-black font-medium leading-tight">
                        {link.title}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-black shrink-0 ml-2 mt-0.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Related Components in Same Category */}
          {relatedComponents.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-3 shadow-xs">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black border-b border-zinc-200 pb-2">
                Related {component.category} Hardware
              </h3>
              <div className="space-y-2.5">
                {relatedComponents.map((rel) => (
                  <button
                    key={rel.id}
                    onClick={() => onSelectRelated && onSelectRelated(rel.id)}
                    className="w-full text-left p-2.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 hover:border-black transition-all flex items-center justify-between group"
                  >
                    <div className="space-y-0.5 max-w-[85%]">
                      <div className="text-xs font-bold text-zinc-900 group-hover:text-black truncate">
                        {rel.component_name || rel.name}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500 truncate">
                        {rel.catalog_id || rel.designation || 'Aerospace sub-assembly'}
                      </div>
                    </div>
                    <ArrowLeft className="w-3.5 h-3.5 text-zinc-400 group-hover:text-black transform rotate-180" />
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
