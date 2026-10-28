import React from 'react';
import { Rocket, ShieldCheck, Terminal, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 text-zinc-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Branding & Philosophy */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded bg-black text-white flex items-center justify-center">
                <Rocket className="w-4 h-4 transform -rotate-45" />
              </div>
              <span className="font-bold text-zinc-950 text-sm tracking-wide font-mono">
                AERION AEROSPACE ENCYCLOPEDIA
              </span>
            </div>
            <p className="text-zinc-600 text-xs leading-relaxed max-w-md">
              An open educational aerospace engineering repository designed for STEM students, rocketry competition teams, and space technology enthusiasts to explore multi-stage launch vehicle subsystems, operating physics, and flight hardware specs.
            </p>
            <div className="flex items-center space-x-3 text-[11px] text-zinc-500 font-mono pt-1">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-900" />
                <span>Peer-Reviewed STEM Education</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Terminal className="w-3.5 h-3.5 text-zinc-900" />
                <span>Firestore-Ready Architecture</span>
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-2">
            <h4 className="text-zinc-950 font-mono text-xs uppercase tracking-wider font-bold">
              Catalog Navigation
            </h4>
            <ul className="space-y-1.5 font-mono text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-black transition-colors"
                >
                  Overview & Index
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('explore')}
                  className="hover:text-black transition-colors"
                >
                  All Components Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('categories')}
                  className="hover:text-black transition-colors"
                >
                  Subsystem Categories
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="hover:text-black transition-colors"
                >
                  Hardware Management (Admin)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-black transition-colors"
                >
                  About the Project
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Technical References */}
          <div className="space-y-2">
            <h4 className="text-zinc-950 font-mono text-xs uppercase tracking-wider font-bold">
              Aerospace Repositories
            </h4>
            <ul className="space-y-1.5 font-mono text-xs">
              <li>
                <a
                  href="https://ntrs.nasa.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition-colors inline-flex items-center space-x-1"
                >
                  <span>NASA Technical Reports (NTRS)</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.aiaa.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition-colors inline-flex items-center space-x-1"
                >
                  <span>AIAA Aerospace Papers</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.faa.gov/space"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition-colors inline-flex items-center space-x-1"
                >
                  <span>FAA Commercial Space</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500 font-mono">
          <p>© {new Date().getFullYear()} Rocket Parts Explorer. Educational reference only.</p>
          <p className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-black"></span>
            <span>Laboratory Hardware Specification Baseline v1.2</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
