'use client';

import React, { useState } from 'react';
import { useStudioStore } from '@/lib/store';
import { SocialPlatform } from '@/types';
import { CompanyLogo } from '@/components/CompanyLogo';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Share2,
  MoreHorizontal,
  ThumbsUp,
  Repeat2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Clock,
  History,
  Sliders,
  ExternalLink,
  ShieldCheck,
  Eye,
  Upload,
  Image as ImageIcon,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  PinIcon,
} from 'lucide-react';

export const Step4PostPreview: React.FC = () => {
  const {
    selectedSubsidiary,
    selectedPlatform,
    setSelectedPlatform,
    aspectRatio,
    prompt,
    enhancedPrompt,
    generatedImageUrl,
    setGeneratedImageUrl,
    caption,
    hashtags,
    selectedModel,
    rejectionFeedback,
    setRejectionFeedback,
    revisionHistory,
    isGenerating,
    rejectAndRegenerate,
    triggerGenerate,
    approvePost,
    prevStep,
  } = useStudioStore();

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(1482);
  const [isRejectDrawerOpen, setIsRejectDrawerOpen] = useState(false);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isCustomUrlOpen, setIsCustomUrlOpen] = useState(false);
  const [activeTabPreview, setActiveTabPreview] = useState<SocialPlatform>(selectedPlatform);

  const handleToggleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackInput.trim()) return;
    await rejectAndRegenerate(feedbackInput.trim());
    setIsRejectDrawerOpen(false);
    setFeedbackInput('');
  };

  const imageUrl =
    generatedImageUrl ||
    'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1080&auto=format&fit=crop&q=85';

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-2">
            <span>Step 4 of 5</span>
            <span>•</span>
            <span>Quality Assurance & Approval Gate</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Post Preview & Approval Gate
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review the pixel-accurate native mock render before unlocking social distribution. Validate brand consistency, composition, and copywriting.
          </p>
        </div>

        {/* Core Actions: Reject/Regenerate vs Approve & Schedule */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsRejectDrawerOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 text-xs font-bold transition-all shadow-sm"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject / Regenerate</span>
          </button>

          <button
            onClick={approvePost}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve & Schedule Post</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Main Container: Preview Card + Metadata Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Platform Mock Preview (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          {/* Platform Mock Switcher Tabs */}
          <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 px-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-indigo-500" />
                Live Mockup
              </span>

              {imageUrl.includes('blob.core.windows.net') || imageUrl.includes('openai') ? (
                <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  <span>OpenAI DALL-E 3 (ChatGPT)</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  <span>Flux.1 Diffusion Engine</span>
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setActiveTabPreview('INSTAGRAM')}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  activeTabPreview === 'INSTAGRAM'
                    ? 'bg-white dark:bg-slate-800 text-pink-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Instagram Preview"
              >
                <Instagram className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTabPreview('LINKEDIN')}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  activeTabPreview === 'LINKEDIN'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="LinkedIn Preview"
              >
                <Linkedin className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTabPreview('TWITTER_X')}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  activeTabPreview === 'TWITTER_X'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="X (Twitter) Preview"
              >
                <Twitter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MOCK RENDER 1: INSTAGRAM FEED POST CARD */}
          {activeTabPreview === 'INSTAGRAM' && (
            <div className="w-full max-w-[440px] rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden transition-all text-slate-900 dark:text-neutral-100 font-sans">
              {/* Instagram Card Header */}
              <div className="flex items-center justify-between p-3.5 border-b border-slate-100 dark:border-neutral-900">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 shrink-0">
                    <CompanyLogo
                      name={selectedSubsidiary.name}
                      logoUrl={selectedSubsidiary.logoUrl}
                      primaryColor={selectedSubsidiary.primaryColor}
                      secondaryColor={selectedSubsidiary.secondaryColor}
                      className="w-full h-full rounded-full"
                      textClassName="text-[10px] font-bold"
                    />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-bold tracking-tight">
                        {selectedSubsidiary.slug.replace(/-/g, '_')}
                      </span>
                      <span className="text-[10px] text-blue-500 font-bold">✓</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Sponsored</span>
                  </div>
                </div>

                <button className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Instagram Image Container with Aspect Ratio */}
              <div
                className={`relative w-full bg-slate-900 overflow-hidden flex items-center justify-center ${
                  aspectRatio === '1:1'
                    ? 'aspect-square'
                    : aspectRatio === '16:9'
                    ? 'aspect-video'
                    : aspectRatio === '4:5'
                    ? 'aspect-[4/5]'
                    : 'aspect-[9/16]'
                }`}
              >
                <img
                  src={imageUrl}
                  alt={prompt}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Instagram Action Icons */}
              <div className="p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleToggleLike}
                      className={`transition-transform active:scale-125 ${
                        isLiked ? 'text-rose-500 fill-rose-500' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      <Heart className={`w-6 h-6 ${isLiked ? 'fill-rose-500' : ''}`} />
                    </button>
                    <button className="text-slate-900 dark:text-white hover:opacity-75">
                      <MessageCircle className="w-6 h-6" />
                    </button>
                    <button className="text-slate-900 dark:text-white hover:opacity-75">
                      <Send className="w-6 h-6 -rotate-12" />
                    </button>
                  </div>

                  <button className="text-slate-900 dark:text-white hover:opacity-75">
                    <Bookmark className="w-6 h-6" />
                  </button>
                </div>

                {/* Likes Counter */}
                <div className="text-xs font-bold">
                  {likeCount.toLocaleString()} likes
                </div>

                {/* Caption & Hashtags */}
                <div className="text-xs leading-relaxed space-y-1">
                  <p>
                    <span className="font-bold mr-1.5">
                      {selectedSubsidiary.slug.replace(/-/g, '_')}
                    </span>
                    <span className="whitespace-pre-line text-slate-800 dark:text-neutral-200">
                      {caption || prompt}
                    </span>
                  </p>
                </div>

                {/* Comments & Timestamp */}
                <div className="pt-1 text-[11px] text-slate-400 space-y-1">
                  <div>View all 34 comments</div>
                  <div className="uppercase text-[9px] tracking-wider text-slate-400">
                    JUST NOW • VIA OMNIBRAND STUDIO
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MOCK RENDER 2: LINKEDIN POST CARD */}
          {activeTabPreview === 'LINKEDIN' && (
            <div className="w-full max-w-[480px] rounded-xl bg-white dark:bg-[#1b1f23] border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden transition-all text-slate-900 dark:text-neutral-100 font-sans">
              {/* LinkedIn Header */}
              <div className="p-4 flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <CompanyLogo
                    name={selectedSubsidiary.name}
                    logoUrl={selectedSubsidiary.logoUrl}
                    primaryColor={selectedSubsidiary.primaryColor}
                    secondaryColor={selectedSubsidiary.secondaryColor}
                    className="w-12 h-12 rounded-lg"
                    textClassName="text-sm font-bold"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {selectedSubsidiary.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-1">
                      {selectedSubsidiary.tagline}
                    </p>
                    <div className="flex items-center space-x-1 text-[11px] text-slate-400 mt-0.5">
                      <span>1d • Edited •</span>
                      <span className="text-blue-500 font-medium">Promoted</span>
                    </div>
                  </div>
                </div>

                <button className="text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-50 dark:hover:bg-blue-950/40 px-3 py-1.5 rounded-full border border-blue-600 dark:border-blue-400">
                  + Follow
                </button>
              </div>

              {/* LinkedIn Copy */}
              <div className="px-4 pb-3 text-xs leading-relaxed text-slate-800 dark:text-neutral-200 whitespace-pre-line">
                {caption || prompt}
              </div>

              {/* LinkedIn Media Container */}
              <div
                className={`relative w-full bg-slate-900 overflow-hidden ${
                  aspectRatio === '16:9' ? 'aspect-video' : 'aspect-square'
                }`}
              >
                <img
                  src={imageUrl}
                  alt={prompt}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* LinkedIn Metrics Bar */}
              <div className="px-4 py-2 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-400">
                <div className="flex items-center space-x-1">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[9px]">
                    👍
                  </span>
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[9px] -ml-1.5">
                    ❤️
                  </span>
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] -ml-1.5">
                    💡
                  </span>
                  <span className="pl-1">426 reactions</span>
                </div>
                <div>32 comments • 18 reposts</div>
              </div>

              {/* LinkedIn Action Bar */}
              <div className="px-2 py-1.5 flex items-center justify-around text-xs font-semibold text-slate-600 dark:text-neutral-300">
                <button
                  onClick={handleToggleLike}
                  className={`flex items-center space-x-1.5 py-2 px-3 rounded hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors ${
                    isLiked ? 'text-blue-600' : ''
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Like</span>
                </button>
                <button className="flex items-center space-x-1.5 py-2 px-3 rounded hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>Comment</span>
                </button>
                <button className="flex items-center space-x-1.5 py-2 px-3 rounded hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors">
                  <Repeat2 className="w-4 h-4" />
                  <span>Repost</span>
                </button>
                <button className="flex items-center space-x-1.5 py-2 px-3 rounded hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors">
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          )}

          {/* MOCK RENDER 3: X / TWITTER POST CARD */}
          {activeTabPreview === 'TWITTER_X' && (
            <div className="w-full max-w-[480px] rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-neutral-800 shadow-2xl p-4 transition-all text-slate-900 dark:text-neutral-100 font-sans">
              <div className="flex items-start space-x-3">
                <CompanyLogo
                  name={selectedSubsidiary.name}
                  logoUrl={selectedSubsidiary.logoUrl}
                  primaryColor={selectedSubsidiary.primaryColor}
                  secondaryColor={selectedSubsidiary.secondaryColor}
                  className="w-10 h-10 rounded-full"
                  textClassName="text-xs font-bold"
                />

                <div className="flex-1 min-w-0">
                  {/* Tweet Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {selectedSubsidiary.name}
                      </span>
                      <span className="text-blue-400 text-xs font-bold">✓</span>
                      <span className="text-xs text-slate-500 dark:text-neutral-400 truncate">
                        @{selectedSubsidiary.slug.replace(/-/g, '')}
                      </span>
                      <span className="text-xs text-slate-500">· 2m</span>
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>

                  {/* Tweet Body */}
                  <p className="text-xs mt-1.5 leading-relaxed text-slate-900 dark:text-neutral-100 whitespace-pre-line">
                    {caption || prompt}
                  </p>

                  {/* Tweet Media Container */}
                  <div
                    className={`mt-3 rounded-2xl overflow-hidden border border-slate-200 dark:border-neutral-800 ${
                      aspectRatio === '16:9' ? 'aspect-video' : 'aspect-square'
                    }`}
                  >
                    <img
                      src={imageUrl}
                      alt={prompt}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Tweet Timestamp & Views */}
                  <div className="mt-3 text-[11px] text-slate-400 flex items-center space-x-2 pb-2.5 border-b border-slate-100 dark:border-neutral-800">
                    <span>11:58 AM · Nov 3, 2026</span>
                    <span>·</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">48.2K</span>
                    <span>Views</span>
                  </div>

                  {/* Tweet Engagement Icons */}
                  <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 pt-2 text-xs">
                    <button className="flex items-center space-x-1.5 hover:text-sky-500 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span>42</span>
                    </button>
                    <button className="flex items-center space-x-1.5 hover:text-emerald-500 transition-colors">
                      <Repeat2 className="w-4 h-4" />
                      <span>88</span>
                    </button>
                    <button
                      onClick={handleToggleLike}
                      className={`flex items-center space-x-1.5 hover:text-rose-500 transition-colors ${
                        isLiked ? 'text-rose-500' : ''
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
                      <span>{isLiked ? '613' : '612'}</span>
                    </button>
                    <button className="flex items-center space-x-1.5 hover:text-sky-500 transition-colors">
                      <Bookmark className="w-4 h-4" />
                      <span>94</span>
                    </button>
                    <button className="hover:text-sky-500 transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Photo Replacement & Direct Actions */}
          <div className="w-full mt-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-500" />
                Want to change or replace this photo?
              </span>
              <div className="flex items-center space-x-2">
                <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload from Computer</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const res = event.target?.result as string;
                        if (res) {
                          setGeneratedImageUrl(res);
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setIsCustomUrlOpen(!isCustomUrlOpen)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
                >
                  <span>{isCustomUrlOpen ? 'Hide URL' : 'Paste URL'}</span>
                </button>
              </div>
            </div>

            {isCustomUrlOpen && (
              <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="Paste direct https://... image URL (or from ChatGPT)"
                  className="flex-1 text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customUrlInput.trim()) {
                      setGeneratedImageUrl(customUrlInput.trim());
                      setCustomUrlInput('');
                      setIsCustomUrlOpen(false);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Apply Photo
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Generation Metadata, Prompt Inspection & Revision History (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Metadata Inspector Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Synthesis Verification Report
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800">
                GATE READY
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Diffusion Model:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedModel}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Aspect Canvas:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {aspectRatio}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Brand Directives:</span>
                <span className="font-semibold text-indigo-500">
                  {selectedSubsidiary.brandTone}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Target Channel:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedPlatform}
                </span>
              </div>
            </div>

            {/* Injected Enhanced Prompt View */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                Full Enhanced Prompt Injected to Model:
              </span>
              <p className="text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
                {enhancedPrompt || prompt}
              </p>
            </div>
          </div>

          {/* Revision History Carousel / Switcher */}
          {revisionHistory.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-indigo-500" />
                  Revision History ({revisionHistory.length})
                </span>
                <span className="text-[10px] text-slate-400">Multi-version rollback</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {revisionHistory.map((item, idx) => (
                  <div
                    key={item.id}
                    className="relative rounded-xl overflow-hidden aspect-square border border-slate-200 dark:border-slate-800 group"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.prompt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1 text-[10px] text-white font-bold text-center">
                      v{revisionHistory.length - idx}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Image URL Override Option */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Custom Image or Direct URL:
              </span>
              <button
                type="button"
                onClick={() => setIsCustomUrlOpen(!isCustomUrlOpen)}
                className="text-xs text-indigo-500 font-semibold hover:underline"
              >
                {isCustomUrlOpen ? 'Hide' : 'Enter Image Link'}
              </button>
            </div>

            {isCustomUrlOpen && (
              <div className="space-y-3 pt-1">
                <div>
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="Paste direct https://... image URL (or from ChatGPT)"
                    className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customUrlInput.trim()) {
                        setGeneratedImageUrl(customUrlInput.trim());
                        setCustomUrlInput('');
                        setIsCustomUrlOpen(false);
                      }
                    }}
                    className="w-full mt-1.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                  >
                    Apply Image URL
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1.5">
                    Or upload image file from disk:
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const res = event.target?.result as string;
                        if (res) {
                          setGeneratedImageUrl(res);
                          setIsCustomUrlOpen(false);
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Direct Actions Box */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Ready to Unlock Distribution?
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Approving sends the asset to Step 5: Scheduling & Connectors.
                </p>
              </div>
            </div>

            <button
              onClick={approvePost}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2"
            >
              <span>Approve & Continue to Scheduling</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Reject / Regenerate Feedback Drawer Modal */}
      {isRejectDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400">
                <XCircle className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Reject & Regenerate Visual
                </h3>
              </div>
              <button
                onClick={() => setIsRejectDrawerOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide feedback for the next diffusion pass. The model will re-synthesize the image incorporating your adjustments while preserving brand voice.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1.5">
                  Revision Feedback:
                </label>
                <textarea
                  rows={3}
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder="e.g., 'Make lighting warmer with more golden amber caustics', 'Increase negative space', 'Add more contrast to product details'..."
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  autoFocus
                />
              </div>

              {/* Quick Adjustment Suggestion Pills */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">
                  Suggested Directives:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Make lighting warmer',
                    'Increase dramatic contrast',
                    'More minimalist framing',
                    'Softer studio backlight',
                    'Accentuate metallic textures',
                  ].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFeedbackInput(s)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-rose-600 transition-colors"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRejectDrawerOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={!feedbackInput.trim() || isGenerating}
                  className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/25 transition-all disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-Synthesize Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

