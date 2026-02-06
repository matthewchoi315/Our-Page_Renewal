
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { STAGES, TOTAL_ITEMS, ITEMS_PER_SECTION, MOTHER_TEACHINGS } from './constants';
import { MissionItem, MissionCategory } from './types';
import { generateStageImage } from './services/geminiService';
import { 
  BookOpen, 
  Flame, 
  Heart,
  Sparkles,
  Loader2,
  RefreshCw,
  Tv,
  History,
  X,
  ChevronLeft,
  ChevronRight,
  Layout,
  Trophy,
  ArrowUpRight
} from 'lucide-react';

const App: React.FC = () => {
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
  const [showHistory, setShowHistory] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(0);

  useEffect(() => {
    localStorage.setItem('faith_journey_items', JSON.stringify(items));
    localStorage.setItem('faith_journey_stage', currentStageIndex.toString());
    localStorage.setItem('faith_journey_images', JSON.stringify(stageImages));
  }, [items, currentStageIndex, stageImages]);

  const dailyQuote = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    return MOTHER_TEACHINGS[day % MOTHER_TEACHINGS.length];
  }, []);

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
        total: catItems.length,
        percent: Math.round((done / catItems.length) * 100)
      };
    });
  }, [items]);

  useEffect(() => {
    if (checkedCount === TOTAL_ITEMS && currentStageIndex < STAGES.length - 1) {
      const timer = setTimeout(() => {
        const nextStage = currentStageIndex + 1;
        setCurrentStageIndex(nextStage);
        setItems(prev => prev.map(i => ({ ...i, checked: false })));
        alert(`Congratulations! You have grown to Stage ${nextStage + 1}: ${STAGES[nextStage].title}!`);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [checkedCount, currentStageIndex]);

  const fetchImage = useCallback(async (stageIdx: number) => {
    if (stageImages[stageIdx] || isGenerating) return;
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
    fetchImage(currentStageIndex);
  }, [currentStageIndex]);

  const toggleItem = (id: number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const getCategoryIcon = (cat: MissionCategory) => {
    switch (cat) {
      case MissionCategory.PRAYER: return <Flame className="w-5 h-5 text-orange-400" />;
      case MissionCategory.BIBLE_READING: return <BookOpen className="w-5 h-5 text-blue-400" />;
      case MissionCategory.TRUTH_BOOK: return <Heart className="w-5 h-5 text-pink-400" />;
      case MissionCategory.SERMON: return <Tv className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter leading-none">Our <span className="text-indigo-600">Page</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 hidden sm:block">Campus Evolution Tree</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setHistoryIndex(currentStageIndex); setShowHistory(true); }}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
            >
              <History className="w-5 h-5" />
            </button>
            <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-[11px] font-black text-indigo-700 uppercase tracking-wider">Stage {currentStageIndex + 1}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
          
          {/* LEFT: Campus View (Fixed on Desktop) */}
          <div className="w-full lg:w-[45%] lg:sticky lg:top-36 space-y-8">
            <div className="relative group">
              <div className="aspect-square bg-slate-50 rounded-[3rem] overflow-hidden shadow-2xl shadow-indigo-100/50 border border-white">
                {isGenerating && !stageImages[currentStageIndex] ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                    <Loader2 className="w-12 h-12 animate-spin mb-4 opacity-30" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Creating your campus...</p>
                  </div>
                ) : stageImages[currentStageIndex] ? (
                  <img 
                    src={stageImages[currentStageIndex]} 
                    alt={STAGES[currentStageIndex].title} 
                    className="w-full h-full object-cover animate-in fade-in duration-1000 group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <button 
                      onClick={() => fetchImage(currentStageIndex)}
                      className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black shadow-xl shadow-indigo-100 transition-all active:scale-95"
                    >
                      Initialize Campus View
                    </button>
                  </div>
                )}
                
                {/* Image Overlays */}
                <div className="absolute top-0 left-0 right-0 p-10 bg-gradient-to-b from-black/40 to-transparent">
                  <p className="text-white text-center text-sm font-medium italic leading-relaxed drop-shadow-lg">
                    "{dailyQuote}"
                  </p>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md text-[9px] font-black text-white rounded-full uppercase tracking-wider">Growth Phase {currentStageIndex + 1}</span>
                  </div>
                  <h2 className="text-white text-3xl font-black tracking-tight drop-shadow-xl">{STAGES[currentStageIndex].title}</h2>
                  <p className="text-white/80 text-sm font-medium mt-2 drop-shadow-md">{STAGES[currentStageIndex].description}</p>
                </div>
              </div>
            </div>

            {/* Desktop Quick Stats */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hidden lg:block">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Growth Analytics</h4>
                <div className="text-2xl font-black text-indigo-600">{progressPercent}%</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {statsByCategory.map((stat, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-300 uppercase mb-1">{stat.category}</div>
                    <div className="text-lg font-black text-slate-800">{stat.percent}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Mission Control Dashboard */}
          <div className="w-full lg:w-[55%] space-y-12">
            <header className="flex items-center justify-between px-2">
              <div>
                <h2 className="text-3xl font-black tracking-tighter">Mission Dashboard</h2>
                <p className="text-slate-400 text-sm mt-1">Complete 120 steps to reach the next stage.</p>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-3xl font-black text-slate-900">{checkedCount}<span className="text-slate-200 ml-1">/ {TOTAL_ITEMS}</span></div>
                <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Total Points Earned</div>
              </div>
            </header>

            {/* Main Progress Bar */}
            <div className="px-2">
              <div className="w-full h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 relative">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Category Sections */}
            <div className="grid gap-8">
              {[
                MissionCategory.PRAYER,
                MissionCategory.BIBLE_READING,
                MissionCategory.TRUTH_BOOK,
                MissionCategory.SERMON
              ].map((cat) => {
                const catItems = items.filter(i => i.category === cat);
                const done = catItems.filter(i => i.checked).length;
                return (
                  <section key={cat} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-500">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                          {getCategoryIcon(cat)}
                        </div>
                        <div>
                          <h3 className="font-black text-slate-800 text-base uppercase tracking-wider">{cat}</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{ITEMS_PER_SECTION} Missions for this phase</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-slate-900 leading-none">{done}</div>
                        <div className="text-[9px] font-black text-slate-300 uppercase mt-1 tracking-tighter">Completed</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5">
                      {catItems.map((item, idx) => (
                        <button
                          key={item.id}
                          onClick={() => toggleItem(item.id)}
                          className={`
                            aspect-square rounded-xl flex items-center justify-center text-[11px] font-black transition-all duration-300 active:scale-75
                            ${item.checked 
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-95' 
                              : 'bg-slate-50 text-slate-300 border border-slate-100 hover:border-indigo-200 hover:text-indigo-400 hover:bg-white'}
                          `}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>

            {/* Footer Utilities */}
            <footer className="pt-10 pb-20 flex flex-col items-center gap-8 border-t border-slate-50">
               <button 
                 onClick={() => { if(window.confirm("초기화하시겠습니까?")) setItems(prev => prev.map(i => ({...i, checked: false}))); }}
                 className="flex items-center gap-2 text-[10px] font-black text-slate-300 hover:text-rose-500 transition-colors uppercase tracking-widest"
               >
                 <RefreshCw className="w-3 h-3" />
                 Clear Stage Data
               </button>
               
               <div className="flex flex-col items-center text-center opacity-20">
                  <Layout className="w-8 h-8 mb-4" />
                  <p className="text-[9px] font-black uppercase tracking-[0.5em]">2024 • Our Page • Designed for Campus Growth</p>
               </div>
            </footer>
          </div>
        </div>
      </main>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[3.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 relative flex flex-col md:flex-row h-[80vh] max-h-[800px]">
            <button 
              onClick={() => setShowHistory(false)} 
              className="absolute top-8 right-8 p-3 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl z-10 transition-all active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-full md:w-1/2 bg-slate-100 relative overflow-hidden">
              {stageImages[historyIndex] ? (
                <img src={stageImages[historyIndex]} className="w-full h-full object-cover" alt={`Stage ${historyIndex + 1}`} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 p-12 text-center">
                  <Loader2 className="w-12 h-12 animate-spin mb-4 opacity-10" />
                  <span className="text-xs font-black uppercase tracking-widest">Stage yet to be unlocked</span>
                </div>
              )}
            </div>

            <div className="w-full md:w-1/2 p-12 md:p-20 flex flex-col justify-between bg-white overflow-y-auto">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full mb-6">
                   <Sparkles className="w-3 h-3" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Evolution Phase {historyIndex + 1}</span>
                </div>
                <h3 className="text-4xl font-black tracking-tighter text-slate-900 mb-6 leading-tight">{STAGES[historyIndex].title}</h3>
                <p className="text-slate-500 text-base leading-relaxed">{STAGES[historyIndex].description}</p>
              </div>

              <div className="mt-12">
                 <div className="flex items-center justify-between mb-8">
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Timeline Navigator</div>
                    <div className="text-2xl font-black tracking-tighter">
                      <span className="text-indigo-600">{historyIndex + 1}</span>
                      <span className="text-slate-100 mx-2">/</span>
                      <span className="text-slate-300">{currentStageIndex + 1}</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <button 
                      disabled={historyIndex === 0} 
                      onClick={() => setHistoryIndex(prev => prev - 1)} 
                      className="flex-1 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 disabled:opacity-20 active:scale-95 transition-all"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                      disabled={historyIndex === currentStageIndex} 
                      onClick={() => setHistoryIndex(prev => prev + 1)} 
                      className="flex-1 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 disabled:opacity-20 active:scale-95 transition-all"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
