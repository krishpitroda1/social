'use client';

import React from 'react';
import { useStudioStore } from '@/lib/store';
import { Subsidiary } from '@/types';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Share2,
  Globe,
  Palette,
  Users,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  Pencil,
  Plus,
} from 'lucide-react';

export const Step1BrandSelector: React.FC = () => {
  const {
    subsidiaries,
    selectedSubsidiary,
    setSelectedSubsidiary,
    setEditSubsidiaryModalOpen,
    setActiveTab,
    nextStep,
  } = useStudioStore();

  const handleSelect = (sub: Subsidiary) => {
    setSelectedSubsidiary(sub);
  };

  const handleEditClick = (e: React.MouseEvent, sub: Subsidiary) => {
    e.stopPropagation();
    setEditSubsidiaryModalOpen(true, sub);
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-2">
            <span>Step 1 of 5</span>
            <span>•</span>
            <span>Tenant Multi-Brand Hierarchy</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Select Subsidiary Brand
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Choose which holding entity brand you are orchestrating campaigns for. You can rename companies, change colors, or adjust tone directives anytime using the edit icon.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-center">
          <button
            onClick={() => setActiveTab('brands')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Brand</span>
          </button>

          <button
            onClick={nextStep}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/25 transition-all"
          >
            <span>Continue to Platform</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Subsidiary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {subsidiaries.map((sub) => {
          const isSelected = selectedSubsidiary.id === sub.id;

          return (
            <div
              key={sub.id}
              onClick={() => handleSelect(sub)}
              className={`relative group rounded-2xl p-6 transition-all duration-300 cursor-pointer border ${
                isSelected
                  ? 'bg-white dark:bg-slate-900/95 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500/20'
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
              }`}
            >
              {/* Action Badges: Edit & Active */}
              <div className="absolute top-4 right-4 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={(e) => handleEditClick(e, sub)}
                  className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-600 dark:text-slate-300 hover:text-indigo-600 text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700"
                  title="Rename or Edit Company Details"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Edit</span>
                </button>

                {isSelected && (
                  <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-indigo-600 text-white text-xs font-semibold shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </div>
                )}
              </div>

              {/* Card Header: Logo, Name, Tagline */}
              <div className="flex items-start space-x-4">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 shadow-sm">
                  <img
                    src={sub.logoUrl}
                    alt={sub.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1"
                    style={{ backgroundColor: sub.primaryColor }}
                  />
                </div>

                <div className="flex-1 pr-24 sm:pr-32">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {sub.tagline}
                  </p>
                </div>
              </div>

              {/* Brand Tone Capsule */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Tone: {sub.brandTone}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {sub.toneKeywords.slice(0, 4).map((kw, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Color Palette & Audience & Connected Accounts */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Palette */}
                <div className="flex items-center space-x-1.5">
                  <Palette className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] text-slate-400">Palette:</span>
                  <div className="flex items-center space-x-1">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 dark:border-white/10"
                      style={{ backgroundColor: sub.primaryColor }}
                      title={`Primary: ${sub.primaryColor}`}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 dark:border-white/10"
                      style={{ backgroundColor: sub.secondaryColor }}
                      title={`Secondary: ${sub.secondaryColor}`}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 dark:border-white/10"
                      style={{ backgroundColor: sub.accentColor }}
                      title={`Accent: ${sub.accentColor}`}
                    />
                  </div>
                </div>

                {/* Connected Channels Badges */}
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-400">Connected:</span>
                  <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                    <Instagram className="w-3.5 h-3.5 text-pink-500" />
                    <Linkedin className="w-3.5 h-3.5 text-blue-500" />
                    <Twitter className="w-3.5 h-3.5 text-sky-400" />
                    <Facebook className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-full">
                    {sub.activeAccountsCount || 3} Active
                  </span>
                </div>
              </div>

              {/* Action Button inside card */}
              <div className="mt-4">
                <button
                  type="button"
                  className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{isSelected ? 'Configured & Active' : 'Select This Subsidiary'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
