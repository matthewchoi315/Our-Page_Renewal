
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { STAGES, TOTAL_ITEMS, ITEMS_PER_SECTION, MOTHER_TEACHINGS } from './constants';
import { MissionItem, MissionCategory } from './types';
import { generateStageImage } from './services/geminiService';
import { 
  Loader2,
  Layout,
  History,
  CheckCircle2,
  Flame,
  BookOpen,
  Heart,
  Tv,
  Sparkles
} from 'lucide-react';

const App: React.FC = () => {
  // --- States ---
  const [items, setItems] = useState<MissionItem[]>(() => {
    const saved = localStorage.getItem('faith_journey_items');
    if (saved) return JSON.parse(saved);
    
    const initialItems: MissionItem[] = [];
    const categories = [
      MissionCategory.PRAYER,
      MissionCategory.BIBLE_READING,
      MissionCategory.TRUTH_BOOK,
      MissionCategory.SERMON
    ];

    categories.forEach((cat, catIdx) => {
      for (let i = 1; i <= ITEMS_PER_SECTION; i++) {
        initialItems.push({
          id: catIdx * ITEMS_PER_SECTION + i,
          label: `${cat} ${i}`,
          category: cat,
          checked: false
        });
      }
    });
    return initialItems;
  });

  const [currentStageIndex, setCurrentStageIndex] = useState(() => {
    const saved = localStorage.getItem('faith_journey_stage');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [stageImages, setStageImages] = useState<Record<number, string>>(() => {
    const saved = localStorage.getItem('faith_journey_images');
    return saved ? JSON.parse(saved) : {};
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('faith_journey_items', JSON.stringify(items));
    localStorage.setItem('faith_journey_stage', currentStageIndex.toString());
    localStorage.setItem('faith_journey_images', JSON.stringify(stageImages));
  }, [items, currentStageIndex, stageImages]);

  // --- Image Generation ---
  const fetchImage = useCallback(async (stageIdx: number, force = false) => {
    if ((stageImages[stageIdx] && !force) || isGenerating) return;
    
    setIsGenerating(true);
    try {
      const img = await generateStageImage(STAGES[stageIdx].imagePrompt);
      if (img) {
        setStageImages(prev => ({ ...prev, [stageIdx]: img }));
      }
    } catch (err) {
      console.error("Image generation failed", err);
    } finally {
      setIsGenerating(false);
    }
  }, [stageImages, isGenerating]);

  useEffect(() => {
    if (!stageImages[currentStageIndex]) {
      fetchImage(currentStageIndex);
    }
  }, [currentStageIndex, fetchImage, stageImages]);

  // --- Calculations ---
  const checkedCount = items.filter(item => item.checked).length;
  const progressPercent = Math.round((checkedCount / TOTAL_ITEMS) * 100);

  const statsByCategory = useMemo(() => {
    const categories = [
      MissionCategory.PRAYER,
      MissionCategory.BIBLE_READING,
      MissionCategory.TRUTH_BOOK,
      MissionCategory.SERMON
    ];
    return categories.map(cat => {
      const catItems = items.filter(i => i.category === cat);
      const done = catItems.filter(i => i.checked).length;
      return {
        category: cat,
        done,
        percent: Math.round((done / catItems.length) * 100)
      };
    });
  }, [items]);

  const toggleItem = (id: number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const getCategoryIcon = (cat: MissionCategory) => {
    switch (cat) {
      case MissionCategory.PRAYER: return <Flame className="w-3.5 h-3.5 text-orange-400" />;
      case MissionCategory.BIBLE_READING: return <BookOpen className="w-3.5 h-3.5 text-blue-400" />;
      case MissionCategory.TRUTH_BOOK: return <Heart className="w-3.5 h-3.5 text-pink-400" />;
      case MissionCategory.SERMON: return <Tv className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 h-14 bg-white/80 backdrop-blur-md z-50 px-6 sm:px-12 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100">
             <Layout className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tighter leading-none flex items-center gap-1">
              Our <span className="text-indigo-600">Page</span>
            </h1>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Campus Evolution Tree</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-400 transition-all">
            <History className="w-3.5 h-3.5" />
          </button>
          <div className="bg-indigo-600 px-3.5 py-1.5 rounded-lg text-white flex items-center gap-1.5 shadow-lg shadow-indigo-100">
             <Sparkles className="w-2.5 h-2.5" />
             <span className="text-[9px] font-black uppercase tracking-widest">Stage {currentStageIndex + 1}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto pt-20 px-6 sm:px-12 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT COLUMN: Stage Image & Analytics */}
          <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-5">
            {/* Image Card */}
            <div className="relative aspect-square w-full rounded-[1.5rem] overflow-hidden shadow-lg bg-white border border-white">
              {stageImages[currentStageIndex] ? (
                <img 
                  src={stageImages[currentStageIndex]} 
                  className="w-full h-full object-cover animate-in fade-in duration-1000"
                  alt={STAGES[currentStageIndex].title}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  {isGenerating ? (
                    <div className="flex flex-col items-center gap-2.5">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-100" />
                      <span className="text-[7px] font-black text-slate-300 uppercase tracking-[0.3em]">Growing Campus...</span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => fetchImage(currentStageIndex, true)}
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black shadow-lg shadow-indigo-100 active:scale-95 transition-all"
                    >
                      Initialize Campus View
                    </button>
                  )}
                </div>
              )}

              {/* Overlays */}
              <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/50 to-transparent p-6">
                <p className="text-white text-center text-[9px] font-bold italic opacity-90 leading-relaxed drop-shadow-md max-w-xs mx-auto">
                  "{MOTHER_TEACHINGS[currentStageIndex % MOTHER_TEACHINGS.length]}"
                </p>
              </div>
              <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                 <div className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[7px] font-black text-white uppercase tracking-[0.2em] w-fit mb-2">
                   Growth Phase {currentStageIndex + 1}
                 </div>
                 <h2 className="text-3xl font-black text-white tracking-tighter mb-1.5">
                   {STAGES[currentStageIndex].title}
                 </h2>
                 <p className="text-white/70 text-[11px] font-medium leading-relaxed max-w-xs">
                   {STAGES[currentStageIndex].description}
                 </p>
              </div>
            </div>

            {/* Growth Analytics Card */}
            <div className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-md shadow-slate-200/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Growth Analytics</h3>
                <div className="text-2xl font-black text-indigo-600 tracking-tighter">{progressPercent}%</div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {statsByCategory.map((stat, i) => (
                  <div key={i} className="bg-slate-50/50 p-3 rounded-xl border border-slate-50">
                    <div className="text-[6px] font-black text-slate-300 uppercase tracking-widest mb-1.5 truncate">
                      {stat.category}
                    </div>
                    <div className="text-lg font-black text-slate-800 tracking-tighter">
                      {stat.percent}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Mission Dashboard (Super Compact) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Dashboard Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 px-1">
              <div>
                <h2 className="text-2xl font-black tracking-tighter text-slate-900">Mission Dashboard</h2>
                <p className="text-slate-400 text-[11px] mt-0.5 font-medium">Complete missions to reach the next stage.</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-slate-900 tracking-tighter leading-none">
                  {checkedCount} <span className="text-slate-200 text-xl mx-0.5">/</span> <span className="text-slate-300">120</span>
                </div>
                <div className="text-[8px] font-black text-indigo-600 uppercase tracking-widest mt-1">Total Points Earned</div>
              </div>
            </div>

            {/* Global Progress Bar */}
            <div className="px-1">
              <div className="h-1 w-full bg-white rounded-full overflow-hidden border border-slate-100">
                <div 
                  className="h-full bg-indigo-600 rounded-full transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Category Cards (Smaller & Tight) */}
            <div className="grid gap-3.5">
              {statsByCategory.map((stat) => (
                <div key={stat.category} className="bg-white rounded-[1.25rem] p-4 border border-slate-50 shadow-sm hover:shadow-lg hover:shadow-indigo-50/40 transition-all duration-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                        {getCategoryIcon(stat.category as MissionCategory)}
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight leading-none">{stat.category}</h3>
                        <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest mt-1">30 Missions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-slate-900 tracking-tighter leading-none">{stat.done}</div>
                      <div className="text-[6px] font-black text-slate-300 uppercase tracking-widest mt-0.5">Completed</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5">
                    {items.filter(i => i.category === stat.category).map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`
                          aspect-square rounded-md text-[9px] font-bold transition-all duration-200 active:scale-75
                          ${item.checked 
                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100 scale-95' 
                            : 'bg-slate-50/80 text-slate-400 border border-transparent hover:border-indigo-100 hover:text-indigo-600 hover:bg-white'}
                        `}
                      >
                        {item.checked ? <CheckCircle2 className="w-3 h-3" /> : idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Tools */}
            <div className="flex justify-center pt-2">
               <button 
                 onClick={() => { if(confirm("데이터를 초기화할까요?")) setItems(prev => prev.map(i => ({...i, checked: false}))); }}
                 className="px-5 py-1.5 bg-slate-100/50 text-slate-400 rounded-lg text-[7px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-95"
               >
                 Reset Progress
               </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
