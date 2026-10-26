import React, { useState, useEffect } from 'react';
import { Shield, Database, CheckCircle2, ArrowRight, Building2, Lock } from 'lucide-react';

export default function SplashScreen({ onFinish, selectedBank, onSelectBank, banks = [] }) {
  const [progress, setProgress] = useState(15);
  const [statusStep, setStatusStep] = useState('Connecting to Banking Policy Repository...');

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(45);
      setStatusStep('Loading Master Policy Matrix...');
    }, 300);

    const t2 = setTimeout(() => {
      setProgress(80);
      setStatusStep('Verifying User Permissions & Direct Clearances...');
    }, 700);

    const t3 = setTimeout(() => {
      setProgress(100);
      setStatusStep('Ready — Launching Workspace...');
    }, 1100);

    const t4 = setTimeout(() => {
      onFinish();
    }, 1400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 select-none animate-in fade-in duration-300">
      
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md text-center space-y-6">
        
        {/* CBA Institutional Crest */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-300">
            <span className="text-black font-black text-2xl tracking-tighter">CBA</span>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Commonwealth Bank of Australia
          </h1>
          <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold font-mono">
            Policy Governance & Compliance Reference Hub
          </p>
          <p className="text-[12.5px] text-slate-400 max-w-sm mx-auto leading-relaxed pt-1">
            Enterprise Master Library (libtrack_UI) • APRA CPS 234 Aligned • Maker-Checker Delegation Architecture
          </p>
        </div>

        {/* Progress Bar & Status Text */}
        <div className="space-y-2 pt-2">
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden border border-slate-700">
            <div 
              className="bg-gradient-to-r from-amber-400 to-amber-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
              {statusStep}
            </span>
            <span className="text-amber-400 font-semibold flex-shrink-0 ml-2">{progress}%</span>
          </div>
        </div>

        {/* Security badges */}
        <div className="pt-4 flex items-center justify-center gap-4 text-[11px] text-slate-400 border-t border-slate-800/80">
          <span className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-blue-400" /> Banking Database
          </span>
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-blue-400" /> APRA CPS 234
          </span>
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-blue-400" /> Direct Clearances
          </span>
        </div>

        {/* Skip button for instant entry */}
        <div className="pt-2">
          <button
            onClick={onFinish}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <span>Skip to Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
