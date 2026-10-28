import React, { useState } from 'react';
import { 
  X, Monitor, Download, ExternalLink, Check, Copy, Sparkles, 
  Layers, AppWindow, ArrowUpRight, Laptop, HelpCircle 
} from 'lucide-react';
import { useDesktopInstall } from '../hooks/useDesktopInstall';

interface DesktopInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopInstallModal: React.FC<DesktopInstallModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    isInstallable,
    isInstalled,
    isWindows,
    triggerNativeInstall,
    downloadWindowsShortcut,
    openStandaloneWindow
  } = useDesktopInstall();

  const [downloaded, setDownloaded] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const handleDownloadShortcut = () => {
    downloadWindowsShortcut();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const handleCopyAppUrl = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white border border-zinc-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        role="dialog"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-zinc-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 font-semibold">
                  Desktop Integration
                </span>
                {isWindows && (
                  <span className="px-1.5 py-0.2 rounded bg-zinc-200 text-zinc-800 font-mono text-[10px] font-bold">
                    WINDOWS DETECTED
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-black">
                Add to Windows Desktop / Launch as App
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-black p-1.5 rounded-lg hover:bg-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-xs text-zinc-800 overflow-y-auto max-h-[75vh]">
          {isInstalled && (
            <div className="p-3 bg-zinc-100 border border-black rounded-lg text-black font-mono flex items-center space-x-2">
              <Check className="w-4 h-4 text-black shrink-0" />
              <span>AERION is currently running in standalone desktop application mode.</span>
            </div>
          )}

          {/* Option Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Action 1: Download Windows Desktop Shortcut (.url) */}
            <div className="p-4 bg-zinc-50 border border-zinc-300 rounded-xl space-y-3 flex flex-col justify-between hover:border-black transition-colors">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2 text-black font-bold font-mono">
                  <Download className="w-4 h-4 text-black" />
                  <span>Windows Desktop Shortcut</span>
                </div>
                <p className="text-zinc-600 text-[11px] leading-relaxed">
                  Downloads an executable <code className="bg-white px-1 py-0.5 border border-zinc-200 rounded font-mono text-black">.url</code> shortcut file. Save or drag it to your Windows Desktop to launch the encyclopedia instantly anytime!
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadShortcut}
                className="w-full py-2.5 px-3 rounded-lg bg-black hover:bg-zinc-800 text-white font-mono font-semibold flex items-center justify-center space-x-2 shadow-xs transition-colors"
              >
                {downloaded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Shortcut Downloaded!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Desktop Shortcut</span>
                  </>
                )}
              </button>
            </div>

            {/* Action 2: Open in Standalone Window */}
            <div className="p-4 bg-zinc-50 border border-zinc-300 rounded-xl space-y-3 flex flex-col justify-between hover:border-black transition-colors">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2 text-black font-bold font-mono">
                  <AppWindow className="w-4 h-4 text-black" />
                  <span>Standalone App Window</span>
                </div>
                <p className="text-zinc-600 text-[11px] leading-relaxed">
                  Launches AERION in a clean, dedicated desktop application window without browser tabs, address bars, or distractions.
                </p>
              </div>

              <button
                type="button"
                onClick={openStandaloneWindow}
                className="w-full py-2.5 px-3 rounded-lg bg-white hover:bg-zinc-100 text-black border border-zinc-300 font-mono font-semibold flex items-center justify-center space-x-2 transition-colors"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Open in Standalone Window</span>
              </button>
            </div>
          </div>

          {/* Action 3: Native Browser PWA Install (if available) */}
          {isInstallable && (
            <div className="p-4 bg-white border border-zinc-300 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-black font-bold font-mono">
                  <Laptop className="w-4 h-4" />
                  <span>Install as Native Desktop Application</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-zinc-100 text-black font-mono text-[10px] font-bold">
                  PWA READY
                </span>
              </div>
              <p className="text-zinc-600 text-[11px] leading-relaxed">
                Chromium detected that this app meets native installability criteria. Click below to install directly to your Windows Start Menu and Taskbar.
              </p>
              <button
                type="button"
                onClick={triggerNativeInstall}
                className="py-2 px-4 rounded-lg bg-black hover:bg-zinc-800 text-white font-mono font-semibold flex items-center space-x-2"
              >
                <Monitor className="w-4 h-4" />
                <span>Install Native Windows App</span>
              </button>
            </div>
          )}

          {/* Guide Section: Browser & Google AI Studio Desktop Options */}
          <div className="border-t border-zinc-200 pt-4 space-y-3">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-black flex items-center space-x-1.5">
              <HelpCircle className="w-4 h-4 text-zinc-600" />
              <span>How to Install via Google Chrome / Microsoft Edge</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-sans">
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1">
                <div className="font-bold text-black font-mono flex items-center space-x-1">
                  <span>Google Chrome</span>
                </div>
                <ol className="list-decimal list-inside text-zinc-600 space-y-0.5 leading-relaxed">
                  <li>Open the app in a browser tab.</li>
                  <li>Click the <strong>Install app</strong> icon in the address bar (or Menu ⋮ $\rightarrow$ <strong>Save and share</strong> $\rightarrow$ <strong>Install page as app</strong>).</li>
                  <li>Click <strong>Install</strong> to add it to your Windows Desktop and Start Menu.</li>
                </ol>
              </div>

              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1">
                <div className="font-bold text-black font-mono flex items-center space-x-1">
                  <span>Microsoft Edge</span>
                </div>
                <ol className="list-decimal list-inside text-zinc-600 space-y-0.5 leading-relaxed">
                  <li>Click the <strong>...</strong> (Settings and more) button in Edge.</li>
                  <li>Go to <strong>Apps</strong> $\rightarrow$ <strong>Install this site as an app</strong>.</li>
                  <li>Check <strong>Create Desktop shortcut</strong> and click <strong>Allow</strong>.</li>
                </ol>
              </div>
            </div>

            {/* AI Studio Specific Note */}
            <div className="p-3 bg-zinc-100 rounded-lg border border-zinc-300 text-[11px] text-zinc-700 space-y-1 font-mono">
              <div className="font-bold text-black">Tip for Google AI Studio Users:</div>
              <p className="text-zinc-600 leading-relaxed font-sans">
                When working in Google AI Studio, the application renders in an embedded preview frame. To enable the browser's native address bar install icon, click the <strong>Open in New Tab</strong> button in AI Studio (or copy the direct app link below), then install directly from Chrome or Edge.
              </p>
              <div className="pt-1 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCopyAppUrl}
                  className="px-2.5 py-1 bg-white border border-zinc-300 rounded text-black hover:bg-zinc-50 flex items-center space-x-1 text-[10px]"
                >
                  {copiedUrl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedUrl ? 'URL Copied!' : 'Copy Direct App URL'}</span>
                </button>
                <a
                  href={window.location.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-white border border-zinc-300 rounded text-black hover:bg-zinc-50 flex items-center space-x-1 text-[10px]"
                >
                  <span>Open Direct Link</span>
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-mono font-semibold text-black bg-white hover:bg-zinc-100 border border-zinc-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
