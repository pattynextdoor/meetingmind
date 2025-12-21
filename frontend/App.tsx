import React, { useState } from 'react';
import { Icons } from './components/Icons';
import { AutoLinkVisual, AIExtractionVisual, DataviewVisual, GraphViewVisual, MacWindow } from './components/Visuals';
import { WebGLBackground } from './components/WebGLBackground';
import { ProBackground } from './components/ProBackground';
import { PricingTier } from './types';

// --- Components ---

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-[#faf9f7]/95 backdrop-blur-sm border-b border-stone-200 py-4">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <a href="#" className="flex items-center gap-3 font-serif text-2xl tracking-tight text-stone-900 group">
          <img src="/logo.svg" alt="MeetingMind" className="w-8 h-8" />
          <span className="tracking-tighter">Meeting<span className="text-emerald-800 group-hover:text-emerald-600 transition-colors">Mind</span></span>
        </a>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-sans text-stone-500 hover:text-stone-900 transition-colors">Features</a>
          <a href="#pricing" className="text-sm font-sans text-stone-500 hover:text-stone-900 transition-colors">Pricing</a>
          <a href="https://docs.meetingmind.me" className="text-sm font-sans text-stone-500 hover:text-stone-900 transition-colors">Docs</a>
        </div>

        <div className="flex items-center gap-4">
          <a href="https://tumbucon.gumroad.com/l/meetingmind-pro" className="px-5 py-2.5 bg-stone-900 text-[#faf9f7] text-sm font-medium rounded-md hover:bg-stone-800 hover:-translate-y-0.5 transition-all shadow-sm">
            Get Pro License
          </a>
        </div>
      </div>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative pt-24 pb-32 border-b border-stone-200 overflow-hidden bg-[#faf9f7]">
      <WebGLBackground />
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <div className="mb-8 animate-fade-up" style={{ animationDelay: '0ms' }}>
          <img src="/logo.svg" alt="MeetingMind" className="w-20 h-20 mx-auto drop-shadow-sm" />
        </div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-stone-200 shadow-sm text-stone-600 text-xs font-medium tracking-wide uppercase mb-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Obsidian Plugin for Meeting Transcripts
        </div>
        
        <h1 className="font-serif text-5xl md:text-7xl leading-[1.1] text-stone-900 mb-8 animate-fade-up tracking-tight" style={{ animationDelay: '200ms' }}>
          Turn meeting chatter into <br/>
          <em className="text-emerald-800 italic">connected knowledge</em>
        </h1>
        
        <p className="font-sans text-lg md:text-xl text-stone-500 max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-up" style={{ animationDelay: '300ms' }}>
          Automatically import transcripts from Fireflies, Otter, and Zoom. 
          Generate AI summaries, extract action items, and link mentions to your Obsidian vault—instantly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up mb-20" style={{ animationDelay: '400ms' }}>
          <a href="https://www.youtube.com/watch?v=KZ8D_RlLz7c" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-emerald-800 text-white font-medium rounded-xl hover:bg-emerald-900 hover:-translate-y-0.5 transition-all shadow-xl shadow-emerald-800/10 flex items-center gap-2 text-lg">
            <Icons.Play size={20} fill="currentColor" style={{ pointerEvents: 'none' }} />
            Watch Demo
          </a>
          <a href="https://docs.meetingmind.me/guide/installation" className="px-8 py-4 bg-stone-900 text-[#faf9f7] font-medium rounded-xl hover:bg-stone-800 hover:-translate-y-0.5 transition-all shadow-xl shadow-stone-900/10 flex items-center gap-2 text-lg">
            Get Started
            <Icons.ArrowRight size={18} style={{ pointerEvents: 'none' }} />
          </a>
          <a href="obsidian://show-plugin?id=meetingmind" className="px-8 py-4 bg-white border-2 border-stone-200 text-stone-900 font-medium rounded-xl hover:bg-stone-50 hover:border-stone-300 hover:-translate-y-0.5 transition-all shadow-lg flex items-center gap-2 text-lg">
            Install in Obsidian
            <Icons.ArrowRight size={18} style={{ pointerEvents: 'none' }} />
          </a>
        </div>

        {/* Hero Visual */}
        <div className="relative animate-fade-up" style={{ animationDelay: '500ms' }}>
          <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full transform scale-150 opacity-50 pointer-events-none"></div>
          <div className="relative transform hover:scale-[1.01] transition-transform duration-700 ease-out">
             <MacWindow title="Project_Phoenix_Sync.md" className="max-w-4xl mx-auto h-[400px] md:h-[500px] shadow-2xl border-stone-200/80">
               <div className="flex h-full font-sans">
                 {/* Sidebar (Navigation) */}
                 <div className="w-56 bg-[#f5f5f5] border-r border-stone-200 p-3 hidden md:block text-left text-xs text-stone-600 overflow-y-auto">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-1 font-medium mb-1 text-stone-400 hover:text-stone-600 cursor-pointer">
                          <Icons.Folder size={12} fill="currentColor" className="text-stone-400" />
                          <span>Issues</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-1 font-medium mb-1 text-stone-400 hover:text-stone-600 cursor-pointer">
                          <Icons.Folder size={12} fill="currentColor" className="text-stone-400" />
                          <span>Meetings</span>
                        </div>
                        <div className="pl-4 space-y-1 border-l border-stone-200 ml-1.5">
                           <div className="text-stone-900 font-medium bg-[#e4e4e4] -ml-2 pl-2 py-0.5 rounded cursor-pointer">2025-10-24 Project Phoenix</div>
                           <div className="hover:text-stone-900 cursor-pointer">2025-10-22 Team Sync</div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 font-medium mb-1 text-stone-400 hover:text-stone-600 cursor-pointer">
                          <Icons.Folder size={12} fill="currentColor" className="text-stone-400" />
                          <span>People</span>
                        </div>
                        <div className="pl-4 space-y-1 border-l border-stone-200 ml-1.5 text-stone-500">
                           <div className="hover:text-stone-900 cursor-pointer">Aisha Patel</div>
                           <div className="hover:text-stone-900 cursor-pointer">Chris Park</div>
                           <div className="hover:text-stone-900 cursor-pointer">Derek Nguyen</div>
                           <div className="hover:text-stone-900 cursor-pointer">Maya Rodriguez</div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 font-medium mb-1 text-stone-400 hover:text-stone-600 cursor-pointer">
                          <Icons.Folder size={12} fill="currentColor" className="text-stone-400" />
                          <span>Topics</span>
                        </div>
                        <div className="pl-4 space-y-1 border-l border-stone-200 ml-1.5 text-stone-500">
                           <div className="hover:text-stone-900 cursor-pointer">App store submission</div>
                           <div className="hover:text-stone-900 cursor-pointer">Freemium model</div>
                           <div className="hover:text-stone-900 cursor-pointer">Marketing campaign</div>
                        </div>
                      </div>

                      <div>
                         <div className="flex items-center gap-1 font-medium mb-1 text-stone-400 hover:text-stone-600 cursor-pointer">
                          <Icons.Folder size={12} fill="currentColor" className="text-stone-400" />
                          <span>Updates</span>
                         </div>
                      </div>
                    </div>
                 </div>

                 {/* Main Editor Area */}
                 <div className="flex-1 bg-white p-8 text-left overflow-hidden relative font-serif">
                    {/* Floating Connection Lines Animation (Decorative) */}
                    <div className="absolute top-20 right-10 w-32 h-32 opacity-10 pointer-events-none">
                       <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow">
                          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" fill="none" className="text-emerald-600" strokeDasharray="4 4" />
                          <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="1" fill="none" className="text-stone-400" />
                       </svg>
                    </div>

                    <div className="max-w-2xl mx-auto space-y-6">
                      <div className="space-y-4 border-b border-stone-100 pb-6">
                        <h1 className="text-3xl font-bold text-stone-900">Project Phoenix Sync</h1>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 font-sans">
                           <span className="px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-600">#meeting</span>
                           <span className="px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-600">#phoenix</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-stone-400 font-sans">
                           <span className="flex items-center gap-1.5"><Icons.Calendar size={14}/> Oct 24, 2025</span>
                           <span className="flex items-center gap-1.5"><Icons.Clock size={14}/> 45m</span>
                           <span className="flex items-center gap-1.5 text-emerald-600 font-medium"><Icons.Check size={14}/> Processed</span>
                        </div>
                      </div>

                      <div className="space-y-4 font-sans">
                         <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-wider">
                            <Icons.Zap size={12} className="text-amber-500" /> AI Summary
                         </div>
                         <p className="text-stone-800 text-sm leading-relaxed">
                            Team discussed the <span className="text-purple-700 font-medium hover:underline decoration-purple-300 cursor-pointer">[[Phoenix Launch]]</span> timeline. 
                            <span className="text-purple-700 font-medium hover:underline decoration-purple-300 cursor-pointer">[[Maya Rodriguez]]</span> raised concerns about API latency. 
                            Agreed to delay public beta by one week to fix critical <span className="text-purple-700 font-medium hover:underline decoration-purple-300 cursor-pointer">[[Issues/OAuth Integration]]</span>.
                         </p>
                      </div>

                      <div className="font-sans">
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                           <Icons.Check size={12} className="text-emerald-600" /> Action Items
                        </div>
                        <ul className="space-y-2 text-sm text-stone-600">
                           <li className="flex items-start gap-2 group cursor-pointer hover:bg-stone-50 p-1.5 -ml-1.5 rounded transition-colors">
                              <input type="checkbox" className="mt-1 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500" />
                              <span><span className="text-purple-700 font-medium hover:underline decoration-purple-300">[[Chris Park]]</span> to run load tests on new endpoints</span>
                           </li>
                           <li className="flex items-start gap-2 group cursor-pointer hover:bg-stone-50 p-1.5 -ml-1.5 rounded transition-colors">
                              <input type="checkbox" className="mt-1 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500" />
                              <span><span className="text-purple-700 font-medium hover:underline decoration-purple-300">[[Aisha Patel]]</span> to update documentation</span>
                           </li>
                        </ul>
                      </div>
                    </div>
                 </div>
               </div>
             </MacWindow>
          </div>
        </div>
      </div>
    </section>
  );
};

const SocialProof = () => (
  <section className="py-16 bg-[#f5f3ef] border-b border-stone-200">
    <div className="max-w-4xl mx-auto px-6">
      {/* Testimonial */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-lg p-8 mb-12">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <img 
              src="/patrick-profile.jpg" 
              alt="Patrick Tumbucon" 
              className="w-16 h-16 rounded-full object-cover border-2 border-emerald-100 sepia"
            />
          </div>
          <div className="flex-1">
            <p className="text-stone-700 text-lg leading-relaxed mb-4 italic">
              "I built MeetingMind because I was tired of losing context between meetings. 
               As a person with autism, I sometimes have difficulty remembering the finer details of a meeting.
               Now? I import my meeting transcripts, they integrate with my Obsidian vault,
               and I can easily connect the dots between topics, people, and issues."
            </p>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-stone-900">Patrick Tumbucon</div>
                <div className="text-sm text-stone-500">Creator of MeetingMind</div>
              </div>
              <div className="flex gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Icons.Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { value: "VTT/SRT/JSON", label: "Format Support" },
          { value: "Claude + GPT", label: "AI Providers" },
          { value: "Auto", label: "Wiki-Linking" },
          { value: "$39", label: "Lifetime Pro" },
        ].map((stat, i) => (
          <div key={i} className="text-center group cursor-default">
            <div className="font-serif text-3xl md:text-4xl text-stone-900 mb-1 group-hover:scale-110 transition-transform duration-300 ease-out">{stat.value}</div>
            <div className="text-xs uppercase tracking-widest text-stone-500 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const BeforeAfter = () => (
  <section className="py-24 bg-[#faf9f7] border-b border-stone-200 overflow-hidden">
    <div className="max-w-4xl mx-auto px-6 relative">
      <div className="text-center mb-16">
        <h2 className="font-serif text-4xl text-stone-900 mb-4">See the difference</h2>
        <p className="text-stone-600 text-lg">Stop letting valuable context slip away in isolated recordings.</p>
      </div>

      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 items-center max-w-5xl mx-auto">
        
        {/* Left Card: The Problem */}
        <div className="group relative p-8 rounded-2xl bg-[#f5f5f7] border border-stone-200/60 h-full flex flex-col justify-center">
          <div className="opacity-60 group-hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-2 mb-6 text-stone-500">
              <Icons.FileText size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Static Transcripts</span>
            </div>

            <ul className="space-y-4 font-medium text-stone-600">
              {[
                "Isolated text dumps",
                "Disconnected from your vault",
                "Manual copy-pasting",
                "Unstructured data"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Icons.X size={16} className="text-stone-400 flex-shrink-0" />
                  <span className="text-stone-500">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Connection (Desktop) */}
        <div className="hidden md:flex flex-col items-center justify-center relative h-full px-4">
           {/* Line */}
           <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-stone-200 -z-10"></div>
           
           {/* Badge */}
           <div className="bg-white border border-stone-200 shadow-sm rounded-full px-3 py-1.5 flex items-center gap-2 z-10">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest whitespace-nowrap">Import</span>
              <Icons.ArrowRight size={12} className="text-stone-400" />
           </div>
        </div>

        {/* Right Card: The Solution */}
        <div className="group relative p-8 rounded-2xl bg-white border border-stone-200 shadow-xl shadow-stone-200/40 h-full overflow-hidden hover:-translate-y-1 transition-transform duration-500">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6 text-emerald-900">
              <Icons.Network size={16} className="text-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-widest">Connected Knowledge</span>
            </div>

            <ul className="space-y-4 font-medium text-stone-900">
              {[
                "Deeply linked vault notes",
                "Rich participant context",
                "Automated graph growth",
                "Structured actionable insights"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Icons.Check size={12} className="text-emerald-700 stroke-[3]" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Features = () => {
  return (
    <section id="features" className="py-24">
      <div className="max-w-6xl mx-auto px-6 space-y-32">
        
        {/* Feature 1: Auto-linking - The Foundation */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
             <div className="relative group perspective-1000">
                <div className="absolute -inset-4 bg-purple-100/50 rounded-xl rotate-2 group-hover:rotate-1 transition-transform duration-500"></div>
                <div className="relative transform transition-transform duration-500 group-hover:-translate-y-2">
                   <GraphViewVisual />
                </div>
             </div>
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 mb-4">
              <Icons.Network size={24} />
            </div>
            <h2 className="font-serif text-4xl text-stone-900">Auto-linking that connects everything</h2>
            <p className="font-sans text-lg text-stone-600 leading-relaxed">
              Automatically connects meeting content to your existing notes—no manual linking required. 
              Every meeting connects your team, projects, and ideas. MeetingMind visualizes these connections in your graph view, turning isolated notes into a navigable network of knowledge.
            </p>
            <ul className="space-y-3 text-stone-600 font-sans text-sm">
              <li className="flex items-center gap-3">
                <Icons.Check className="text-emerald-700" size={16} />
                <span>Intelligent linking: "Sarah mentioned the Phoenix Project" → <code className="text-xs bg-stone-100 px-1 rounded">[[Sarah]] mentioned the [[Phoenix Project]]</code></span>
              </li>
              <li className="flex items-center gap-3">
                <Icons.Check className="text-emerald-700" size={16} />
                <span>Matches note titles, aliases, and implicit references</span>
              </li>
              <li className="flex items-center gap-3">
                <Icons.Check className="text-emerald-700" size={16} />
                <span>See how topics evolve over time in your graph view</span>
              </li>
            </ul>
            <div className="inline-block px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded">
              ✓ Included in Free
            </div>
          </div>
        </div>

        {/* Feature 2: Participant Tracking - Organize People */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 mb-4">
              <Icons.Users size={24} />
            </div>
            <h2 className="font-serif text-4xl text-stone-900">Auto-create participant notes</h2>
            <p className="font-sans text-lg text-stone-600 leading-relaxed">
              MeetingMind automatically creates notes for people mentioned in your meetings. 
              Track meeting history, contributions, action items, and what they own — all in one place.
            </p>
            <ul className="space-y-3 text-stone-600 font-sans text-sm">
              <li className="flex items-center gap-3">
                <Icons.Check className="text-emerald-700" size={16} />
                <span>Auto-creates missing participant notes</span>
              </li>
              <li className="flex items-center gap-3">
                <Icons.Check className="text-emerald-700" size={16} />
                <span>Links meetings, topics, and issues to participant notes</span>
              </li>
              <li className="flex items-center gap-3">
                <Icons.Check className="text-emerald-700" size={16} />
                <span>Track what each person owns and what issues they've raised (Pro)</span>
              </li>
              <li className="flex items-center gap-3">
                <Icons.Check className="text-emerald-700" size={16} />
                <span>AI insights per participant with automatic entity linking (Pro)</span>
              </li>
            </ul>
            <div className="inline-block px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded">
              ✓ Included in Free (AI insights require Pro)
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-4 bg-blue-100/50 rounded-xl -rotate-1 group-hover:rotate-0 transition-transform duration-500"></div>
            <div className="relative bg-white border border-stone-200 rounded-lg shadow-xl overflow-hidden p-6">
              <div className="text-stone-300 text-xs font-mono mb-3">---<br/>type: person<br/>---</div>
              <div className="text-xl font-serif text-stone-900 mb-4"># Sarah Chen</div>
              <div className="space-y-3 text-sm">
                <div className="text-stone-500">## Top of Mind</div>
                <div className="text-stone-500 text-xs mt-2">### Owns</div>
                <div className="pl-4 space-y-1 text-stone-600">
                  <div>• [[Payment flow]] — <em>active topic</em></div>
                  <div>• 🔄 OAuth integration — <em>in-progress 2024-12-15</em></div>
                </div>
                <div className="text-stone-500 mt-4">## Raised Issues</div>
                <div className="pl-4 text-stone-600">
                  <div>• [[Database timeout issue]]</div>
                </div>
                <div className="text-stone-500 mt-4">## Meetings</div>
                <div className="pl-4 space-y-1 text-stone-600">
                  <div>• [[2024-12-15 Project Phoenix Kickoff]]</div>
                  <div>• [[2024-12-18 Weekly Sync]]</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3: AI Enrichment - Add Intelligence */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
              <div className="relative group">
                <div className="absolute -inset-4 bg-emerald-100/50 rounded-xl rotate-2 group-hover:rotate-1 transition-transform duration-500"></div>
                <div className="relative transform transition-transform duration-500 group-hover:-translate-y-2">
                   <AIExtractionVisual />
                </div>
              </div>
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-800 mb-4">
              <Icons.Brain size={24} />
            </div>
            <h2 className="font-serif text-4xl text-stone-900">Context-aware AI that understands your vault</h2>
            <p className="font-sans text-lg text-stone-600 leading-relaxed">
              MeetingMind's AI understands your vault structure and creates notes that integrate seamlessly with your existing knowledge base.
            </p>
            <ul className="space-y-3 text-stone-600 font-sans text-sm">
              <li className="flex items-center gap-3">
                <Icons.Check className="text-emerald-700" size={16} />
                <span>Vault-aware summaries that reference your existing notes</span>
              </li>
              <li className="flex items-center gap-3">
                <Icons.Check className="text-emerald-700" size={16} />
                <span>Action items with assigned owners</span>
              </li>
              <li className="flex items-center gap-3">
                <Icons.Check className="text-emerald-700" size={16} />
                <span>Smart tag suggestions that learn from your tagging patterns</span>
              </li>
              <li className="flex items-center gap-3">
                <Icons.Check className="text-emerald-700" size={16} />
                <span>AI-powered participant insights, automatically linked to their notes</span>
              </li>
            </ul>
            <div className="inline-block px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded">
              ⭐ Pro License Required
            </div>
          </div>
        </div>

        {/* Feature 4: Entity Extraction - Grow Knowledge Graph */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 mb-4">
              <Icons.Network size={24} />
            </div>
            <h2 className="font-serif text-4xl text-stone-900">Grow your knowledge graph</h2>
            <p className="font-sans text-lg text-stone-600 leading-relaxed">
              MeetingMind doesn't just link to existing notes—it creates new ones and enriches them with AI. 
              Issues and topics mentioned in meetings automatically become part of your vault, 
              with living descriptions that evolve as more meetings reference them.
            </p>
            <ul className="space-y-3 text-stone-600 font-sans text-sm">
              <li className="flex items-center gap-3">
                <Icons.Check className="text-emerald-700" size={16} />
                <span>Auto-create notes for blockers and issues, linked to who raised them</span>
              </li>
              <li className="flex items-center gap-3">
                <Icons.Check className="text-emerald-700" size={16} />
                <span>Document topics with ownership tracking and AI-synthesized descriptions</span>
              </li>
              <li className="flex items-center gap-3">
                <Icons.Check className="text-emerald-700" size={16} />
                <span>Track progress updates on participant notes</span>
              </li>
              <li className="flex items-center gap-3">
                <Icons.Check className="text-emerald-700" size={16} />
                <span>Enrich your manually-created notes (opt-in)</span>
              </li>
              <li className="flex items-center gap-3">
                <Icons.Check className="text-emerald-700" size={16} />
                <span>Auto-archive resolved issues after 30 days (configurable)</span>
              </li>
            </ul>
            <div className="inline-block px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded">
              ⭐ Pro License Required
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-4 bg-purple-100/50 rounded-xl -rotate-1 group-hover:rotate-0 transition-transform duration-500"></div>
            <div className="relative bg-white border border-stone-200 rounded-lg shadow-xl overflow-hidden p-6">
              <div className="text-stone-300 text-xs font-mono mb-3">---<br/>type: issue<br/>status: blocked<br/>---</div>
              <div className="text-xl font-serif text-stone-900 mb-4"># OAuth Integration Blocker</div>
              <div className="space-y-3 text-sm">
                <div className="text-stone-500">## Description</div>
                <div className="pl-4 text-stone-600">Refresh token handling issue with Google API</div>
                <div className="pl-4 text-stone-600 mt-2"><strong>Raised by</strong>: [[Chris Park]]</div>
                <div className="text-stone-500 mt-4">## Status</div>
                <div className="pl-4 text-stone-600">blocked</div>
                <div className="text-stone-500 mt-4">## Related Meetings</div>
                <div className="pl-4 space-y-1 text-stone-600">
                  <div>• [[2025-01-15 Cadence App Launch Planning]]</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 5: Structured Metadata - Organize for Analysis */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
             <div className="relative group">
                <div className="absolute -inset-4 bg-amber-100/50 rounded-xl rotate-1 group-hover:rotate-0 transition-transform duration-500"></div>
                <div className="relative transform transition-transform duration-500 group-hover:-translate-y-2">
                   <DataviewVisual />
                </div>
             </div>
          </div>
          <div className="order-1 md:order-2 space-y-6">
             <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 mb-4">
              <Icons.Database size={24} />
            </div>
            <h2 className="font-serif text-4xl text-stone-900">Dataview-ready metadata</h2>
            <p className="font-sans text-lg text-stone-600 leading-relaxed">
              Every meeting is saved with structured YAML frontmatter: participants, duration, 
              source, and tags. Build powerful dashboards to track who you meet with and what you decide.
            </p>
            <div className="flex gap-2 flex-wrap">
               {['date', 'participants', 'source', 'duration', 'tags'].map(tag => (
                 <span key={tag} className="px-2 py-1 bg-stone-100 text-stone-500 text-xs font-mono rounded border border-stone-200">
                   {tag}
                 </span>
               ))}
            </div>
            <div className="inline-block px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded">
              ✓ Included in Free
            </div>
          </div>
        </div>

        {/* Feature 6: Dashboard Insights - See the Big Picture */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 mb-4">
              <Icons.Database size={24} />
            </div>
            <h2 className="font-serif text-4xl text-stone-900">Meeting dashboard with insights</h2>
            <p className="font-sans text-lg text-stone-600 leading-relaxed">
              Generate a comprehensive statistics dashboard to understand your meeting patterns. Track time investment, top collaborators, meeting frequency, and trends—all in one place.
            </p>
            <ul className="space-y-3 text-stone-600 font-sans text-sm">
              <li className="flex items-center gap-3">
                <Icons.Check className="text-emerald-700" size={16} />
                <span>Overview metrics: total meetings, this month/week/today</span>
              </li>
              <li className="flex items-center gap-3">
                <Icons.Check className="text-emerald-700" size={16} />
                <span>Time investment tracking: total hours, average duration, longest meetings</span>
              </li>
              <li className="flex items-center gap-3">
                <Icons.Check className="text-emerald-700" size={16} />
                <span>Top collaborators: see who you meet with most frequently</span>
              </li>
              <li className="flex items-center gap-3">
                <Icons.Check className="text-emerald-700" size={16} />
                <span>Meeting patterns: busiest days, monthly trends, source breakdown</span>
              </li>
            </ul>
            <div className="inline-block px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded">
              ✓ Included in Free
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-4 bg-blue-100/50 rounded-xl -rotate-1 group-hover:rotate-0 transition-transform duration-500"></div>
            <div className="relative bg-white border border-stone-200 rounded-lg shadow-xl overflow-hidden p-6">
              <div className="text-stone-300 text-xs font-mono mb-3"># 📊 Meeting Dashboard</div>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-stone-500 mb-2">## Overview</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-stone-50 p-2 rounded">
                      <div className="text-stone-400 text-[10px]">Total Meetings</div>
                      <div className="text-stone-900 font-semibold">147</div>
                    </div>
                    <div className="bg-stone-50 p-2 rounded">
                      <div className="text-stone-400 text-[10px]">This Month</div>
                      <div className="text-stone-900 font-semibold">23</div>
                    </div>
                    <div className="bg-stone-50 p-2 rounded">
                      <div className="text-stone-400 text-[10px]">This Week</div>
                      <div className="text-stone-900 font-semibold">6</div>
                    </div>
                    <div className="bg-stone-50 p-2 rounded">
                      <div className="text-stone-400 text-[10px]">Total Time</div>
                      <div className="text-stone-900 font-semibold">89h 30m</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-stone-500 mb-2">## 👥 Top Collaborators</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-stone-600">
                      <span className="text-purple-700 font-medium">[[Sarah Chen]]</span>
                      <span>12 meetings</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span className="text-purple-700 font-medium">[[Marcus Webb]]</span>
                      <span>8 meetings</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span className="text-purple-700 font-medium">[[Engineering Team]]</span>
                      <span>6 meetings</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-stone-500 mb-2">## 📅 Meeting Patterns</div>
                  <div className="text-xs text-stone-600">
                    <div>Busiest: <strong>Tuesday</strong> (34 meetings)</div>
                    <div>Quietest: <strong>Friday</strong> (12 meetings)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

const StepCard = ({ number, title, desc }: { number: string, title: string, desc: string }) => (
  <div className="bg-white p-8 rounded-lg border border-stone-200 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
    <div className="font-serif text-6xl text-stone-100 absolute -top-2 -right-2 transition-transform group-hover:scale-110 group-hover:text-stone-200 select-none">
      {number}
    </div>
    <div className="relative z-10">
      <h3 className="font-serif text-2xl text-stone-900 mb-3 group-hover:text-emerald-800 transition-colors">{title}</h3>
      <p className="text-stone-500 leading-relaxed font-sans">{desc}</p>
    </div>
  </div>
);

const HowItWorks = () => (
  <section className="py-24 bg-[#f5f3ef] border-y border-stone-200">
    <div className="max-w-6xl mx-auto px-6">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="font-serif text-4xl text-stone-900 mb-4">From transcript to linked note in seconds</h2>
        <p className="text-stone-600 text-lg">No manual work. No copy-paste. Just meetings that become part of your knowledge graph.</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <StepCard 
          number="01"
          title="Import Transcripts"
          desc="Sync from Fireflies.ai API, export from Otter/Fathom, or import VTT/SRT/JSON files. MeetingMind handles the rest."
        />
        <StepCard 
          number="02"
          title="Auto-Process"
          desc="Transcripts are parsed, formatted as Markdown, and enriched with AI summaries and action items (Pro)."
        />
        <StepCard 
          number="03"
          title="Connect Everything"
          desc="Mentions of projects, people, and topics automatically link to your existing notes in the vault."
        />
      </div>
    </div>
  </section>
);

const PricingCard = ({ tier }: { tier: PricingTier }) => (
  <div className={`
    relative p-8 rounded-xl border flex flex-col h-full transition-all duration-300
    ${tier.featured 
      ? 'bg-white border-emerald-800 shadow-xl scale-105 z-10' 
      : 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-lg'
    }
  `}>
    <div className="absolute inset-0 rounded-xl overflow-hidden">
      {tier.name === "Free" && <WebGLBackground opacity={0.6} />}
      {tier.name === "Pro License" && <ProBackground opacity={0.5} />}
    </div>
    
    <div className="relative z-10 flex flex-col h-full">
    {tier.featured && (
        <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-emerald-800 text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
        Best Value
      </div>
    )}
    
    <div className="mb-8">
      <div className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">{tier.name}</div>
      <div className="flex items-baseline gap-1">
        <span className="font-serif text-5xl text-stone-900">{tier.price}</span>
        {tier.period && <span className="text-stone-500 text-sm font-sans">{tier.period}</span>}
      </div>
      <p className="text-stone-500 text-sm mt-3 min-h-[40px]">{tier.description}</p>
    </div>

    <ul className="space-y-4 mb-8 flex-1">
      {tier.features.map((feature, i) => (
        <li key={i} className="flex items-start gap-3 text-sm text-stone-600">
          <Icons.Check size={16} className={`mt-0.5 ${tier.featured ? 'text-emerald-600' : 'text-stone-400'}`} />
          {feature}
        </li>
      ))}
    </ul>

    <a 
      href={tier.href}
      className={`
        w-full py-3 rounded-lg font-medium text-sm transition-colors text-center block
      ${tier.featured
        ? 'bg-emerald-800 text-white hover:bg-emerald-900'
        : 'bg-transparent border border-stone-300 text-stone-900 hover:bg-stone-50'
      }
      `}
    >
      {tier.cta}
    </a>
    </div>
  </div>
);

const Pricing = () => {
  const tiers: PricingTier[] = [
    {
      name: "Free",
      price: "$0",
      description: "Everything you need to import and link transcripts.",
      features: [
        "Multi-format parsing (VTT, SRT, TXT, JSON)",
        "Clean Markdown note generation",
        "Auto-linking to existing vault notes",
        "Participant tracking & note creation",
        "Meeting dashboard with statistics",
        "Folder watcher for auto-import",
        "Fireflies.ai API sync",
        "Dataview-ready frontmatter"
      ],
      cta: "Install Free",
      href: "#"
    },
    {
      name: "Pro License",
      price: "$39",
      period: "lifetime",
      description: "Unlock context-aware AI features. Pay once, use forever.",
      features: [
        "Everything in Free",
        "Vault-aware AI summaries (2-4 sentences)",
        "Action item extraction with owners",
        "Decision tracking",
        "Smart tag suggestions that learn from your vault",
        "AI-powered participant insights",
        "Entity extraction (issues, updates, topics)",
        "Your data, your keys—full privacy control (Claude/OpenAI)"
      ],
      cta: "Get Pro License",
      href: "https://tumbucon.gumroad.com/l/meetingmind-pro",
      featured: true
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-[#f5f3ef] border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-serif text-4xl text-stone-900 mb-4">Simple, honest pricing</h2>
          <p className="text-stone-600 text-lg">Core features are free forever. Upgrade for AI when you're ready.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto items-center">
          {tiers.map((tier) => (
            <PricingCard tier={tier} />
          ))}
        </div>

        <div className="text-center mt-12 text-stone-500 text-sm">
          <p>🔑 Pro uses your own API keys for full privacy control • No subscription, no recurring fees • Your vault stays private</p>
        </div>
      </div>
    </section>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const faqs = [
    {
      question: "Do I need an API key for the Free version?",
      answer: "No! The Free version works completely offline. Auto-linking, participant tracking, folder watcher, and all core features work without any API keys. Only Pro features (AI summaries, action items, etc.) require your own API key."
    },
    {
      question: "What if I don't like it?",
      answer: "We offer refunds within 14 days, no questions asked. If Pro doesn't save you time or fit your workflow, just email support@meetingmind.me and we'll process your refund immediately."
    },
    {
      question: "Is this worth $39?",
      answer: "If you attend just 2 meetings per week, you'll save hours of manual note organization in the first month alone. Most users report saving 15-30 minutes per meeting by not having to manually write summaries, extract action items, or create issue tracking notes. That's 1-2 hours saved per week—your time back for $39, once."
    },
    {
      question: "Can I try Pro before buying?",
      answer: "The free version gives you the full import and linking experience—try it first and see how it fits your workflow. When you're ready for AI summaries, action items, and entity extraction, upgrade to Pro with a one-time payment. You can also reprocess all your existing meetings to add AI enrichment after upgrading."
    },
    {
      question: "How much do API calls cost?",
      answer: "Typical meeting processing costs ~$0.01-0.05 per transcript, depending on length and which AI provider you use (Claude or OpenAI). You pay directly to the AI provider—MeetingMind doesn't charge any usage fees."
    },
    {
      question: "Can I use this on mobile?",
      answer: "No, MeetingMind is desktop-only (macOS, Windows, Linux). This is because it requires file system access for folder watching and vault indexing. Mobile Obsidian apps don't support these features."
    },
    {
      question: "What transcript formats are supported?",
      answer: "MeetingMind supports VTT, SRT, TXT, and JSON formats. You can import from Otter.ai, Fathom, Zoom, Fireflies.ai, or any tool that exports transcripts in these formats."
    },
    {
      question: "How does the Fireflies.ai sync work?",
      answer: "With Fireflies.ai API sync enabled, MeetingMind automatically imports new transcripts as they're created in your Fireflies account. Just set up your API key once, and new meetings appear in your vault automatically."
    }
  ];

  return (
    <section className="py-24 bg-white border-y border-stone-200">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl text-stone-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-stone-600 text-lg">Everything you need to know about MeetingMind</p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-stone-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-stone-50 transition-colors"
              >
                <span className="font-medium text-stone-900 pr-4">{faq.question}</span>
                <Icons.ChevronDown 
                  size={20} 
                  className={`text-stone-400 transition-transform flex-shrink-0 ${openIndex === index ? 'rotate-180' : ''}`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-stone-600 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="bg-white py-12 border-t border-stone-200">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-4">
        <div className="flex items-center gap-8">
          <a href="#" className="flex items-center gap-2 font-serif text-xl text-stone-900">
            <img src="/logo.svg" alt="MeetingMind" className="w-6 h-6" />
            <span className="tracking-tighter">Meeting<span className="text-emerald-800">Mind</span></span>
          </a>
          <div className="hidden md:flex gap-6 text-sm text-stone-500">
            <a href="https://docs.meetingmind.me" className="hover:text-stone-900 transition-colors">Documentation</a>
            <a href="https://github.com/pattynextdoor/meetingmind" className="hover:text-stone-900 transition-colors">GitHub</a>
            <a href="mailto:support@meetingmind.me" className="hover:text-stone-900 transition-colors">Support</a>
            <a href="https://tumbucon.gumroad.com/l/meetingmind-pro" className="hover:text-stone-900 transition-colors">Get Pro</a>
          </div>
        </div>
        <div className="text-sm text-stone-400">
          Built for the <a href="https://obsidian.md" className="underline decoration-stone-200 hover:decoration-stone-400 transition-all text-stone-500">Obsidian</a> community.
        </div>
      </div>
      <div className="text-center text-xs text-stone-400">
        Copyright © 2026 Patrick Tumbucon
      </div>
    </div>
  </footer>
);

const App = () => {
  return (
    <div className="min-h-screen font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />
      <Hero />
      <SocialProof />
      <BeforeAfter />
      <Features />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <section className="py-24 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-serif text-5xl text-stone-900 mb-6">Your meetings deserve better</h2>
          <p className="text-stone-500 text-lg mb-8">Stop letting valuable discussions disappear. Turn every meeting into connected, actionable knowledge.</p>
          <a href="https://tumbucon.gumroad.com/l/meetingmind-pro" className="inline-block px-8 py-4 bg-stone-900 text-[#faf9f7] font-medium rounded-lg hover:bg-stone-800 hover:-translate-y-1 transition-all shadow-lg text-lg">
            Get MeetingMind Pro →
          </a>
          <p className="mt-4 text-sm text-stone-400">
            Or install Free from Obsidian Community Plugins
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default App;
