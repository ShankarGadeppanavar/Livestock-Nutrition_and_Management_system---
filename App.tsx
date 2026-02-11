
import React from 'react';
import { AppState, Pig, FeedEvent, UserRole, PigGroup, Sex, FeedStatus, UserProfile } from './types.ts';
import { loadState, saveState } from './services/storage.ts';
import Layout from './components/Layout.tsx';
import Dashboard from './views/Dashboard.tsx';
import PigRegistry from './views/PigRegistry.tsx';
import FeedingForm from './views/FeedingForm.tsx';
import Reports from './views/Reports.tsx';
import Login from './views/Login.tsx';
import { ADMIN_EMAIL, generateSeedData } from './constants.tsx';
// Added HelpCircle to the imports below
import { Save, ArrowLeft, RotateCcw, Trash2, LogOut, Camera, Upload, X, HelpCircle } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = React.useState<AppState>(loadState());
  const [activeView, setActiveView] = React.useState('dashboard');
  const [editingPigId, setEditingPigId] = React.useState<string | null>(null);

  // Form state for adding/editing a pig
  const [newPig, setNewPig] = React.useState<Partial<Pig>>({
    tagId: '',
    name: '',
    group: PigGroup.GROWER,
    sex: Sex.MALE,
    isPregnant: false,
    weight: 20,
    breed: 'Yorkshire',
    dob: new Date().toISOString().split('T')[0],
    photoUrl: ''
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Automatically save state whenever it changes
  React.useEffect(() => {
    saveState(state);
  }, [state]);

  const handleLogin = (user: UserProfile) => {
    setState(prev => ({ ...prev, currentUser: user }));
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      setState(prev => ({ ...prev, currentUser: null }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image is too large. Please select an image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPig(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRecordFeeding = (event: any) => {
    const newPigs = state.pigs.map(p => {
      const estimate = event.estimates.find((e: any) => e.id === p.id);
      if (estimate) {
        return {
          ...p,
          lastIntakeKg: estimate.estimated,
          status: estimate.status
        };
      }
      return p;
    });

    const underfedCount = event.estimates.filter((e: any) => e.status === FeedStatus.UNDERFED || e.status === FeedStatus.MISSED).length;
    if (underfedCount > 0) {
      console.log(`%c[SYSTEM ALERT] Email sent to ${ADMIN_EMAIL}: ${underfedCount} issues detected in ${event.group} group.`, "color: #e11d48; font-weight: bold;");
    }

    setState(prev => ({
      ...prev,
      pigs: newPigs,
      feedEvents: [event, ...prev.feedEvents]
    }));
  };

  const handleAddOrUpdatePig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPig.tagId || !newPig.name) {
      alert("Please enter both Tag ID and Name.");
      return;
    }

    const finalPhotoUrl = newPig.photoUrl || `https://picsum.photos/seed/${newPig.tagId}/200/200`;

    if (editingPigId) {
      // Update existing
      const updatedPigs = state.pigs.map(p => {
        if (p.id === editingPigId) {
          const weightHistory = [...p.weightHistory];
          if (newPig.weight !== p.weight) {
            weightHistory.push({ date: new Date().toISOString(), value: newPig.weight || p.weight });
          }
          return {
            ...p,
            tagId: newPig.tagId!,
            name: newPig.name!,
            group: (newPig.group as PigGroup),
            sex: (newPig.sex as Sex),
            weight: newPig.weight || p.weight,
            weightHistory,
            breed: newPig.breed || p.breed,
            dob: newPig.dob || p.dob,
            isPregnant: !!newPig.isPregnant,
            photoUrl: finalPhotoUrl
          };
        }
        return p;
      });
      setState(prev => ({ ...prev, pigs: updatedPigs }));
    } else {
      // Create new
      const pigToAdd: Pig = {
        id: `p-${Date.now()}`,
        tagId: newPig.tagId!,
        name: newPig.name!,
        dob: newPig.dob || new Date().toISOString().split('T')[0],
        group: (newPig.group as PigGroup) || PigGroup.GROWER,
        sex: (newPig.sex as Sex) || Sex.MALE,
        breed: newPig.breed || 'Unknown',
        weight: newPig.weight || 0,
        weightHistory: [{ date: new Date().toISOString(), value: newPig.weight || 0 }],
        isPregnant: !!newPig.isPregnant,
        photoUrl: finalPhotoUrl,
        lastIntakeKg: 0,
        status: FeedStatus.PENDING
      };
      setState(prev => ({ ...prev, pigs: [pigToAdd, ...prev.pigs] }));
    }
    
    // Reset form and view
    resetForm();
    setActiveView('pigs');
  };

  const resetForm = () => {
    setEditingPigId(null);
    setNewPig({ 
      tagId: '',
      name: '',
      group: PigGroup.GROWER, 
      sex: Sex.MALE, 
      isPregnant: false, 
      weight: 20, 
      breed: 'Yorkshire',
      dob: new Date().toISOString().split('T')[0],
      photoUrl: ''
    });
  };

  const handleEditPig = (pig: Pig) => {
    setEditingPigId(pig.id);
    setNewPig({
      tagId: pig.tagId,
      name: pig.name,
      group: pig.group,
      sex: pig.sex,
      isPregnant: pig.isPregnant,
      weight: pig.weight,
      breed: pig.breed,
      dob: pig.dob,
      photoUrl: pig.photoUrl
    });
    setActiveView('add_pig'); 
  };

  const handleResetData = () => {
    const isConfirmed = window.confirm("CRITICAL WARNING: This will permanently delete all feeding events, manual overrides, and custom pig records. The registry will be reset to factory defaults. Are you sure?");
    
    if (isConfirmed) {
      try {
        localStorage.removeItem('liveshock_v1_storage');
        const freshPigs = generateSeedData();
        const freshState: AppState = {
          pigs: freshPigs,
          feedEvents: [],
          currentUser: state.currentUser 
        };
        setState(freshState);
        saveState(freshState);
        setActiveView('dashboard');
        alert("System data has been successfully reset to defaults.");
      } catch (error) {
        console.error("Failed to reset data:", error);
        alert("An error occurred while resetting the system. Please try again.");
      }
    }
  };

  if (!state.currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard pigs={state.pigs} onNavigate={setActiveView} />;
      case 'pigs':
        return (
          <PigRegistry 
            pigs={state.pigs} 
            onSelect={handleEditPig} 
            onAddPig={() => { resetForm(); setActiveView('add_pig'); }} 
          />
        );
      case 'add_pig':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between">
              <button onClick={() => setActiveView('pigs')} className="flex items-center gap-2 text-slate-500 font-bold hover:text-pink-600 transition-colors">
                <ArrowLeft size={22} /> Back to Registry
              </button>
              <h2 className="text-3xl font-black text-slate-900">{editingPigId ? 'Edit Pig Record' : 'Register New Pig'}</h2>
            </div>
            <form onSubmit={handleAddOrUpdatePig} className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-10">
              
              {/* Image Upload Section */}
              <div className="flex flex-col items-center justify-center space-y-6 pb-6 border-b border-slate-50">
                <div className="relative group">
                  <div className="w-48 h-48 rounded-[2.5rem] overflow-hidden bg-slate-100 ring-8 ring-pink-500/5 border-2 border-dashed border-slate-200 flex items-center justify-center group-hover:border-pink-400 transition-all duration-300">
                    {newPig.photoUrl ? (
                      <img src={newPig.photoUrl} alt="Pig Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-6">
                        <Camera size={40} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Identify Pig</p>
                      </div>
                    )}
                  </div>
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-3 -right-3 bg-pink-600 text-white p-4 rounded-2xl shadow-2xl hover:bg-pink-700 transition-all hover:scale-110 active:scale-95 z-10"
                  >
                    <Upload size={20} />
                  </button>
                  {newPig.photoUrl && (
                    <button 
                      type="button"
                      onClick={() => setNewPig(prev => ({...prev, photoUrl: ''}))}
                      className="absolute -top-3 -right-3 bg-slate-900 text-white p-3 rounded-2xl shadow-lg hover:bg-black transition-all z-10"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <p className="text-xs font-bold text-slate-400 text-center uppercase tracking-widest max-w-[250px] leading-relaxed">
                  {editingPigId ? "Updating facial identification profile" : "Attach photo for individual monitoring"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Tag Identifier</label>
                  <input required type="text" placeholder="e.g. TAG-2045" value={newPig.tagId} onChange={e => setNewPig({...newPig, tagId: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-4 focus:ring-pink-600 outline-none font-bold text-lg transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Assigned Name</label>
                  <input required type="text" placeholder="e.g. Bessie" value={newPig.name} onChange={e => setNewPig({...newPig, name: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-4 focus:ring-pink-600 outline-none font-bold text-lg transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Management Group</label>
                  <select value={newPig.group} onChange={e => setNewPig({...newPig, group: e.target.value as PigGroup})} className="w-full p-5 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-4 focus:ring-pink-600 outline-none font-bold text-lg transition-all appearance-none cursor-pointer">
                    {Object.values(PigGroup).map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Current Mass (kg)</label>
                  <input type="number" value={newPig.weight} onChange={e => setNewPig({...newPig, weight: parseFloat(e.target.value)})} className="w-full p-5 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-4 focus:ring-pink-600 outline-none font-bold text-lg transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Genetic Breed</label>
                  <input type="text" value={newPig.breed} onChange={e => setNewPig({...newPig, breed: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-4 focus:ring-pink-600 outline-none font-bold text-lg transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Birth Record</label>
                  <input type="date" value={newPig.dob} onChange={e => setNewPig({...newPig, dob: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-4 focus:ring-pink-600 outline-none font-bold text-lg transition-all" />
                </div>
                <div className="flex flex-col space-y-4 p-2">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Sex Assignment</span>
                  <div className="flex items-center gap-10">
                    <label className="flex items-center gap-3 font-bold text-slate-700 cursor-pointer group">
                      <input type="radio" name="sex" className="w-5 h-5 accent-pink-600 cursor-pointer" checked={newPig.sex === Sex.MALE} onChange={() => setNewPig({...newPig, sex: Sex.MALE})} /> 
                      <span className="group-hover:text-pink-600 transition-colors">Male</span>
                    </label>
                    <label className="flex items-center gap-3 font-bold text-slate-700 cursor-pointer group">
                      <input type="radio" name="sex" className="w-5 h-5 accent-pink-600 cursor-pointer" checked={newPig.sex === Sex.FEMALE} onChange={() => setNewPig({...newPig, sex: Sex.FEMALE})} /> 
                      <span className="group-hover:text-pink-600 transition-colors">Female</span>
                    </label>
                  </div>
                </div>
                {newPig.sex === Sex.FEMALE && (
                  <div className="flex items-end">
                    <label className="flex items-center gap-4 p-5 bg-pink-50 rounded-[1.5rem] border border-pink-100 font-bold text-slate-700 cursor-pointer w-full hover:bg-pink-100 transition-colors">
                      <input type="checkbox" className="w-6 h-6 rounded-lg accent-pink-600 cursor-pointer" checked={newPig.isPregnant} onChange={e => setNewPig({...newPig, isPregnant: e.target.checked})} /> 
                      Gestating / Pregnant?
                    </label>
                  </div>
                )}
              </div>
              <button type="submit" className="w-full py-6 bg-pink-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-pink-200 hover:bg-pink-700 transition-all active:scale-[0.98] flex items-center justify-center gap-4 group">
                <Save size={24} className="group-hover:scale-110 transition-transform" /> {editingPigId ? 'Finalize Changes' : 'Register To Herd'}
              </button>
            </form>
          </div>
        );
      case 'feeding':
        return <FeedingForm pigs={state.pigs} onRecord={handleRecordFeeding} onNavigate={setActiveView} />;
      case 'alerts':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Security & Alert Center</h2>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Notification Routing: {ADMIN_EMAIL}</p>
            </div>
            <div className="bg-white rounded-[2.5rem] p-10 text-center border-2 border-dashed border-slate-200 text-slate-400">
              <div className="max-w-2xl mx-auto space-y-6 text-left">
                {state.pigs.filter(p => p.status === FeedStatus.UNDERFED || p.status === FeedStatus.MISSED).map(p => (
                  <div key={p.id} className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100 flex gap-6 items-center hover:bg-rose-100 transition-colors">
                     <div className="w-14 h-14 bg-rose-500 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg">!</div>
                     <div className="flex-1">
                       <p className="font-black text-rose-900 text-lg uppercase tracking-tight">Metabolic Deficit: {p.tagId}</p>
                       <div className="flex items-center gap-2 mt-1">
                         <span className="text-xs font-black text-rose-600 bg-white px-2 py-0.5 rounded uppercase">{p.status}</span>
                         <span className="text-xs text-rose-400">•</span>
                         <span className="text-xs text-rose-500 font-bold">Estimated Intake: {p.lastIntakeKg.toFixed(2)} kg</span>
                       </div>
                       <p className="text-xs text-rose-400 mt-2 font-medium">Auto-generated alert broadcasted to Veterinary Staff via {ADMIN_EMAIL}</p>
                     </div>
                  </div>
                ))}
                {state.pigs.filter(p => p.status === FeedStatus.UNDERFED || p.status === FeedStatus.MISSED).length === 0 && (
                  <div className="p-20 text-center w-full bg-slate-50/50 rounded-[2rem] border-2 border-slate-100">
                    <p className="text-slate-400 italic text-lg font-bold">No active alerts found. Herd safety protocols are stable.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'reports':
        return <Reports pigs={state.pigs} feedEvents={state.feedEvents} />;
      case 'admin':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black text-slate-900">System Governance</h2>
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 space-y-10 shadow-sm">
              <div className="flex items-center justify-between p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-xl">
                <div className="flex items-center gap-6">
                  <img src={state.currentUser?.photoUrl} className="w-20 h-20 rounded-full border-4 border-slate-800 shadow-2xl bg-slate-800" alt="Profile" />
                  <div>
                    <p className="font-black text-2xl tracking-tight">{state.currentUser?.name}</p>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">{state.currentUser?.role} • {state.currentUser?.email}</p>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-4 text-rose-400 bg-white/5 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-inner"
                >
                  <LogOut size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Primary Monitoring Endpoint</label>
                  <input disabled type="text" value={ADMIN_EMAIL} className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-slate-500 border border-slate-100 cursor-not-allowed" />
                  <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest ml-1">Notifications route through this address exclusively.</p>
                </div>
                <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100">
                   <h4 className="font-black text-emerald-800 uppercase tracking-widest text-xs mb-3">Service Uptime</h4>
                   <div className="flex items-center gap-3">
                     <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                     <p className="text-emerald-700 font-black tracking-tight">Cloud Node: North America Central</p>
                   </div>
                   <p className="text-[10px] text-emerald-600 mt-2 font-bold uppercase tracking-widest">Latency: 42ms • Integrity: 100%</p>
                </div>
              </div>
              
              <div className="pt-10 border-t border-slate-100">
                <h3 className="font-black text-slate-800 text-xl tracking-tight mb-6">Database Management</h3>
                <div className="space-y-4">
                   <button 
                    type="button"
                    onClick={handleResetData}
                    className="w-full flex items-center justify-between p-6 bg-rose-50 text-rose-700 rounded-[2rem] border border-rose-100 hover:bg-rose-100 transition-all group cursor-pointer active:scale-[0.99]"
                   >
                     <div className="flex items-center gap-5">
                       <div className="bg-white p-3 rounded-xl shadow-sm">
                         <RotateCcw size={22} className="group-hover:rotate-180 transition-transform duration-700 text-rose-500" />
                       </div>
                       <div className="text-left">
                         <p className="font-black text-lg tracking-tight">Hard Reset System Data</p>
                         <p className="text-xs font-bold uppercase tracking-widest opacity-60">Factory wipe of all herd history and feeding logs.</p>
                       </div>
                     </div>
                     <Trash2 size={24} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                   </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'help':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Support Documentation</h2>
            <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm">
               <h3 className="text-2xl font-black mb-8 text-pink-600 tracking-tight">Operational Quick-Start Guide</h3>
               <div className="space-y-8">
                 {[
                   { step: 1, title: 'Log Consumption', desc: 'Use the pink "FEED NOW" button to record trough mass delivery.' },
                   { step: 2, title: 'Dynamic Estimation', desc: 'The system uses body-weight-to-ration algorithms to estimate individual share.' },
                   { step: 3, title: 'Manual Overrides', desc: 'Visually confirmed behavioral anomalies can be recorded during trough review.' },
                   { step: 4, title: 'Intake Thresholds', desc: 'Any animal falling below 85% of its metabolic requirement triggers an email alert.' },
                 ].map(item => (
                   <div key={item.step} className="flex gap-8 group">
                     <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl shrink-0 group-hover:bg-pink-600 transition-colors shadow-lg">
                       {item.step}
                     </div>
                     <div>
                       <p className="font-black text-xl text-slate-900 tracking-tight">{item.title}</p>
                       <p className="text-slate-500 font-medium mt-1 leading-relaxed">{item.desc}</p>
                     </div>
                   </div>
                 ))}
               </div>
               <div className="mt-12 p-8 bg-pink-50 rounded-[2rem] border border-pink-100 flex items-center justify-between">
                  <div>
                    <p className="font-black text-pink-900 text-lg tracking-tight uppercase">Technical Escalation</p>
                    <p className="text-sm font-bold text-pink-700 uppercase tracking-widest mt-1">Direct Contact: {ADMIN_EMAIL}</p>
                  </div>
                  <HelpCircle size={40} className="text-pink-300 opacity-50" />
               </div>
            </div>
          </div>
        );
      default:
        return <Dashboard pigs={state.pigs} onNavigate={setActiveView} />;
    }
  };

  return (
    <Layout activeView={activeView} setActiveView={setActiveView} user={state.currentUser}>
      {renderContent()}
    </Layout>
  );
};

export default App;
