import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';

// --- Shared Window Shell ---
interface MacWindowProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
}

const MacWindow = ({ title, children, className = "" }: MacWindowProps) => (
  <div className={`bg-white border border-stone-200 rounded-lg shadow-xl overflow-hidden flex flex-col ${className}`}>
    <div className="bg-stone-50 border-b border-stone-200 px-4 py-2 flex items-center gap-3">
      <div className="flex gap-1.5">
        <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
        <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
        <div className="w-3 h-3 rounded-full bg-emerald-400/80"></div>
      </div>
      <div className="text-xs text-stone-400 font-sans font-medium ml-2">{title}</div>
    </div>
    <div className="flex-1 relative font-mono text-xs md:text-sm leading-relaxed">
      {children}
    </div>
  </div>
);

// --- Feature 1: Auto-Link Animation ---
export const AutoLinkVisual = () => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStage((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const text = "Discussed the Q1 Roadmap with Sarah. We need to finalize the API Migration.";
  
  // Helper to render linked text based on stage
  const renderText = () => {
    if (stage === 0) return text;
    
    const parts = [
      { text: "Discussed the ", link: false },
      { text: "[[Q1 Roadmap]]", link: true, active: stage >= 1 },
      { text: " with ", link: false },
      { text: "[[Sarah]]", link: true, active: stage >= 2 },
      { text: ". We need to finalize the ", link: false },
      { text: "[[API Migration]]", link: true, active: stage >= 3 },
      { text: ".", link: false },
    ];

    return (
      <span>
        {parts.map((part, i) => (
          part.link ? (
            <span key={i} className={`transition-all duration-500 ${part.active ? 'text-purple-600 font-semibold bg-purple-50 px-1 rounded' : 'text-stone-800'}`}>
              {part.active ? part.text : part.text.replace('[[', '').replace(']]', '')}
            </span>
          ) : (
            <span key={i} className="text-stone-500">{part.text}</span>
          )
        ))}
      </span>
    );
  };

  return (
    <MacWindow title="Weekly_Sync.md">
      <div className="p-6">
        <div className="text-stone-300 mb-4">---<br/>date: 2025-02-24<br/>type: meeting<br/>---</div>
        <div className="mb-2 text-stone-800 font-bold text-lg"># Meeting Notes</div>
        <div className="leading-7">
          {renderText()}
          <span className="animate-pulse inline-block w-2 h-4 bg-stone-400 align-middle ml-1"></span>
        </div>
        
        {/* Floating tooltip simulation */}
        <div className={`absolute top-32 left-10 bg-stone-900 text-stone-50 p-3 rounded shadow-lg transform transition-all duration-500 ${stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <div className="text-xs font-sans text-stone-400 mb-1">Found existing note:</div>
          <div className="font-sans font-medium flex items-center gap-2">
            <Icons.FileText size={14} /> Q1 Roadmap
          </div>
        </div>
      </div>
    </MacWindow>
  );
};

// --- Feature 2: AI Extraction Animation ---
export const AIExtractionVisual = () => {
  return (
    <MacWindow title="Processing..." className="h-64">
      <div className="flex h-full">
        {/* Raw Text Side */}
        <div className="w-1/2 p-4 border-r border-stone-100 bg-stone-50/50 relative overflow-hidden">
          <div className="text-[10px] text-stone-400 space-y-2 blur-[0.5px]">
            <p>Okay so let's agree that John handles the database migration by Friday.</p>
            <p>I'll take care of the frontend updates.</p>
            <p>Wait, we also decided to push the launch to next week right?</p>
            <p>Yes, correct. Launch is now June 15th.</p>
            <p>Does everyone agree on the new budget cap of $5k?</p>
          </div>
          {/* Scanner Line */}
          <div className="scan-line top-0"></div>
        </div>

        {/* Extracted Side */}
        <div className="w-1/2 p-4 bg-white flex flex-col justify-center">
           <div className="space-y-3">
             <div className="transform transition-all duration-700 delay-700 translate-x-0 opacity-100">
               <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold mb-1 flex items-center gap-1">
                 <Icons.Check size={10} /> Action Items
               </div>
               <div className="space-y-1">
                 <div className="flex items-center gap-2 bg-emerald-50 p-1.5 rounded border border-emerald-100/50">
                    <div className="w-3 h-3 border border-emerald-300 rounded-sm"></div>
                    <div className="text-[10px] text-emerald-900">Database mig. (@John)</div>
                 </div>
                 <div className="flex items-center gap-2 bg-emerald-50 p-1.5 rounded border border-emerald-100/50">
                    <div className="w-3 h-3 border border-emerald-300 rounded-sm"></div>
                    <div className="text-[10px] text-emerald-900">Frontend updates (@Me)</div>
                 </div>
               </div>
             </div>

             <div className="transform transition-all duration-700 delay-1000 translate-x-0 opacity-100">
               <div className="text-[10px] uppercase tracking-wider text-amber-700 font-bold mb-1 flex items-center gap-1">
                 <Icons.Zap size={10} /> Decisions
               </div>
               <div className="bg-amber-50 p-1.5 rounded border border-amber-100/50 text-[10px] text-amber-900 leading-snug">
                 Launch moved to <span className="font-bold">June 15th</span> with $5k budget cap.
               </div>
             </div>
           </div>
        </div>
      </div>
    </MacWindow>
  );
};

// --- Feature 3: Dataview Visual ---
export const DataviewVisual = () => {
  const [rows, setRows] = useState<number[]>([]);

  useEffect(() => {
    // Reset
    setRows([]);
    // Animate rows in
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    [1, 2, 3].forEach((_, i) => {
      timeouts.push(setTimeout(() => {
        setRows(prev => [...prev, i]);
      }, 500 + (i * 400)));
    });

    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <MacWindow title="Dashboard.md">
      <div className="p-5 h-full flex flex-col">
        {/* Code Block */}
        <div className="bg-stone-100 p-3 rounded text-stone-600 mb-4 border border-stone-200">
          <div className="flex items-center gap-2 text-stone-400 mb-1">
            <span className="text-xs">```dataview</span>
          </div>
          <div className="pl-0 space-y-0.5 text-xs font-medium">
            <div><span className="text-purple-600">TABLE</span> attendees, sentiment</div>
            <div><span className="text-purple-600">FROM</span> "Meetings"</div>
            <div><span className="text-purple-600">WHERE</span> date &gt; date(today) - dur(7 days)</div>
            <div><span className="text-purple-600">SORT</span> date DESC</div>
          </div>
          <div className="text-stone-400 mt-1 text-xs">```</div>
        </div>

        {/* Result Table */}
        <div className="border border-stone-200 rounded overflow-hidden flex-1 bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 text-[10px] uppercase tracking-wider text-stone-500 border-b border-stone-200">
                <th className="p-2 font-medium">File</th>
                <th className="p-2 font-medium">Attendees</th>
                <th className="p-2 font-medium">Sentiment</th>
              </tr>
            </thead>
            <tbody className="text-xs text-stone-700">
              <tr className={`border-b border-stone-100 transition-opacity duration-500 ${rows.includes(0) ? 'opacity-100' : 'opacity-0'}`}>
                <td className="p-2 text-purple-600 hover:underline">[[Product Sync]]</td>
                <td className="p-2 text-stone-500">Sarah, Mike</td>
                <td className="p-2"><span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full text-[10px]">Positive</span></td>
              </tr>
              <tr className={`border-b border-stone-100 transition-opacity duration-500 ${rows.includes(1) ? 'opacity-100' : 'opacity-0'}`}>
                <td className="p-2 text-purple-600 hover:underline">[[Client Call]]</td>
                <td className="p-2 text-stone-500">Acme Corp</td>
                <td className="p-2"><span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full text-[10px]">Mixed</span></td>
              </tr>
              <tr className={`transition-opacity duration-500 ${rows.includes(2) ? 'opacity-100' : 'opacity-0'}`}>
                <td className="p-2 text-purple-600 hover:underline">[[1:1 Review]]</td>
                <td className="p-2 text-stone-500">Patrick</td>
                <td className="p-2"><span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full text-[10px]">Positive</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </MacWindow>
  );
};