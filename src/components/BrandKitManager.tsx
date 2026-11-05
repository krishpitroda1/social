'use client';

import React, { useState } from 'react';
import { useStudioStore } from '@/lib/store';
import { Subsidiary } from '@/types';
import {
  Layers,
  Plus,
  Sparkles,
  Building2,
  CheckCircle2,
  Palette,
  ExternalLink,
  Users,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  Pencil,
  Trash2,
} from 'lucide-react';

export const BrandKitManager: React.FC = () => {
  const {
    organization,
    subsidiaries,
    selectedSubsidiary,
    setSelectedSubsidiary,
    addBrand,
    setEditSubsidiaryModalOpen,
    setEditOrgModalOpen,
    setActiveTab,
  } = useStudioStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [brandTone, setBrandTone] = useState('Visionary & Minimalist');
  const [toneKeywordsStr, setToneKeywordsStr] = useState('futuristic, clean, cinematic');
  const [primaryColor, setPrimaryColor] = useState('#6366F1');
  const [secondaryColor, setSecondaryColor] = useState('#EC4899');
  const [accentColor, setAccentColor] = useState('#10B981');
  const [targetAudience, setTargetAudience] = useState('Modern Creative Pioneers');
  const [logoUrl, setLogoUrl] = useState(
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80'
  );

  const handleCreateBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const keywords = toneKeywordsStr
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const newBrand: Subsidiary = {
      id: `sub-${Date.now()}`,
      organizationId: organization.id,
      name: name.trim(),
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      tagline: tagline.trim() || 'Modern enterprise brand',
      brandTone: brandTone.trim(),
      toneKeywords: keywords.length > 0 ? keywords : ['innovative', 'sleek'],
      primaryColor,
      secondaryColor,
      accentColor,
      logoUrl:
        logoUrl.trim() ||
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      websiteUrl: `https://${name.toLowerCase().replace(/[^a-z0-9]+/g, '')}.internal`,
      targetAudience: targetAudience.trim() || 'General Consumers',
      activeAccountsCount: 3,
    };

    addBrand(newBrand);
    setIsAddModalOpen(false);

    setName('');
    setTagline('');
  };

  return (
    <div className="space-y-6">
      {/* Holding Parent Org Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-pink-50/40 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-md shadow-indigo-600/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                Holding Parent Company
              </span>
              <span className="text-xs text-emerald-500 font-semibold">{organization.plan}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {organization.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Governs {subsidiaries.length} active child brands across global social distribution
            </p>
          </div>
        </div>

        <button
          onClick={() => setEditOrgModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
        >
          <Pencil className="w-3.5 h-3.5 text-indigo-500" />
          <span>Rename Parent Company</span>
        </button>
      </div>

      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Subsidiary Brand Portfolio ({subsidiaries.length})
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Rename existing companies, customize tone directives, update colors, or add new child entities.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subsidiary Brand</span>
        </button>
      </div>

      {/* Brand Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subsidiaries.map((sub) => {
          const isSelected = selectedSubsidiary.id === sub.id;

          return (
            <div
              key={sub.id}
              className={`p-6 rounded-2xl border transition-all bg-white dark:bg-slate-900 ${
                isSelected
                  ? 'border-indigo-500 shadow-xl ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3.5">
                  <img
                    src={sub.logoUrl}
                    alt={sub.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                  />
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {sub.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {sub.tagline}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditSubsidiaryModalOpen(true, sub)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors"
                    title="Rename or Edit Brand"
                  >
                    <Pencil className="w-3 h-3 text-indigo-500" />
                    <span>Edit Brand</span>
                  </button>

                  {isSelected && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                      CURRENT
                    </span>
                  )}
                </div>
              </div>

              {/* Brand Tone Capsule */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Tone Directive: {sub.brandTone}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {sub.toneKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                    >
                      +{kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Color System */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Palette className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] text-slate-400">Palette:</span>
                  <div className="flex items-center space-x-1.5">
                    <div className="flex items-center space-x-1 font-mono text-[10px]">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: sub.primaryColor }}
                      />
                      <span>{sub.primaryColor}</span>
                    </div>
                    <div className="flex items-center space-x-1 font-mono text-[10px]">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: sub.secondaryColor }}
                      />
                      <span>{sub.secondaryColor}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedSubsidiary(sub);
                    setActiveTab('studio');
                  }}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>Launch Campaign Studio</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add New Subsidiary */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Add Child Brand
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateBrand} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Brand / Subsidiary Name:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Nova Robotics, Solstice Organic..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Tagline / Core Proposition:
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g., Autonomous systems empowering human exploration..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Brand Tone Directive:
                </label>
                <input
                  type="text"
                  value={brandTone}
                  onChange={(e) => setBrandTone(e.target.value)}
                  placeholder="e.g., Bold, Heroic & Limitless"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Tone Keywords (comma separated):
                </label>
                <input
                  type="text"
                  value={toneKeywordsStr}
                  onChange={(e) => setToneKeywordsStr(e.target.value)}
                  placeholder="e.g., cinematic, high-contrast, clean 8k"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Primary Color:
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                    />
                    <span className="font-mono text-slate-500">{primaryColor}</span>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Secondary Color:
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                    />
                    <span className="font-mono text-slate-500">{secondaryColor}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
                >
                  Create Subsidiary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
