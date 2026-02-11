
import React from 'react';
import { Pig, PigGroup, FeedStatus } from '../types';
import { Search, Plus, Filter, ChevronRight } from 'lucide-react';

interface PigRegistryProps {
  pigs: Pig[];
  onSelect: (pig: Pig) => void;
  onAddPig: () => void;
}

const PigRegistry: React.FC<PigRegistryProps> = ({ pigs, onSelect, onAddPig }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterGroup, setFilterGroup] = React.useState<string>('All');

  const filteredPigs = pigs.filter(p => {
    const matchesSearch = p.tagId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = filterGroup === 'All' || p.group === filterGroup;
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Pig Registry</h2>
          <p className="text-slate-500">Manage all {pigs.length} animals.</p>
        </div>
        <button 
          onClick={onAddPig}
          className="bg-pink-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-pink-700 active:scale-95 transition-all"
        >
          <Plus size={20} />
          Register Pig
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search Tag ID or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-2 focus:ring-pink-600 outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="px-4 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm font-medium outline-none"
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
          >
            <option value="All">All Groups</option>
            {Object.values(PigGroup).map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <button className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-500">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="hidden md:grid grid-cols-6 gap-4 p-6 bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="col-span-2">Pig Details</div>
          <div>Group</div>
          <div>Weight</div>
          <div>Last Intake</div>
          <div>Status</div>
        </div>
        
        <div className="divide-y divide-slate-50">
          {filteredPigs.map(pig => (
            <div 
              key={pig.id} 
              onClick={() => onSelect(pig)}
              className="p-4 md:p-6 grid grid-cols-2 md:grid-cols-6 gap-4 items-center hover:bg-pink-50/30 cursor-pointer transition-colors"
            >
              <div className="col-span-2 flex items-center gap-4">
                <img src={pig.photoUrl} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100" />
                <div>
                  <p className="font-bold text-slate-800">{pig.tagId}</p>
                  <p className="text-xs text-slate-500 font-medium">{pig.name}</p>
                </div>
              </div>
              <div className="hidden md:block">
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full uppercase">
                  {pig.group}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold text-slate-700">{pig.weight} kg</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Current Weight</p>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold text-slate-700">{pig.lastIntakeKg.toFixed(2)} kg</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Estimated</p>
              </div>
              <div className="flex items-center justify-between md:justify-start">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                  pig.status === FeedStatus.OK ? 'bg-emerald-100 text-emerald-700' :
                  pig.status === FeedStatus.UNDERFED ? 'bg-rose-100 text-rose-700' :
                  'bg-slate-100 text-slate-500'
                }`}>
                  {pig.status}
                </span>
                <ChevronRight className="md:hidden text-slate-300" size={20} />
              </div>
            </div>
          ))}
          {filteredPigs.length === 0 && (
            <div className="p-12 text-center text-slate-400 italic">
              No pigs found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PigRegistry;
