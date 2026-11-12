'use client';

import React, { useState, useRef } from 'react';
import { useStudioStore } from '@/lib/store';
import { Subsidiary } from '@/types';
import { CompanyLogo } from '@/components/CompanyLogo';
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
  Upload,
  Image as ImageIcon,
  AlertCircle,
  X,
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
  const [logoUrl, setLogoUrl] = useState('');
  const [logoInputMode, setLogoInputMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, SVG, WebP)');
      return;
    }
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setLogoUrl(canvas.toDataURL('image/png'));
        } else {
          setLogoUrl(rawDataUrl);
        }
      };
      img.onerror = () => setLogoUrl(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

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
      logoUrl: logoUrl.trim(), // Optional! Can be empty string
      websiteUrl: `https://${name.toLowerCase().replace(/[^a-z0-9]+/g, '')}.internal`,
      targetAudience: targetAudience.trim() || 'General Consumers',
      activeAccountsCount: 0,
    };

    addBrand(newBrand);
    setIsAddModalOpen(false);

    setName('');
    setTagline('');
    setLogoUrl('');
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
              Multi-brand portfolio governance • {subsidiaries.length} Active Subsidiaries
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setEditOrgModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition-all flex items-center space-x-1.5"
          >
            <Pencil className="w-3.5 h-3.5 text-indigo-500" />
            <span>Rename Parent Company</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subsidiary</span>
          </button>
        </div>
      </div>

      {/* Subsidiary Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {subsidiaries.map((sub) => {
          const isSelected = selectedSubsidiary.id === sub.id;

          return (
            <div
              key={sub.id}
              className={`rounded-2xl p-6 bg-white dark:bg-slate-900/60 border ${
                isSelected
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg'
                  : 'border-slate-200 dark:border-slate-800'
              } space-y-4`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3.5">
                  <CompanyLogo
                    name={sub.name}
                    logoUrl={sub.logoUrl}
                    primaryColor={sub.primaryColor}
                    secondaryColor={sub.secondaryColor}
                    className="w-14 h-14 rounded-2xl"
                    textClassName="text-base font-extrabold"
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

              {/* Color System & Audience */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="flex items-center space-x-2">
                  <Palette className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500">Colors:</span>
                  <div className="flex items-center space-x-1">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10"
                      style={{ backgroundColor: sub.primaryColor }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10"
                      style={{ backgroundColor: sub.secondaryColor }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10"
                      style={{ backgroundColor: sub.accentColor }}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 text-slate-500 truncate">
                  <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{sub.targetAudience}</span>
                </div>
              </div>

              {/* Switch to this Brand Button */}
              {!isSelected && (
                <button
                  onClick={() => {
                    setSelectedSubsidiary(sub);
                    setActiveTab('studio');
                  }}
                  className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all mt-2"
                >
                  Switch Studio Context to {sub.name}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Brand Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Add New Subsidiary Brand
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBrand} className="space-y-4">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Brand / Company Name:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Nova Robotics, Solstice Botanicals"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Tagline:
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g., Adaptive intelligence for robotic workflows"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Brand Tone Directive:
                  </label>
                  <input
                    type="text"
                    value={brandTone}
                    onChange={(e) => setBrandTone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Audience:
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
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

              {/* Logo Upload Section */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Logo / Photo</span>
                    <span className="text-[10px] font-normal text-slate-400 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      Optional
                    </span>
                  </label>

                  <div className="flex items-center space-x-1 p-0.5 bg-slate-200 dark:bg-slate-800 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setLogoInputMode('upload')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        logoInputMode === 'upload'
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white'
                          : 'text-slate-500'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoInputMode('url')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        logoInputMode === 'url'
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white'
                          : 'text-slate-500'
                      }`}
                    >
                      URL
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <CompanyLogo
                    name={name || 'New Brand'}
                    logoUrl={logoUrl}
                    primaryColor={primaryColor}
                    secondaryColor={secondaryColor}
                    className="w-10 h-10 rounded-xl"
                  />
                  <div className="flex-1 min-w-0">
                    {logoUrl ? (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        Custom photo ready
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        No photo selected — dynamic brand emblem will be generated
                      </span>
                    )}
                  </div>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="text-[10px] text-rose-500 font-semibold"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {logoInputMode === 'upload' ? (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleProcessFile(f);
                      }}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-dashed rounded-xl p-3 text-center cursor-pointer hover:border-indigo-400"
                    >
                      <Upload className="w-4 h-4 mx-auto mb-1 text-indigo-500" />
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        Choose photo file
                      </span>
                    </div>
                  </div>
                ) : (
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px]"
                  />
                )}
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
