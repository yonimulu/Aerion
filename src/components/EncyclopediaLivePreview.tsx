import React from 'react';
import { RocketComponent } from '../types/rocket';
import { ShieldCheck, Calendar, ExternalLink, Image as ImageIcon } from 'lucide-react';

interface EncyclopediaLivePreviewProps {
  data: Partial<RocketComponent>;
  activeImageSource?: string | null;
}

export const EncyclopediaLivePreview: React.FC<EncyclopediaLivePreviewProps> = ({
  data,
  activeImageSource
}) => {
  const entryNumber = data.entry_number || '001';
  const componentName = data.component_name || data.name || 'Component Name';
  const category = data.category || 'Airframe, structures & flight controls';
  const catalogId = data.catalog_id || 'catalog-id';
  const status = data.status || 'draft';

  const previewImage = activeImageSource || data.image_storage_path || data.image_url || data.imageUrl;

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 space-y-6 text-zinc-950 font-sans shadow-xs">
      {/* Status & Preview Header Banner */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-3 text-xs font-mono">
        <span className="text-zinc-500 uppercase tracking-widest font-semibold flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-black"></span>
          <span>Live Encyclopedia Publication Preview</span>
        </span>
        <div className="flex items-center space-x-2">
          {data.featured && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-black text-white">
              FEATURED
            </span>
          )}
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
              status === 'published'
                ? 'bg-zinc-100 text-black border border-zinc-300'
                : 'bg-zinc-200 text-zinc-800'
            }`}
          >
            {status.toUpperCase()}
          </span>
          {data.review_date && (
            <span className="text-zinc-500 text-[11px] flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>Review: {data.review_date}</span>
            </span>
          )}
        </div>
      </div>

      {/* Title format: "001. Fuselage" */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
          {entryNumber}. {componentName}
        </h1>

        {/* Subtitle format: "CATEGORY: Airframe, structures & flight controls | CATALOG ID: fuselage" */}
        <div className="text-xs sm:text-sm font-mono text-zinc-700 uppercase tracking-wide border-b border-zinc-200 pb-3">
          CATEGORY: <span className="font-semibold text-black">{category}</span> | CATALOG ID: <span className="font-semibold text-black lowercase">{catalogId}</span>
        </div>
      </div>

      {/* Selected Image */}
      {previewImage ? (
        <div className="space-y-2">
          <div className="relative w-full rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 max-h-80 flex items-center justify-center">
            <img
              src={previewImage}
              alt={data.image_alt_text || componentName}
              className="w-full h-full max-h-80 object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          {(data.image_caption || data.image_title || data.image_source) && (
            <div className="text-xs text-zinc-600 flex flex-wrap items-center justify-between gap-1 pt-1 font-mono">
              <span>{data.image_caption || data.image_title}</span>
              {data.image_source && (
                <span className="text-[11px] text-zinc-500">
                  Source: {data.image_source}
                </span>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="border border-dashed border-zinc-300 rounded-lg p-6 text-center text-xs text-zinc-400 font-mono flex flex-col items-center justify-center space-y-1 bg-zinc-50/50">
          <ImageIcon className="w-6 h-6 text-zinc-300" />
          <span>[No image attached yet. Add via device upload or image URL.]</span>
        </div>
      )}

      {/* Section: Definition and description */}
      <div className="space-y-1">
        <h2 className="text-sm font-bold text-black uppercase tracking-wide font-mono">
          Definition and description
        </h2>
        <p className="text-sm text-zinc-800 leading-relaxed whitespace-pre-line">
          {data.definition_description || data.overview || (
            <span className="text-zinc-400 italic">No definition entered yet.</span>
          )}
        </p>
      </div>

      {/* Section: Purpose and engineering value */}
      <div className="space-y-1">
        <h2 className="text-sm font-bold text-black uppercase tracking-wide font-mono">
          Purpose and engineering value
        </h2>
        <p className="text-sm text-zinc-800 leading-relaxed whitespace-pre-line">
          {data.purpose_engineering_value || data.purpose || (
            <span className="text-zinc-400 italic">No purpose entered yet.</span>
          )}
        </p>
      </div>

      {/* Section: Operating principle — how it works */}
      <div className="space-y-1">
        <h2 className="text-sm font-bold text-black uppercase tracking-wide font-mono">
          Operating principle — how it works
        </h2>
        <p className="text-sm text-zinc-800 leading-relaxed whitespace-pre-line">
          {data.operating_principle || data.operatingPrinciples || (
            <span className="text-zinc-400 italic">No operating principles entered yet.</span>
          )}
        </p>
      </div>

      {/* Section: Location and installation context */}
      <div className="space-y-1">
        <h2 className="text-sm font-bold text-black uppercase tracking-wide font-mono">
          Location and installation context
        </h2>
        <p className="text-sm text-zinc-800 leading-relaxed whitespace-pre-line">
          {data.location_installation_context || data.stageLocation || (
            <span className="text-zinc-400 italic">No installation location entered yet.</span>
          )}
        </p>
      </div>

      {/* Section: Applications and operating context */}
      <div className="space-y-1">
        <h2 className="text-sm font-bold text-black uppercase tracking-wide font-mono">
          Applications and operating context
        </h2>
        <p className="text-sm text-zinc-800 leading-relaxed whitespace-pre-line">
          {data.applications_operating_context || (
            <span className="text-zinc-400 italic">No application context entered yet.</span>
          )}
        </p>
      </div>

      {/* Section: Interfaces and system connections */}
      <div className="space-y-1">
        <h2 className="text-sm font-bold text-black uppercase tracking-wide font-mono">
          Interfaces and system connections
        </h2>
        <p className="text-sm text-zinc-800 leading-relaxed whitespace-pre-line">
          {data.interfaces_system_connections || (
            <span className="text-zinc-400 italic">No interface connections entered yet.</span>
          )}
        </p>
      </div>

      {/* Section: Identification and verification guidance */}
      <div className="space-y-1">
        <h2 className="text-sm font-bold text-black uppercase tracking-wide font-mono">
          Identification and verification guidance
        </h2>
        <p className="text-sm text-zinc-800 leading-relaxed whitespace-pre-line">
          {data.identification_verification_guidance || (
            <span className="text-zinc-400 italic">No verification guidance entered yet.</span>
          )}
        </p>
      </div>

      {/* Section: Safety and limitations */}
      <div className="space-y-1">
        <h2 className="text-sm font-bold text-black uppercase tracking-wide font-mono">
          Safety and limitations
        </h2>
        <p className="text-sm text-zinc-800 leading-relaxed whitespace-pre-line">
          {data.safety_limitations || (
            <span className="text-zinc-400 italic">No safety limitations entered yet.</span>
          )}
        </p>
      </div>

      {/* Section: Technical reference guidance */}
      <div className="space-y-1">
        <h2 className="text-sm font-bold text-black uppercase tracking-wide font-mono">
          Technical reference guidance
        </h2>
        <p className="text-sm text-zinc-800 leading-relaxed whitespace-pre-line">
          {data.technical_reference_guidance || (
            <span className="text-zinc-400 italic">No reference guidance entered yet.</span>
          )}
        </p>
      </div>

      {/* Section: Website record suggestion */}
      <div className="pt-4 border-t border-zinc-200 space-y-1 bg-zinc-50 p-4 rounded-lg">
        <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wide font-mono">
          Website record suggestion
        </h2>
        <p className="text-xs text-zinc-600 leading-relaxed font-mono">
          Preserve the catalog ID (<span className="text-black font-semibold">{catalogId}</span>) and attach verified synonyms, image/source metadata if added later, and review date ({data.review_date || 'Unspecified'}) to support reliable search and future updates.
        </p>
      </div>
    </div>
  );
};
