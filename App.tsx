
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
      case MissionCategory.PRAYER: return <Flame className="w-3 h-3 text-orange-400" />;
      case MissionCategory.BIBLE_READING: return <BookOpen className="w-3 h-3 text-blue-400" />;
      case MissionCategory.TRUTH_BOOK: return <Heart className="w-3 h-3 text-pink-400" />;
      case MissionCategory.SERMON: return <Tv className="w-3 h-3 text-purple-400" />;
    }
  };

  return (
    <div className="h-screen w-screen bg-[#F8FAFC] text-[#1E293B] font-sans overflow-hidden flex flex-col">
      {/* Level Up Overlay */}
      {showLevelUp && (
        <div className="fixed inset-0 z-[100] bg-indigo-600/95 backdrop-blur-2xl flex flex-col items-center justify-center text-white animate-in fade-in zoom-in duration-500 text-center px-4">
           <Trophy className="w-20 h-20 mb-6 animate-bounce" />
           <h2 className="text-5xl font-black tracking-tighter mb-2 uppercase">Phase Cleared!</h2>
           <p className="text-xl font-medium opacity-80 uppercase tracking-widest">Evolving to Next Stage</p>
        </div>
      )}

      {/* Header */}
      <header className="h-12 bg-white z-50 px-6 flex items-center justify-between border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center shadow-sm">
             <Layout className="w-3 h-3 text-white" />
          </div>
          <h1 className="text-sm font-black tracking-tighter leading-none uppercase">
            OUR <span className="text-indigo-600">PAGE</span>
          </h1>
        </div>
        <div className="bg-indigo-600 px-3 py-1 rounded text-white flex items-center gap-1.5 shadow-md">
           <Sparkles className="w-2.5 h-2.5" />
           <span className="text-[10px] font-black uppercase tracking-widest">Stage {currentStageIndex + 1}</span>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-4 lg:p-6">
        <div className="max-w-7xl mx-auto h-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* LEFT: Growth Focus */}
          <div className="lg:col-span-4 flex flex-col gap-4 min-h-0">
            {/* Stage Image */}
            <div className="relative h-[60%] rounded-2xl overflow-hidden shadow-sm bg-white border border-slate-100">
              {stageImages[currentStageIndex] ? (
                <img 
                  src={stageImages[currentStageIndex]} 
                  className="w-full h-full object-cover animate-in fade-in duration-700"
                  alt={STAGES[currentStageIndex].title}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {isGenerating ? <Loader2 className="w-6 h-6 animate-spin text-indigo-100" /> : <button onClick={() => fetchImage(currentStageIndex, true)} className="text-[10px] font-bold text-indigo-400 bg-indigo-50 px-4 py-2 rounded-lg">GENERATE IMAGE</button>}
                </div>
              )}
              
              {/* TOP: Teaching */}
              <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-black/70 to-transparent p-4">
                 <p className="text-white text-center text-[11px] font-bold italic leading-tight drop-shadow-md opacity-95 px-4 line-clamp-2">
                   "{MOTHER_TEACHINGS[currentStageIndex % MOTHER_TEACHINGS.length]}"
                 </p>
              </div>

              {/* BOTTOM: Title */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-5">
                 <h2 className="text-2xl font-black text-white tracking-tighter leading-none mb-1.5">{STAGES[currentStageIndex].title}</h2>
                 <p className="text-white/70 text-[10px] font-medium leading-relaxed line-clamp-2">{STAGES[currentStageIndex].description}</p>
              </div>
            </div>

            {/* Growth Status */}
            <div className="h-[40%] bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Growth Analytics</h3>
                <div className="text-2xl font-black text-indigo-600 tracking-tighter leading-none">{progressPercent}%</div>
              </div>
              
              <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
                {statsByCategory.map((stat, i) => (
                  <div key={i} className="bg-slate-50/70 p-3 rounded-xl flex flex-col justify-center border border-slate-100/50">
                    <div className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-tight">{stat.category.split(' ')[0]} Status</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-800 leading-none">{stat.percent}</span>
                      <span className="text-[10px] font-bold text-slate-400">%</span>
                    </div>
                    <div className="mt-2 w-full h-1 bg-slate-200/50 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 transition-all duration-700" style={{ width: `${stat.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Compact Mission Dashboard */}
          <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">
            {/* Header & Global Progress */}
            <div className="flex flex-col gap-3 flex-shrink-0 px-1">
              <div className="flex items-end justify-between">
                <div className="flex flex-col">
                  <h2 className="text-xl font-black tracking-tighter text-slate-900 leading-none">Mission Dashboard</h2>
                  <span className="text-[9px] font-black text-slate-300 uppercase mt-1.5 tracking-widest">Evolution goal: 120/120</span>
                </div>
                <div className="text-right leading-none">
                  <span className="text-2xl font-black text-slate-900 tracking-tighter">{checkedCount}</span>
                  <span className="text-slate-300 text-lg mx-1.5">/</span>
                  <span className="text-lg font-bold text-slate-300">120</span>
                </div>
              </div>
              
              <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-50">
                <div className="absolute inset-y-0 left-0 bg-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-sm" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            {/* Mission Grids */}
            <div className="flex-1 flex flex-col gap-3 min-h-0">
              {statsByCategory.map((stat) => (
                <div key={stat.category} className="flex-1 bg-white rounded-2xl px-4 py-3 border border-slate-50 shadow-sm flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-slate-50 rounded-lg flex items-center justify-center shadow-sm">
                        {getCategoryIcon(stat.category as MissionCategory)}
                      </div>
                      <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-wide">{stat.category}</h3>
                    </div>
                    <div className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full tracking-tighter">{stat.done} / 30</div>
                  </div>

                  <div className="grid grid-cols-10 sm:grid-cols-15 gap-1.5">
                    {items.filter(i => i.category === stat.category).map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`
                          aspect-square rounded-[4px] text-[9px] font-black transition-all flex items-center justify-center
                          ${item.checked 
                            ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-600/20' 
                            : 'bg-slate-50 text-slate-400 hover:bg-white hover:border-indigo-200 border border-transparent shadow-sm'}
                        `}
                      >
                        {item.checked ? <CheckCircle2 className="w-3 h-3" /> : idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Utilities */}
            <div className="flex items-center justify-between px-2 flex-shrink-0">
               <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">Encrypted local persistence active</div>
               <button 
                 onClick={() => { if(confirm("데이터를 초기화하시겠습니까?")) setItems(prev => prev.map(i => ({...i, checked: false}))); }}
                 className="text-[9px] font-black text-slate-300 uppercase hover:text-rose-500 transition-colors tracking-widest underline underline-offset-4 decoration-slate-100"
               >
                 Reset All Progress
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
