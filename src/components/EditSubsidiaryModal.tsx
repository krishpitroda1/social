'use client';

import React, { useState, useEffect } from 'react';
import { useStudioStore } from '@/lib/store';
import { Subsidiary } from '@/types';
import {
  Building2,
  X,
  Palette,
  Sparkles,
  Save,
  Trash2,
  Globe,
  Tag,
  Users,
} from 'lucide-react';

export const EditSubsidiaryModal: React.FC = () => {
  const {
    editingSubsidiary,
    isEditSubsidiaryModalOpen,
    setEditSubsidiaryModalOpen,
    updateBrand,
    deleteSubsidiary,
    subsidiaries,
  } = useStudioStore();

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [brandTone, setBrandTone] = useState('');
  const [toneKeywordsStr, setToneKeywordsStr] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6366F1');
  const [secondaryColor, setSecondaryColor] = useState('#EC4899');
  const [accentColor, setAccentColor] = useState('#10B981');
  const [targetAudience, setTargetAudience] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    if (editingSubsidiary) {
      setName(editingSubsidiary.name);
      setTagline(editingSubsidiary.tagline || '');
      setBrandTone(editingSubsidiary.brandTone);
      setToneKeywordsStr(editingSubsidiary.toneKeywords.join(', '));
      setPrimaryColor(editingSubsidiary.primaryColor);
      setSecondaryColor(editingSubsidiary.secondaryColor);
      setAccentColor(editingSubsidiary.accentColor || '#10B981');
      setTargetAudience(editingSubsidiary.targetAudience || '');
      setLogoUrl(editingSubsidiary.logoUrl || '');
    }
  }, [editingSubsidiary]);

  if (!isEditSubsidiaryModalOpen || !editingSubsidiary) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const keywords = toneKeywordsStr
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const updated: Subsidiary = {
      ...editingSubsidiary,
      name: name.trim(),
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      tagline: tagline.trim(),
      brandTone: brandTone.trim(),
      toneKeywords: keywords.length > 0 ? keywords : ['innovative', 'sleek'],
      primaryColor,
      secondaryColor,
      accentColor,
      targetAudience: targetAudience.trim(),
      logoUrl: logoUrl.trim() || editingSubsidiary.logoUrl,
    };

    updateBrand(updated);
    setEditSubsidiaryModalOpen(false, null);
  };

  const handleDelete = () => {
    if (subsidiaries.length <= 1) {
      alert('You must keep at least one active subsidiary company in the portfolio.');
      return;
    }
    if (confirm(`Are you sure you want to delete "${editingSubsidiary.name}"?`)) {
      deleteSubsidiary(editingSubsidiary.id);
      setEditSubsidiaryModalOpen(false, null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm"
              style={{ backgroundColor: primaryColor }}
            >
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Edit Company: {editingSubsidiary.name}
              </h3>
              <p className="text-[11px] text-slate-400">
                Rename company, change brand tone, update colors, and adjust identity
              </p>
            </div>
          </div>

          <button
            onClick={() => setEditSubsidiaryModalOpen(false, null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Company Name */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Company Name:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Studio, Solstice Energy..."
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Tagline */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Tagline / Proposition:
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g., Pioneering sustainable energy for urban ecosystems..."
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Brand Tone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Brand Voice Tone:
              </label>
              <input
                type="text"
                value={brandTone}
                onChange={(e) => setBrandTone(e.target.value)}
                placeholder="e.g. Bold, Minimalist & Scientific"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                <Users className="w-3 h-3 text-indigo-500" />
                Target Audience:
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Tech Founders & Executives"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Tone Keywords */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Diffusion Tone Keywords (comma separated):
            </label>
            <input
              type="text"
              value={toneKeywordsStr}
              onChange={(e) => setToneKeywordsStr(e.target.value)}
              placeholder="e.g. cinematic, studio lighting, hyper-realistic, 8k"
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Brand Color System */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 space-y-2">
            <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[10px] flex items-center gap-1">
              <Palette className="w-3 h-3 text-indigo-500" />
              Brand Color Palette System
            </span>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">
                  Primary:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-7 h-7 rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
                  />
                  <span className="font-mono text-[11px] text-slate-500">{primaryColor}</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">
                  Secondary:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-7 h-7 rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
                  />
                  <span className="font-mono text-[11px] text-slate-500">{secondaryColor}</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">
                  Accent:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-7 h-7 rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
                  />
                  <span className="font-mono text-[11px] text-slate-500">{accentColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Logo URL */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Logo / Avatar Image URL:
            </label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-[11px]"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center space-x-1 text-rose-500 hover:text-rose-700 font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Company</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setEditSubsidiaryModalOpen(false, null)}
                className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

