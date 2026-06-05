import React, { useState } from 'react';
import { Search, Play, Cpu, Zap, Settings, Activity, LayoutGrid, Car, ChevronRight, FlaskConical, Dna, Monitor } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const iconMap: Record<string, React.ElementType> = {
  Cpu, Zap, Settings, Activity, LayoutGrid, Car, FlaskConical, Dna, Monitor
};

export function ResearchOutcomePage() {
  const { researchProjects } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProjects = researchProjects
    .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 p.description.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const openVideo = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-full bg-[#f8fafc] p-6 lg:p-8">
      {/* Breadcrumbs */}
      <nav className="flex mb-8 text-sm text-slate-500 font-medium items-center gap-2">
        <span className="hover:text-blue-600 cursor-pointer">Home</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900">Research Outcome</span>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#0f172a] mb-2">Research Outcome</h1>
          <p className="text-slate-500">Explore innovative research projects and outcomes from our R&D center.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full md:w-[300px] bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Project Cards List */}
      <div className="space-y-6 max-w-6xl">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col md:flex-row p-5 md:p-6 gap-6 relative">
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-block px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold">
                    {project.year}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {project.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">
                  {project.description}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, index) => {
                  const Icon = iconMap[tag.iconName] || Settings;
                  return (
                    <span key={index} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-semibold text-slate-600">
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                      {tag.name}
                    </span>
                  );
                })}
              </div>
            </div>

            <div 
              onClick={() => openVideo(project.videoUrl)}
              className="w-full md:w-[320px] lg:w-[400px] shrink-0 relative aspect-video md:aspect-auto rounded-2xl overflow-hidden bg-slate-100 group-hover:shadow-lg transition-all duration-500 cursor-pointer"
            >
              <img 
                src={project.image || "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400"} 
                alt={project.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center group-hover:bg-black/20 transition-all">
                <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                  <Play className="w-6 h-6 text-blue-600 fill-blue-600 ml-1" />
                </div>
              </div>
              <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-bold text-white tracking-wider">
                {project.duration}
              </div>
            </div>
          </div>
        ))}
        {filteredProjects.length === 0 && (
          <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-3xl">
            <p className="text-slate-400">No projects found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
