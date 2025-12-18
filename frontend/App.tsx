import React, { useState } from 'react';
import { Icons } from './components/Icons';
import { AutoLinkVisual, AIExtractionVisual, DataviewVisual } from './components/Visuals';
import { PricingTier } from './types';

// --- Components ---

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-[#faf9f7]/95 backdrop-blur-sm border-b border-stone-200 py-4">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <a href="#" className="font-serif text-2xl tracking-tight text-stone-900 group">
          Meeting<span className="text-emerald-800 group-hover:text-emerald-600 transition-colors">Mind</span>
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
    <section className="pt-24 pb-20 border-b border-stone-200">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-medium tracking-wide uppercase mb-8 animate-fade-up" style={{ animationDelay: '0ms' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
          Obsidian Plugin for Meeting Transcripts
        </div>
        
        <h1 className="font-serif text-5xl md:text-7xl leading-[1.1] text-stone-900 mb-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
          Meeting transcripts that <br/>
          <em className="text-emerald-800 italic">actually connect</em>
        </h1>
        
        <p className="font-sans text-lg md:text-xl text-stone-500 max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-up" style={{ animationDelay: '200ms' }}>
          Sync transcripts from Fireflies.ai or import from Otter, Fathom, Zoom, and more. 
          Get AI summaries, action items, and automatic links to your existing notes—without lifting a finger.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '300ms' }}>
          <button className="px-8 py-3.5 bg-stone-900 text-[#faf9f7] font-medium rounded-lg hover:bg-stone-800 hover:scale-[1.02] transition-all shadow-lg shadow-stone-900/10 flex items-center gap-2">
            Install from Community Plugins
            <Icons.ArrowRight size={16} />
          </button>
          <a href="https://github.com/pattynextdoor/meetingmind" className="px-8 py-3.5 bg-transparent border border-stone-300 text-stone-900 font-medium rounded-lg hover:bg-stone-50 transition-all hover:border-stone-400">
            View on GitHub
          </a>
        </div>
        
        <p className="mt-4 text-xs text-stone-400 font-sans animate-fade-up" style={{ animationDelay: '400ms' }}>
          Free core features • Pro AI features $25 one-time
        </p>
      </div>
    </section>
  );
};

const SocialProof = () => (
  <section className="py-12 bg-[#f5f3ef] border-b border-stone-200">
    <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
      {[
        { value: "VTT/SRT/JSON", label: "Format Support" },
        { value: "Claude + GPT", label: "AI Providers" },
        { value: "Auto", label: "Wiki-Linking" },
        { value: "$25", label: "Lifetime Pro" },
      ].map((stat, i) => (
        <div key={i} className="text-center group cursor-default">
          <div className="font-serif text-3xl md:text-4xl text-stone-900 mb-1 group-hover:scale-110 transition-transform duration-300 ease-out">{stat.value}</div>
          <div className="text-xs uppercase tracking-widest text-stone-500 font-medium">{stat.label}</div>
        </div>
      ))}
    </div>
  </section>
);

const Features = () => {
  return (
    <section id="features" className="py-24">
      <div className="max-w-6xl mx-auto px-6 space-y-32">
        
        {/* Feature 1 */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
             <div className="relative group perspective-1000">
                <div className="absolute -inset-4 bg-purple-100/50 rounded-xl rotate-2 group-hover:rotate-1 transition-transform duration-500"></div>
                <div className="relative transform transition-transform duration-500 group-hover:-translate-y-2">
                   <AutoLinkVisual />
                </div>
             </div>
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 mb-4">
              <Icons.Link size={24} />
            </div>
            <h2 className="font-serif text-4xl text-stone-900">Auto-linking that works</h2>
            <p className="font-sans text-lg text-stone-600 leading-relaxed">
              MeetingMind indexes your entire vault and intelligently links transcript mentions 
              to existing notes. It handles aliases, partial matches, and disambiguates when 
              multiple notes could match.
            </p>
            <ul className="space-y-3 text-stone-600 font-sans text-sm">
              <li className="flex items-center gap-3">
                <Icons.Check className="text-emerald-700" size={16} />
                <span>Respects frontmatter aliases</span>
              </li>
              <li className="flex items-center gap-3">
                <Icons.Check className="text-emerald-700" size={16} />
                <span>Implicit aliases from multi-word names</span>
              </li>
              <li className="flex items-center gap-3">
                <Icons.Check className="text-emerald-700" size={16} />
                <span>Suggests links for ambiguous terms</span>
              </li>
            </ul>
            <div className="inline-block px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded">
              ✓ Included in Free
            </div>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-800 mb-4">
              <Icons.Brain size={24} />
            </div>
            <h2 className="font-serif text-4xl text-stone-900">AI that extracts value</h2>
            <p className="font-sans text-lg text-stone-600 leading-relaxed">
              Transform unstructured rambling into clear summaries and actionable tasks. 
              Bring your own API key—works with Claude (Anthropic) or GPT-4 (OpenAI).
            </p>
            <ul className="space-y-3 text-stone-600 font-sans text-sm">
              <li className="flex items-center gap-3">
                <Icons.Check className="text-emerald-700" size={16} />
                <span>2-4 sentence meeting summaries</span>
              </li>
              <li className="flex items-center gap-3">
                <Icons.Check className="text-emerald-700" size={16} />
                <span>Action items with assigned owners</span>
              </li>
              <li className="flex items-center gap-3">
                <Icons.Check className="text-emerald-700" size={16} />
                <span>Decision tracking & smart tag suggestions</span>
              </li>
              <li className="flex items-center gap-3">
                <Icons.Check className="text-emerald-700" size={16} />
                <span>AI-powered participant insights</span>
              </li>
            </ul>
            <div className="inline-block px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded">
              ⭐ Pro License Required
            </div>
          </div>
          <div className="relative group">
              <div className="absolute -inset-4 bg-emerald-100/50 rounded-xl -rotate-2 group-hover:-rotate-1 transition-transform duration-500"></div>
              <div className="relative transform transition-transform duration-500 group-hover:-translate-y-2">
                 <AIExtractionVisual />
              </div>
          </div>
        </div>

        {/* Feature 3 */}
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

        {/* Feature 4: Participants */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 mb-4">
              <Icons.Users size={24} />
            </div>
            <h2 className="font-serif text-4xl text-stone-900">Auto-create participant notes</h2>
            <p className="font-sans text-lg text-stone-600 leading-relaxed">
              MeetingMind automatically creates notes for people mentioned in your meetings. 
              Track meeting history, contributions, and action items per person.
            </p>
            <ul className="space-y-3 text-stone-600 font-sans text-sm">
              <li className="flex items-center gap-3">
                <Icons.Check className="text-emerald-700" size={16} />
                <span>Auto-creates missing participant notes</span>
              </li>
              <li className="flex items-center gap-3">
                <Icons.Check className="text-emerald-700" size={16} />
                <span>Links meetings to participant notes</span>
              </li>
              <li className="flex items-center gap-3">
                <Icons.Check className="text-emerald-700" size={16} />
                <span>AI insights per participant (Pro)</span>
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
                <div className="text-stone-500">## Meeting History</div>
                <div className="pl-4 space-y-1 text-stone-600">
                  <div>• [[2024-12-15 Project Phoenix Kickoff]]</div>
                  <div>• [[2024-12-18 Weekly Sync]]</div>
                </div>
                <div className="text-stone-500 mt-4">## Key Contributions</div>
                <div className="pl-4 text-stone-600">
                  <div>• Led API architecture discussion</div>
                  <div>• Proposed timeline adjustments</div>
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
    {tier.featured && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-800 text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
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
        "Folder watcher for auto-import",
        "Fireflies.ai API sync",
        "Dataview-ready frontmatter"
      ],
      cta: "Install Free",
      href: "#"
    },
    {
      name: "Pro License",
      price: "$25",
      period: "once",
      description: "Unlock AI-powered features. Pay once, use forever.",
      features: [
        "Everything in Free",
        "AI summaries (2-4 sentences)",
        "Action item extraction with owners",
        "Decision tracking",
        "Smart tag suggestions",
        "AI-powered participant insights",
        "Bring your own API key (Claude/OpenAI)"
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
          {tiers.map((tier, i) => (
            <PricingCard key={i} tier={tier} />
          ))}
        </div>

        <div className="text-center mt-12 text-stone-500 text-sm">
          <p>🔑 Pro requires your own Claude or OpenAI API key • No subscription, no recurring fees</p>
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="bg-white py-12 border-t border-stone-200">
    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-8">
        <a href="#" className="font-serif text-xl text-stone-900">Meeting<span className="text-emerald-800">Mind</span></a>
        <div className="hidden md:flex gap-6 text-sm text-stone-500">
          <a href="https://docs.meetingmind.me" className="hover:text-stone-900 transition-colors">Documentation</a>
          <a href="https://github.com/pattynextdoor/meetingmind" className="hover:text-stone-900 transition-colors">GitHub</a>
          <a href="https://tumbucon.gumroad.com/l/meetingmind-pro" className="hover:text-stone-900 transition-colors">Get Pro</a>
        </div>
      </div>
      <div className="text-sm text-stone-400">
        Built for the <a href="https://obsidian.md" className="underline decoration-stone-200 hover:decoration-stone-400 transition-all text-stone-500">Obsidian</a> community.
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
      <Features />
      <HowItWorks />
      <Pricing />
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
