'use client';

import React from 'react';
import { useStudioStore } from '@/lib/store';
import {
  Sparkles,
  Layers,
  Calendar,
  Settings,
  Sun,
  Moon,
  PlusCircle,
  Building2,
  Pencil,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    organization,
    subsidiaries,
    selectedSubsidiary,
    setSelectedSubsidiary,
    activeTab,
    setActiveTab,
    theme,
    toggleTheme,
    resetStudio,
    setSettingsOpen,
    setEditOrgModalOpen,
  } = useStudioStore();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Holding Org Info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    OmniBrand
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                    Studio
                  </span>
                </div>
                {/* Clickable Holding Org Name with Edit Icon */}
                <button
                  type="button"
                  onClick={() => setEditOrgModalOpen(true)}
                  className="group flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                  title="Click to rename parent company"
                >
                  <Building2 className="w-3 h-3 text-slate-400 group-hover:text-indigo-500" />
                  <span className="font-medium truncate max-w-[140px] sm:max-w-[190px]">
                    {organization.name}
                  </span>
                  <Pencil className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="inline-block w-1 h-1 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-emerald-500 font-semibold">{organization.plan}</span>
                </button>
              </div>
            </div>

            {/* Quick Subsidiary Dropdown */}
            <div className="hidden md:flex items-center pl-4 border-l border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 mr-2 font-medium">Brand:</span>
              <div className="relative">
                <select
                  value={selectedSubsidiary.id}
                  onChange={(e) => {
                    const found = subsidiaries.find((s) => s.id === e.target.value);
                    if (found) setSelectedSubsidiary(found);
                  }}
                  className="text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all"
                >
                  {subsidiaries.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
                <div
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full pointer-events-none"
                  style={{ backgroundColor: selectedSubsidiary.primaryColor }}
                />
              </div>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 p-1 bg-slate-100 dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'studio'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'calendar'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Content Calendar</span>
            </button>

            <button
              onClick={() => setActiveTab('brands')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'brands'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Subsidiaries ({subsidiaries.length})</span>
            </button>
          </nav>

          {/* Right Actions: New Post, Theme toggle, Settings */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={resetStudio}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-sm hover:shadow-indigo-500/20 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Post</span>
            </button>

            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setSettingsOpen(true)}
              aria-label="Settings"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
