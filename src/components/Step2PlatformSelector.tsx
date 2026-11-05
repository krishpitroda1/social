'use client';

import React from 'react';
import { useStudioStore } from '@/lib/store';
import { SocialPlatform, AspectRatio } from '@/types';
import {
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  PinIcon,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Maximize2,
  Sparkles,
  Link2,
  Plus,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface PlatformMeta {
  id: SocialPlatform;
  name: string;
  tagline: string;
  recommendedRatio: AspectRatio;
  color: string;
  icon: any;
  bestFor: string;
}

const PLATFORMS: PlatformMeta[] = [
  {
    id: 'INSTAGRAM',
    name: 'Instagram',
    tagline: 'Visual Feed, Carousels & Reels',
    recommendedRatio: '1:1',
    color: '#E1306C',
    icon: Instagram,
    bestFor: 'High aesthetic visual impact, lifestyle, community curation',
  },
  {
    id: 'LINKEDIN',
    name: 'LinkedIn',
    tagline: 'Company Updates & Thought Leadership',
    recommendedRatio: '16:9',
    color: '#0A66C2',
    icon: Linkedin,
    bestFor: 'B2B institutional presence, industry commentary, executive authority',
  },
  {
    id: 'TWITTER_X',
    name: 'X (Twitter)',
    tagline: 'Real-Time Conversational Broadcasts',
    recommendedRatio: '16:9',
    color: '#000000',
    icon: Twitter,
    bestFor: 'Rapid product announcements, technical commentary, virality',
  },
  {
    id: 'FACEBOOK',
    name: 'Facebook',
    tagline: 'Corporate Page & Community Feed',
    recommendedRatio: '1:1',
    color: '#1877F2',
    icon: Facebook,
    bestFor: 'Broad demographic reach, event promotion, customer loyalty',
  },
  {
    id: 'PINTEREST',
    name: 'Pinterest',
    tagline: 'Inspiration Pins & Curated Boards',
    recommendedRatio: '4:5',
    color: '#BD081C',
    icon: PinIcon,
    bestFor: 'Product discovery, aspirational moodboards, aesthetic mood curation',
  },
];

const ASPECT_RATIOS: { id: AspectRatio; label: string; dimensions: string; hint: string }[] = [
  { id: '1:1', label: 'Square (1:1)', dimensions: '1080 × 1080 px', hint: 'Default for Instagram & Facebook' },
  { id: '16:9', label: 'Landscape (16:9)', dimensions: '1920 × 1080 px', hint: 'Recommended for LinkedIn & X' },
  { id: '4:5', label: 'Portrait (4:5)', dimensions: '1080 × 1350 px', hint: 'Maximum feed real estate on mobile' },
  { id: '9:16', label: 'Vertical (9:16)', dimensions: '1080 × 1920 px', hint: 'Best for Reels, Stories & TikTok' },
];

export const Step2PlatformSelector: React.FC = () => {
  const {
    selectedSubsidiary,
    selectedPlatform,
    setSelectedPlatform,
    aspectRatio,
    setAspectRatio,
    socialAccounts,
    setConnectAccountModalOpen,
    nextStep,
    prevStep,
  } = useStudioStore();

  const activePlatformMeta = PLATFORMS.find((p) => p.id === selectedPlatform) || PLATFORMS[0];

  const handleConnectClick = (e: React.MouseEvent, platformId: SocialPlatform) => {
    e.stopPropagation();
    setConnectAccountModalOpen(true, platformId);
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-2">
            <span>Step 2 of 5</span>
            <span>•</span>
            <span>Target Distribution & Live Accounts</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Choose Target Channel & Connect Real Accounts
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Publishing on behalf of <strong className="text-slate-800 dark:text-slate-200">{selectedSubsidiary.name}</strong>. Link your real Instagram, LinkedIn, X, Facebook, or Pinterest accounts to schedule and broadcast real live posts.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={prevStep}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <button
            onClick={nextStep}
            className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all"
          >
            <span>Continue to AI Engine</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Connected Channel Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Select Active Distribution Channel
          </h3>

          <button
            onClick={() => setConnectAccountModalOpen(true, selectedPlatform)}
            className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Manage / Add Real Social Accounts</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLATFORMS.map((platform) => {
            const Icon = platform.icon;
            const isSelected = selectedPlatform === platform.id;

            // Check if this platform account is connected for the active subsidiary
            const account = socialAccounts.find(
              (a) => a.subsidiaryId === selectedSubsidiary.id && a.platform === platform.id
            );
            const isConnected = account && account.connectionStatus === 'CONNECTED';

            return (
              <div
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                className={`group relative rounded-2xl p-5 border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900/90 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500/20'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                        style={{ backgroundColor: platform.color || '#4f46e5' }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {platform.name}
                        </h4>
                        {isConnected ? (
                          <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{account.accountHandle}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-500 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>Not Linked</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    {platform.tagline}
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Audience: </span>
                    {platform.bestFor}
                  </div>

                  {/* Connect / Manage Account Action Pill */}
                  <button
                    type="button"
                    onClick={(e) => handleConnectClick(e, platform.id)}
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 border transition-all ${
                      isConnected
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                        : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
                    }`}
                  >
                    <Link2 className="w-3 h-3" />
                    <span>{isConnected ? 'Manage Real Account' : '+ Connect Real Account'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Aspect Ratio Selector */}
      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center space-x-2">
              <Maximize2 className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Canvas Aspect Ratio & Cropping Matrix
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Targeted for {activePlatformMeta.name}. Standard recommendation: {activePlatformMeta.recommendedRatio}.
            </p>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80 self-start md:self-auto">
            Recommended: {activePlatformMeta.recommendedRatio}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {ASPECT_RATIOS.map((ratio) => {
            const isSelected = aspectRatio === ratio.id;
            const isRecommended = activePlatformMeta.recommendedRatio === ratio.id;

            return (
              <button
                key={ratio.id}
                type="button"
                onClick={() => setAspectRatio(ratio.id)}
                className={`relative flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-md ring-2 ring-indigo-500/20'
                    : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {isRecommended && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm whitespace-nowrap">
                    OPTIMAL
                  </span>
                )}

                <div className="h-14 flex items-center justify-center mb-2">
                  <div
                    className={`border-2 rounded transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                        : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900'
                    }`}
                    style={{
                      width: ratio.id === '1:1' ? '40px' : ratio.id === '16:9' ? '52px' : ratio.id === '9:16' ? '28px' : '34px',
                      height: ratio.id === '1:1' ? '40px' : ratio.id === '16:9' ? '29px' : ratio.id === '9:16' ? '50px' : '42px',
                    }}
                  />
                </div>

                <span className="font-bold text-xs">{ratio.label}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">{ratio.dimensions}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
