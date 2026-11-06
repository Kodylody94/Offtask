/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Home, 
  Map, 
  Database, 
  Settings, 
  CheckCircle2, 
  Circle, 
  ExternalLink, 
  ChevronRight,
  TrendingUp,
  Brain,
  Users,
  Mic2,
  Copy,
  Plus,
  Trash2,
  Share,
  Sparkles,
  Loader2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useLocalStorage } from './hooks/useLocalStorage';
import { INITIAL_PLAN, INITIAL_EPISODES, RESOURCE_VAULT, type Phase, type Episode } from './data/planData';
import { validateEpisodeForOutline, formatEpisodeExportNotes } from './utils/episodeUtils';

// --- Utilities ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Images ---
const HERO_IMAGE = '/src/assets/images/podcast_hero_intellectual_1794001079015.jpg';
const LOGO_IMAGE = '/src/assets/images/off_task_brand_logo_1794001078496.jpg';
const GROWTH_IMAGE = '/src/assets/images/growth_lab_visual_1794001078552.jpg';

// --- Components ---

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      className="bg-orange-500 h-full"
    />
  </div>
);

const ViewContainer = ({ children, active }: { children: React.ReactNode, active: boolean }) => (
  <AnimatePresence mode="wait">
    {active && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="pb-24 pt-16 px-4 max-w-2xl mx-auto"
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

// --- App Content ---

export default function App() {
  const [activeView, setActiveView] = useState<'home' | 'roadmap' | 'episodes' | 'growth' | 'settings'>('home');
  const [plan, setPlan] = useLocalStorage<Phase[]>('off-task-plan', INITIAL_PLAN);
  const [episodes, setEpisodes] = useLocalStorage<Episode[]>('off-task-episodes', INITIAL_EPISODES);
  const [isDarkMode, setIsDarkMode] = useLocalStorage('dark-mode', false);
  const [generatingEpisodeId, setGeneratingEpisodeId] = useState<string | null>(null);
  const [outlineErrors, setOutlineErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3000);
  };

  // Stats
  const stats = useMemo(() => {
    const totalTasks = plan.reduce((acc, phase) => acc + phase.tasks.length, 0);
    const completedTasks = plan.reduce((acc, phase) => acc + phase.tasks.filter(t => t.completed).length, 0);
    const progress = Math.round((completedTasks / totalTasks) * 100);
    return { totalTasks, completedTasks, progress };
  }, [plan]);

  const toggleTask = (phaseId: string, taskId: string) => {
    setPlan(prev => prev.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          tasks: phase.tasks.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
          )
        };
      }
      return phase;
    }));
  };

  const copyToClipboard = (text: string, label = 'Copied to clipboard!') => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    showToast(label);
  };

  const addEpisode = () => {
    const newEpisode: Episode = {
      id: `e${Date.now()}`,
      title: 'New Episode Idea',
      description: '',
      talkingPoints: ['Core psychological concept', 'Real-world sociology example'],
      sociologyHooks: '',
      status: 'draft',
      scriptOutline: ''
    };
    setEpisodes(prev => [newEpisode, ...prev]);
    showToast('New episode outline created');
  };

  const deleteEpisode = (id: string) => {
    setEpisodes(prev => prev.filter(e => e.id !== id));
    showToast('Episode outline deleted');
  };

  const updateEpisode = (id: string, updates: Partial<Episode>) => {
    setEpisodes(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    if (outlineErrors[id]) {
      setOutlineErrors(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const exportEpisode = (episode: Episode) => {
    const text = formatEpisodeExportNotes(episode);
    copyToClipboard(text, `Exported "${episode.title}" to clipboard!`);
  };

  const generateScriptOutline = async (episode: Episode) => {
    const validation = validateEpisodeForOutline({
      title: episode.title,
      description: episode.description,
      sociologyHooks: episode.sociologyHooks,
      talkingPoints: episode.talkingPoints,
    });

    if (!validation.valid) {
      setOutlineErrors(prev => ({
        ...prev,
        [episode.id]: validation.error || 'Invalid episode details.',
      }));
      return;
    }

    setGeneratingEpisodeId(episode.id);
    setOutlineErrors(prev => {
      const next = { ...prev };
      delete next[episode.id];
      return next;
    });

    try {
      const response = await fetch('/api/episodes/generate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: episode.title,
          description: episode.description,
          sociologyHooks: episode.sociologyHooks,
          talkingPoints: episode.talkingPoints,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate script outline.');
      }

      updateEpisode(episode.id, { scriptOutline: data.scriptOutline });
      showToast('Script outline generated!');
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to reach the script outline service.';
      setOutlineErrors(prev => ({
        ...prev,
        [episode.id]: message,
      }));
    } finally {
      setGeneratingEpisodeId(null);
    }
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300 font-sans",
      isDarkMode ? "dark bg-slate-950 text-slate-100" : "bg-[#FDFCFB] text-slate-900"
    )}>
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200 dark:border-slate-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img src={LOGO_IMAGE} alt="Logo" className="w-8 h-8 rounded-lg" />
          <h1 className="text-sm font-bold tracking-tight">OFF TASK</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            {isDarkMode ? <Home size={20} /> : <Settings size={20} />}
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            role="status"
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2 rounded-xl text-xs font-bold shadow-lg"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Viewport */}
      <main>
        {/* HOME VIEW */}
        <ViewContainer active={activeView === 'home'}>
          <section className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] shadow-lg">
              <img src={HERO_IMAGE} alt="Hero" className="object-cover w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-5">
                <p className="text-orange-400 text-xs font-bold tracking-widest mb-1 uppercase">Mission Brief</p>
                <h2 className="text-white text-2xl font-bold leading-tight">Growth & Development Planner</h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Completion</p>
                <p className="text-2xl font-bold tabular-nums">{stats.progress}%</p>
                <div className="mt-2">
                  <ProgressBar progress={stats.progress} />
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Tasks Done</p>
                <p className="text-2xl font-bold tabular-nums">{stats.completedTasks}/{stats.totalTasks}</p>
                <p className="text-[10px] text-orange-500 mt-2 font-medium uppercase tracking-tighter">Action required</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold">Brand Core</h3>
              <div className="space-y-3">
                {[
                  { icon: Brain, label: 'Sociology & Psychology', color: 'text-blue-500' },
                  { icon: TrendingUp, label: 'Growth Oriented', color: 'text-orange-500' },
                  { icon: Users, label: 'Community Focused', color: 'text-green-500' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <item.icon className={cn("w-5 h-5", item.color)} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </ViewContainer>

        {/* ROADMAP VIEW */}
        <ViewContainer active={activeView === 'roadmap'}>
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Weekly Roadmap</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Step-by-step startup guide.</p>
            </div>

            {plan.map((phase) => (
              <div key={phase.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">{phase.title}</h3>
                  <span className="text-xs font-medium text-slate-400 tabular-nums">
                    {phase.tasks.filter(t => t.completed).length}/{phase.tasks.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {phase.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3",
                        task.completed 
                          ? "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60" 
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => toggleTask(phase.id, task.id)}
                        aria-label={`Toggle ${task.text}`}
                        className="mt-0.5 shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-orange-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => toggleTask(phase.id, task.id)}
                          className="text-left w-full"
                        >
                          <p className={cn("text-sm font-bold", task.completed && "line-through")}>{task.text}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{task.description}</p>
                        </button>
                        {task.resourceUrl && (
                          <a 
                            href={task.resourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-orange-500 uppercase tracking-wider hover:underline"
                          >
                            <ExternalLink size={12} />
                            {task.resourceName}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ViewContainer>

        {/* EPISODE PLANNER VIEW */}
        <ViewContainer active={activeView === 'episodes'}>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">Episode Planner</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Outline talking points & generate AI script structures.</p>
              </div>
              <button 
                onClick={addEpisode}
                aria-label="Add New Episode"
                className="p-3 bg-orange-500 text-white rounded-full shadow-lg active:scale-95 transition-transform"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {episodes.map((episode) => {
                const isGenerating = generatingEpisodeId === episode.id;
                const errorMsg = outlineErrors[episode.id];

                return (
                  <div key={episode.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <input 
                        type="text"
                        aria-label="Episode Title"
                        value={episode.title}
                        onChange={(e) => updateEpisode(episode.id, { title: e.target.value })}
                        className="bg-transparent border-none p-0 text-lg font-bold w-full focus:ring-0 placeholder-slate-300"
                        placeholder="Episode Title"
                      />
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => exportEpisode(episode)}
                          aria-label={`Export notes for ${episode.title}`}
                          title="Export Episode Notes"
                          className="p-2 text-slate-400 hover:text-orange-500 transition-colors"
                        >
                          <Share size={18} />
                        </button>
                        <button
                          onClick={() => deleteEpisode(episode.id)}
                          aria-label={`Delete ${episode.title}`}
                          title="Delete Episode"
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <textarea 
                      aria-label="Episode Description"
                      value={episode.description}
                      onChange={(e) => updateEpisode(episode.id, { description: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950/50 rounded-xl p-3 text-sm border-none focus:ring-1 focus:ring-orange-500/20 placeholder-slate-400 min-h-[80px]"
                      placeholder="Short description or thesis statement..."
                    />

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-blue-500">
                        <Brain size={14} />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Sociology Hooks</p>
                      </div>
                      <input 
                        type="text"
                        aria-label="Sociology Hooks"
                        value={episode.sociologyHooks}
                        onChange={(e) => updateEpisode(episode.id, { sociologyHooks: e.target.value })}
                        className="w-full bg-transparent border-b border-slate-100 dark:border-slate-800 pb-1 text-sm focus:border-orange-500 transition-colors"
                        placeholder="e.g. Impact of social media on empathy"
                      />
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Talking Points</p>
                      <div className="space-y-2">
                        {episode.talkingPoints.map((point, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                            <input 
                              type="text"
                              aria-label={`Talking point ${i + 1}`}
                              value={point}
                              placeholder="Enter talking point..."
                              onChange={(e) => {
                                const newPoints = [...episode.talkingPoints];
                                newPoints[i] = e.target.value;
                                updateEpisode(episode.id, { talkingPoints: newPoints });
                              }}
                              className="bg-transparent border-none p-0 text-sm w-full focus:ring-0"
                            />
                            <button 
                              onClick={() => {
                                const newPoints = episode.talkingPoints.filter((_, idx) => idx !== i);
                                updateEpisode(episode.id, { talkingPoints: newPoints });
                              }}
                              aria-label={`Remove talking point ${i + 1}`}
                              className="text-slate-300 hover:text-red-500 p-1"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => updateEpisode(episode.id, { talkingPoints: [...episode.talkingPoints, ''] })}
                          className="text-xs text-orange-500 font-bold flex items-center gap-1 mt-1"
                        >
                          <Plus size={14} /> ADD POINT
                        </button>
                      </div>
                    </div>

                    {/* Gemini Script Outline Generator */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                          <FileText size={14} className="text-orange-500" />
                          <span className="text-xs font-bold">Script Outline</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => generateScriptOutline(episode)}
                          disabled={isGenerating}
                          className={cn(
                            "px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0",
                            isGenerating
                              ? "bg-orange-500/70 text-white cursor-wait"
                              : "bg-orange-500 hover:bg-orange-600 text-white shadow-sm active:scale-[0.98]"
                          )}
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              Generating Outline...
                            </>
                          ) : (
                            <>
                              <Sparkles size={14} />
                              {episode.scriptOutline ? 'Regenerate Script Outline' : 'Generate Script Outline'}
                            </>
                          )}
                        </button>
                      </div>

                      {errorMsg && (
                        <div role="alert" className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-2 text-xs text-red-600 dark:text-red-300">
                          <AlertCircle size={15} className="shrink-0 mt-0.5" />
                          <span>{errorMsg}</span>
                        </div>
                      )}

                      {episode.scriptOutline && (
                        <div className="space-y-2">
                          <textarea
                            aria-label={`Script Outline for ${episode.title}`}
                            value={episode.scriptOutline}
                            onChange={(e) => updateEpisode(episode.id, { scriptOutline: e.target.value })}
                            rows={10}
                            className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs leading-relaxed font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-orange-500"
                          />
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => copyToClipboard(episode.scriptOutline || '', 'Script outline copied!')}
                              className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1.5"
                            >
                              <Copy size={12} />
                              Copy Script Outline
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      {(['draft', 'ready', 'recorded'] as const).map((status) => (
                        <button
                          key={status}
                          onClick={() => updateEpisode(episode.id, { status })}
                          className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter transition-all",
                            episode.status === status 
                              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" 
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                          )}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {episodes.length === 0 && (
                <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                  <Mic2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500">No episodes planned yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Tap the + button to start your first outline.</p>
                </div>
              )}
            </div>
          </div>
        </ViewContainer>

        {/* GROWTH LAB VIEW */}
        <ViewContainer active={activeView === 'growth'}>
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Growth Lab</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Leverage free tools for rapid expansion.</p>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
              <img src={GROWTH_IMAGE} alt="Growth" className="w-full h-32 object-cover" />
              <div className="p-4 bg-white dark:bg-slate-900">
                <h4 className="font-bold text-sm mb-1">The "Shorts-First" Strategy</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Podcast discovery is dead. Short-form video discovery is booming. Record your show, but launch your clips first.
                </p>
                <button 
                  onClick={() => copyToClipboard("OFF TASK: New sociology deep dive. Check the link in bio for the full episode! #psychology #sociology #offtask")}
                  className="w-full py-2 bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Copy size={14} />
                  COPY SOCIAL DRAFT
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg">Resource Vault</h3>
              <div className="grid grid-cols-1 gap-3">
                {RESOURCE_VAULT.map((resource, i) => (
                  <a
                    key={i}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between hover:border-orange-500/50 transition-colors"
                  >
                    <div>
                      <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">{resource.category}</p>
                      <p className="text-sm font-bold mt-1">{resource.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{resource.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </ViewContainer>

        {/* SETTINGS VIEW */}
        <ViewContainer active={activeView === 'settings'}>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-2">System</h2>
            
            <div className="space-y-3">
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">Dark Mode</p>
                  <p className="text-xs text-slate-500">Easier on the eyes at night.</p>
                </div>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={cn(
                    "w-12 h-6 rounded-full p-1 transition-colors duration-200",
                    isDarkMode ? "bg-orange-500" : "bg-slate-200"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 bg-white rounded-full transition-transform duration-200",
                    isDarkMode ? "translate-x-6" : "translate-x-0"
                  )} />
                </button>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">Offline Persistence</p>
                  <p className="text-xs text-slate-500">All data saved locally.</p>
                </div>
                <Database className="w-5 h-5 text-slate-300" />
              </div>

              <button 
                onClick={() => {
                  setPlan(INITIAL_PLAN);
                  setEpisodes(INITIAL_EPISODES);
                  showToast('Progress reset to defaults.');
                }}
                className="w-full p-4 text-red-500 text-sm font-bold border border-red-100 dark:border-red-900/30 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
              >
                RESET ALL PROGRESS
              </button>
            </div>

            <div className="pt-6 text-center">
              <p className="text-xs text-slate-400">Off Task Podcast Manager v1.1.0</p>
            </div>
          </div>
        </ViewContainer>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe px-4 flex items-center justify-around">
        {[
          { id: 'home', icon: Home, label: 'Home' },
          { id: 'roadmap', icon: Map, label: 'Roadmap' },
          { id: 'episodes', icon: Mic2, label: 'Episodes' },
          { id: 'growth', icon: TrendingUp, label: 'Growth' },
          { id: 'settings', icon: Settings, label: 'System' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id as any)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-16 h-16 transition-colors",
              activeView === item.id ? "text-orange-500" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            )}
          >
            <item.icon size={22} className={cn(activeView === item.id && "fill-orange-500/10")} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
            {activeView === item.id && (
              <motion.div 
                layoutId="nav-active"
                className="w-1 h-1 rounded-full bg-orange-500 absolute -top-1"
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
