
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { STAGES, TOTAL_ITEMS, ITEMS_PER_SECTION, MOTHER_TEACHINGS } from './constants';
import { MissionItem, MissionCategory } from './types';
import { generateStageImage } from './services/geminiService';
import { 
  Loader2,
  Layout,
  CheckCircle2,
  Flame,
  BookOpen,
  Heart,
  Tv,
  Sparkles,
  Trophy
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
  const [showLevelUp, setShowLevelUp] = useState(false);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('faith_journey_items', JSON.stringify(items));
    localStorage.setItem('faith_journey_stage', currentStageIndex.toString());
    localStorage.setItem('faith_journey_images', JSON.stringify(stageImages));
  }, [items, currentStageIndex, stageImages]);

  // --- Automatic Level Up Logic ---
  const checkedCount = items.filter(item => item.checked).length;
  
  useEffect(() => {
    if (checkedCount === TOTAL_ITEMS && currentStageIndex < STAGES.length - 1) {
      const timer = setTimeout(() => {
        setShowLevelUp(true);
        setCurrentStageIndex(prev => prev + 1);
        setItems(prev => prev.map(item => ({ ...item, checked: false })));
        setTimeout(() => setShowLevelUp(false), 3000);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [checkedCount, currentStageIndex]);

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
    <div className="h-screen w-screen bg-[#F8FAFC] text-[#1E293B] font-sans overflow-hidden flex flex-col">
      {/* Level Up Overlay */}
      {showLevelUp && (
        <div className="fixed inset-0 z-[100] bg-indigo-600/95 backdrop-blur-2xl flex flex-col items-center justify-center text-white animate-in fade-in zoom-in duration-500 text-center px-4">
           <Trophy className="w-24 h-24 mb-6 animate-bounce text-yellow-300" />
           <h2 className="text-6xl font-black tracking-tighter mb-2 uppercase">Stage Cleared!</h2>
           <p className="text-2xl font-bold opacity-90 uppercase tracking-[0.2em]">Next Evolution Starting</p>
        </div>
      )}

      {/* Header */}
      <header className="h-14 bg-white z-50 px-8 flex items-center justify-between border-b border-slate-100 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
             <Layout className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-black tracking-tighter leading-none uppercase">
            OUR <span className="text-indigo-600">PAGE</span>
          </h1>
        </div>
        <div className="bg-indigo-600 px-4 py-1.5 rounded-full text-white flex items-center gap-2 shadow-lg">
           <Sparkles className="w-3.5 h-3.5" />
           <span className="text-xs font-black uppercase tracking-widest">Stage {currentStageIndex + 1}</span>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-4 lg:p-6">
        <div className="max-w-7xl mx-auto h-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT: Growth Focus */}
          <div className="lg:col-span-4 flex flex-col gap-5 min-h-0">
            {/* Stage Image */}
            <div className="relative h-[60%] rounded-2xl overflow-hidden shadow-lg bg-white border border-slate-100 flex-shrink-0">
              {stageImages[currentStageIndex] ? (
                <img 
                  src={stageImages[currentStageIndex]} 
                  className="w-full h-full object-cover animate-in fade-in duration-1000"
                  alt={STAGES[currentStageIndex].title}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50">
                  {isGenerating ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 animate-spin text-indigo-300" />
                      <span className="text-xs font-black text-indigo-300 uppercase animate-pulse">Growing Image...</span>
                    </div>
                  ) : (
                    <button onClick={() => fetchImage(currentStageIndex, true)} className="text-xs font-black text-indigo-500 bg-white border-2 border-indigo-100 px-6 py-3 rounded-xl shadow-sm hover:bg-indigo-50 transition-colors">GENERATE NEW IMAGE</button>
                  )}
                </div>
              )}
              
              {/* TOP: Teaching */}
              <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-5">
                 <p className="text-white text-center text-[13px] font-black italic leading-snug drop-shadow-xl opacity-100 px-2 line-clamp-3">
                   "{MOTHER_TEACHINGS[currentStageIndex % MOTHER_TEACHINGS.length]}"
                 </p>
              </div>

              {/* BOTTOM: Title */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6">
                 <h2 className="text-3xl font-black text-white tracking-tighter leading-none mb-2">{STAGES[currentStageIndex].title}</h2>
                 <p className="text-white/80 text-[11px] font-bold leading-relaxed line-clamp-2 max-w-[90%]">{STAGES[currentStageIndex].description}</p>
              </div>
            </div>

            {/* Growth Status */}
            <div className="h-[40%] bg-white rounded-2xl p-5 border border-slate-100 shadow-md flex flex-col flex-shrink-0">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth Analytics</h3>
                <div className="text-3xl font-black text-indigo-600 tracking-tighter leading-none">{progressPercent}%</div>
              </div>
              
              <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
                {statsByCategory.map((stat, i) => (
                  <div key={i} className="bg-slate-50/80 p-3.5 rounded-2xl flex flex-col justify-center border border-slate-100">
                    <div className="text-[9px] font-black text-slate-400 uppercase mb-1.5 tracking-tight">{stat.category.split(' ')[0]}</div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-slate-800 leading-none tracking-tighter">{stat.percent}</span>
                      <span className="text-xs font-black text-slate-400">%</span>
                    </div>
                    <div className="mt-3 w-full h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 transition-all duration-1000 ease-out" style={{ width: `${stat.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Compact Mission Dashboard (Fixed Sermon overflow) */}
          <div className="lg:col-span-8 flex flex-col gap-4 min-h-0"> {/* Adjusted gap from 3 to 4 for more space */}
            {/* Header & Global Progress */}
            <div className="flex flex-col gap-3 flex-shrink-0 px-2"> {/* Removed mb-1 to distribute height better */}
              <div className="flex items-end justify-between">
                <div className="flex flex-col">
                  <h2 className="text-2xl font-black tracking-tighter text-slate-900 leading-none">Mission Dashboard</h2>
                  <span className="text-[10px] font-black text-indigo-400 uppercase mt-2 tracking-[0.15em]">Stage {currentStageIndex + 1} Progress</span>
                </div>
                <div className="text-right leading-none">
                  <span className="text-3xl font-black text-slate-900 tracking-tighter">{checkedCount}</span>
                  <span className="text-slate-300 text-xl mx-2 font-light">/</span>
                  <span className="text-xl font-black text-slate-300">120</span>
                </div>
              </div>
              
              <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-50">
                <div className="absolute inset-y-0 left-0 bg-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-md" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            {/* Mission Grids - Slightly adjusted padding/gap to prevent Sermon cutoff */}
            <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-hidden"> {/* Adjusted gap from 2 to 3 */}
              {statsByCategory.map((stat) => (
                <div key={stat.category} className="flex-1 bg-white rounded-2xl px-5 py-3 border border-slate-50 shadow-sm flex flex-col justify-center transition-all hover:shadow-md"> {/* Adjusted py from 2.5 to 3 */}
                  <div className="flex items-center justify-between mb-2"> {/* Adjusted mb from 1.5 to 2 */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-indigo-50/50 rounded-xl flex items-center justify-center shadow-inner">
                        {getCategoryIcon(stat.category as MissionCategory)}
                      </div>
                      <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-wide">{stat.category}</h3>
                    </div>
                    <div className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-3 py-0.5 rounded-full tracking-tighter shadow-sm">{stat.done} / 30</div>
                  </div>

                  <div className="grid grid-cols-10 sm:grid-cols-15 gap-1.5">
                    {items.filter(i => i.category === stat.category).map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`
                          aspect-square rounded-md text-[10px] font-black transition-all flex items-center justify-center
                          ${item.checked 
                            ? 'bg-indigo-600 text-white shadow-md transform scale-105 ring-2 ring-indigo-200' 
                            : 'bg-slate-50 text-slate-500 hover:bg-white hover:border-indigo-200 border border-transparent shadow-sm'}
                        `}
                      >
                        {item.checked ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Utilities */}
            <div className="flex items-center justify-between px-3 py-1 flex-shrink-0 mt-1"> {/* Adjusted mt from 0 to 1 */}
               <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                 Local Cloud Save Active
               </div>
               <button 
                 onClick={() => { if(confirm("모든 데이터를 초기화하시겠습니까?")) setItems(prev => prev.map(i => ({...i, checked: false}))); }}
                 className="text-[10px] font-black text-slate-400 uppercase hover:text-rose-500 transition-colors tracking-widest underline underline-offset-4"
               >
                 Reset Progress
               </button>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @media (min-width: 640px) {
          .sm\\:grid-cols-15 { grid-template-columns: repeat(15, minmax(0, 1fr)); }
        }
      `}</style>
    </div>
  );
};

export default App;
