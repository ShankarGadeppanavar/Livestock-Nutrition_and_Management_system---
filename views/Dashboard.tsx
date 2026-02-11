
import React from 'react';
import { Pig, FeedStatus } from '../types.ts';
import { AlertTriangle, TrendingUp, PiggyBank as PigIcon, Scale, Sparkles } from 'lucide-react';
import { getNutritionAdvice } from '../services/gemini.ts';

interface DashboardProps {
  pigs: Pig[];
  onNavigate: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ pigs, onNavigate }) => {
  const [advice, setAdvice] = React.useState<string>("Analyzing herd metrics...");
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getNutritionAdvice(pigs).then(res => {
      if (isMounted) {
        setAdvice(res);
        setIsLoading(false);
      }
    }).catch(() => {
      if (isMounted) {
        setAdvice("Failed to retrieve insights. Please check connection.");
        setIsLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [pigs]);

  const underfedPigs = pigs.filter(p => p.status === FeedStatus.UNDERFED);
  const totalWeight = pigs.reduce((acc, p) => acc + p.weight, 0);
  const avgWeight = totalWeight / (pigs.length || 1);

  const kpis = [
    { label: 'Total Herd', value: pigs.length, icon: PigIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Avg Weight', value: `${avgWeight.toFixed(1)} kg`, icon: Scale, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Underfed Today', value: underfedPigs.length, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Growth Index', value: '+14.2%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  /**
   * Robust Markdown Formatter:
   * Splits lines, detects bullets, and extracts bold segments.
   */
  const renderAdvice = (text: string) => {
    if (!text) return null;
    
    return text.split('\n').filter(l => l.trim() !== '').map((line, i) => {
      const cleanLine = line.trim();
      const isBullet = cleanLine.startsWith('* ') || cleanLine.startsWith('- ') || /^\d+\.\s/.test(cleanLine);
      
      // Remove marker if it's a bullet
      let lineText = cleanLine;
      if (isBullet) {
        lineText = cleanLine.replace(/^([\*\-]|(\d+\.))\s+/, '');
      }

      // Handle bold segments **bold**
      const parts = lineText.split(/(\*\*.*?\*\*)/g).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="font-extrabold text-white">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={i} className="flex gap-4 mb-4 items-start group">
            <span className="shrink-0 w-2 h-2 rounded-full bg-pink-400 mt-1.5 shadow-[0_0_8px_rgba(244,114,182,0.6)]"></span>
            <span className="flex-1 text-slate-200 leading-relaxed">{parts}</span>
          </div>
        );
      }
      
      return <p key={i} className="mb-4 text-slate-300 last:mb-0 leading-relaxed">{parts}</p>;
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">Herd Dashboard</h2>
          <p className="text-slate-500 font-bold uppercase text-[11px] tracking-[0.25em] mt-1 ml-0.5 opacity-80">Precision Nutrition Overview</p>
        </div>
        <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">Real-Time Sync Active</span>
        </div>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
            <div className={`${kpi.bg} ${kpi.color} w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-sm`}>
              <kpi.icon size={32} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{kpi.label}</p>
            <p className="text-3xl font-black mt-1 text-slate-900 tracking-tight">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Intervention Center */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/40">
              <div className="flex items-center gap-3">
                <AlertTriangle size={24} className="text-rose-500" />
                <h3 className="font-bold text-slate-800 text-xl tracking-tight">Priority Interventions</h3>
              </div>
              <button 
                onClick={() => onNavigate('alerts')} 
                className="px-6 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
              >
                View History
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {underfedPigs.length > 0 ? (
                underfedPigs.slice(0, 6).map(pig => (
                  <div key={pig.id} className="p-6 flex items-center justify-between hover:bg-rose-50/20 transition-all group">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <img src={pig.photoUrl} className="w-16 h-16 rounded-[1.25rem] object-cover shadow-md ring-4 ring-white group-hover:ring-rose-100 transition-all" />
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 rounded-full border-4 border-white"></div>
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-xl tracking-tight">{pig.tagId}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] mt-1">{pig.group} • {pig.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-rose-600">{pig.lastIntakeKg.toFixed(2)} <span className="text-sm font-bold">kg</span></p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Measured Intake</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-24 text-center">
                  <div className="bg-emerald-50 text-emerald-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-pulse">
                    <TrendingUp size={40} />
                  </div>
                  <p className="font-black text-slate-900 text-2xl tracking-tight">All Systems Optimal</p>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">Zero Underfed Animals Detected</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Insight Sidebar */}
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-[3rem] shadow-2xl p-10 text-white relative overflow-hidden group min-h-[550px] flex flex-col border border-slate-800">
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-5">
                  <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-4 rounded-2xl shadow-xl shadow-pink-500/30">
                    <Sparkles size={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight leading-none">Gemini AI</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-pink-500 mt-2">Nutritional Engine</p>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 text-slate-300 text-[15px] leading-relaxed font-medium">
                {isLoading ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-slate-800 rounded-full w-3/4"></div>
                    <div className="h-4 bg-slate-800 rounded-full"></div>
                    <div className="h-4 bg-slate-800 rounded-full w-5/6"></div>
                    <div className="h-4 bg-slate-800 rounded-full w-2/3"></div>
                  </div>
                ) : (
                  renderAdvice(advice)
                )}
              </div>
              
              <button 
                onClick={() => onNavigate('reports')}
                className="mt-12 w-full py-6 bg-white text-slate-900 font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-2xl hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-4 group/btn"
              >
                Launch Financial Report
                <TrendingUp size={20} className="text-pink-600 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
            
            {/* Background design elements */}
            <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none group-hover:scale-125 transition-transform duration-1000 ease-out">
              <PigIcon size={240} />
            </div>
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-pink-600/10 rounded-full blur-[120px]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
