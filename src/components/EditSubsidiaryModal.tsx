'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStudioStore } from '@/lib/store';
import { Subsidiary } from '@/types';
import { CompanyLogo } from '@/components/CompanyLogo';
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
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
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
  const [logoInputMode, setLogoInputMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setUploadError(null);
    }
  }, [editingSubsidiary]);

  if (!isEditSubsidiaryModalOpen || !editingSubsidiary) return null;

  // Process and compress local image file to data URL
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
        // Create canvas to resize to reasonable dimensions (max 400x400) for fast saving
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
          const compressed = canvas.toDataURL('image/png');
          setLogoUrl(compressed);
        } else {
          setLogoUrl(rawDataUrl);
        }
      };
      img.onerror = () => {
        setLogoUrl(rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

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
      // Empty string is allowed if user doesn't want an image
      logoUrl: logoUrl.trim(),
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
                Rename company, upload logo photo, adjust brand tone, and configure identity
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

          {/* Logo / Avatar Image: File Upload + URL + Optional No-Image Support */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Company Logo / Photo</span>
                <span className="text-[10px] font-normal text-slate-400 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  Optional
                </span>
              </label>

              {/* Mode Switcher: Upload File or URL */}
              <div className="flex items-center space-x-1 p-0.5 bg-slate-200 dark:bg-slate-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setLogoInputMode('upload')}
                  className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                    logoInputMode === 'upload'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setLogoInputMode('url')}
                  className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                    logoInputMode === 'url'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {/* Current Logo Preview & Status */}
            <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <CompanyLogo
                name={name || editingSubsidiary.name}
                logoUrl={logoUrl}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                className="w-12 h-12 rounded-xl"
                textClassName="text-sm font-extrabold"
              />

              <div className="flex-1 min-w-0">
                {logoUrl ? (
                  <div>
                    <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Custom Image Active</span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {logoUrl.startsWith('data:') ? 'Local uploaded file ready' : logoUrl}
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="text-indigo-600 dark:text-indigo-400 font-bold text-[11px]">
                      Dynamic Brand Emblem Active
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      No image uploaded — automatically using styled initials & color palette
                    </p>
                  </div>
                )}
              </div>

              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl('')}
                  className="px-2.5 py-1 text-[11px] font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                  title="Remove image and use dynamic brand emblem"
                >
                  Remove Image
                </button>
              )}
            </div>

            {/* File Upload Dropzone */}
            {logoInputMode === 'upload' ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Upload className="w-5 h-5 mx-auto mb-1.5 text-indigo-500 animate-bounce" />
                  <p className="font-semibold text-slate-700 dark:text-slate-200 text-xs">
                    Click to choose photo or drag & drop here
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    PNG, JPG, WebP, SVG supported (Auto-compressed for fast loading)
                  </p>
                </div>
              </div>
            ) : (
              /* Image URL Input */
              <div>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="Paste direct image link: https://..."
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-[11px]"
                />
              </div>
            )}

            {uploadError && (
              <p className="text-[11px] text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{uploadError}</span>
              </p>
            )}

            <p className="text-[10px] text-slate-400 italic">
              💡 Tip: An image is completely optional. If you don&apos;t want to add an image, leave it blank and the app will generate a clean company badge.
            </p>
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
