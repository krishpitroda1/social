'use client';

import React, { useState, useEffect } from 'react';
import { useStudioStore } from '@/lib/store';
import {
  Calendar,
  Clock,
  Globe,
  Send,
  CalendarCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Terminal,
  Check,
  ExternalLink,
  Zap,
  Link2,
  AlertCircle,
  Copy,
  Download,
  Upload,
  Share2,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  PinIcon,
  Key,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatAyrsharePayload, formatBufferPayload } from '@/lib/social-connectors';

const TIMEZONES = [
  { id: 'America/New_York', label: 'Eastern Time (ET) - New York' },
  { id: 'America/Los_Angeles', label: 'Pacific Time (PT) - Los Angeles' },
  { id: 'Europe/London', label: 'GMT - London' },
  { id: 'Asia/Singapore', label: 'SGT (UTC+8) - Singapore' },
  { id: 'Asia/Kolkata', label: 'IST (UTC+5:30) - Mumbai / Delhi' },
  { id: 'UTC', label: 'Coordinated Universal Time (UTC)' },
];

const PRESETS = [
  { label: 'Tomorrow Morning (9:00 AM)', getHoursFromNow: 21 },
  { label: 'Peak Mid-day (1:30 PM Tomorrow)', getHoursFromNow: 25.5 },
  { label: 'Prime Evening (6:00 PM Tomorrow)', getHoursFromNow: 30 },
  { label: 'Thursday Peak B2B (10:00 AM)', getHoursFromNow: 48 },
];

export const Step5SchedulePublish: React.FC = () => {
  const {
    selectedSubsidiary,
    selectedPlatform,
    caption,
    hashtags,
    generatedImageUrl,
    setGeneratedImageUrl,
    aspectRatio,
    scheduledTime,
    setScheduledTime,
    postNow,
    setPostNow,
    isPublishing,
    publishSuccess,
    publishOrSchedule,
    lastDispatchResult,
    socialAccounts,
    setConnectAccountModalOpen,
    organization,
    setAyrshareApiKey,
    setSettingsOpen,
    setActiveTab,
    prevStep,
    resetStudio,
  } = useStudioStore();

  const [selectedTimezone, setSelectedTimezone] = useState('America/New_York');
  const [activeConnector, setActiveConnector] = useState<'ayrshare' | 'buffer'>('ayrshare');
  const [showPayloadInspector, setShowPayloadInspector] = useState(false);
  const [copiedCaptionToast, setCopiedCaptionToast] = useState(false);
  const [downloadedToast, setDownloadedToast] = useState(false);
  const [ayrshareKeyInput, setAyrshareKeyInput] = useState('');
  const [ayrshareSavedToast, setAyrshareSavedToast] = useState(false);

  useEffect(() => {
    if (organization.ayrshareApiKey) {
      setAyrshareKeyInput(organization.ayrshareApiKey);
    }
  }, [organization.ayrshareApiKey]);

  const connectedAccount = socialAccounts.find(
    (a) => a.subsidiaryId === selectedSubsidiary.id && a.platform === selectedPlatform
  );
  const isAccountConnected = connectedAccount && connectedAccount.connectionStatus === 'CONNECTED';

  const hasLiveAyrshareKey =
    organization.ayrshareApiKey &&
    !organization.ayrshareApiKey.includes('DEMO') &&
    organization.ayrshareApiKey.length > 8;

  const fullCaptionText = `${caption}\n\n${hashtags.join(' ')}`;
  const encodedCaption = encodeURIComponent(fullCaptionText);
  const encodedImageUrl = encodeURIComponent(generatedImageUrl || '');

  // Pre-calculated Native Intent URLs (Safe for direct <a href> clicks)
  const xIntentUrl = `https://twitter.com/intent/tweet?text=${encodedCaption}`;
  const linkedinIntentUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodedCaption}`;
  const facebookIntentUrl = `https://www.facebook.com/sharer/sharer.php?quote=${encodedCaption}`;
  const pinterestIntentUrl = `https://pinterest.com/pin/create/button/?url=https%3A%2F%2Fomnibrand.studio&media=${encodedImageUrl}&description=${encodedCaption}`;

  const handlePresetClick = (hours: number) => {
    const future = new Date(Date.now() + hours * 3600000);
    setScheduledTime(future.toISOString().slice(0, 16));
    setPostNow(false);
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(fullCaptionText);
    setCopiedCaptionToast(true);
    setTimeout(() => setCopiedCaptionToast(false), 2500);
  };

  const handleDownloadImage = () => {
    if (!generatedImageUrl) return;
    const a = document.createElement('a');
    a.href = generatedImageUrl;
    a.download = `omnibrand_${selectedSubsidiary.slug}_${selectedPlatform.toLowerCase()}.jpg`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloadedToast(true);
    setTimeout(() => setDownloadedToast(false), 2500);
  };

  const handleSaveAyrshareKey = () => {
    setAyrshareApiKey(ayrshareKeyInput.trim());
    setAyrshareSavedToast(true);
    setTimeout(() => setAyrshareSavedToast(false), 2500);
  };

  const handlePublish = async () => {
    await publishOrSchedule();

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // safe fallback
    }
  };

  const ayrsharePreview = formatAyrsharePayload({
    caption,
    hashtags,
    platform: selectedPlatform,
    imageUrl: generatedImageUrl || '',
    scheduledTime,
    postNow,
  });

  const bufferPreview = formatBufferPayload({
    caption,
    platform: selectedPlatform,
    imageUrl: generatedImageUrl || '',
    scheduledTime,
    postNow,
  });

  const activePayloadString =
    activeConnector === 'ayrshare'
      ? JSON.stringify(ayrsharePreview, null, 2)
      : JSON.stringify(bufferPreview, null, 2);

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-2">
            <span>Step 5 of 5</span>
            <span>•</span>
            <span>Omnichannel Dispatch & Scheduling</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Publish & Broadcast to Live Feed
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Dispatch approved visual asset and copy to <strong className="text-slate-800 dark:text-slate-200">{selectedPlatform}</strong> on behalf of <strong className="text-slate-800 dark:text-slate-200">{selectedSubsidiary.name}</strong>.
          </p>
        </div>

        <button
          onClick={prevStep}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Preview</span>
        </button>
      </div>

      {/* 🚀 PRIMARY OPTION: DIRECT 1-CLICK LIVE PUBLISH TO REAL PLATFORM */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
                Direct Real Account Publisher
              </span>
              <span className="text-xs font-mono text-emerald-300">● 100% Real Live Post</span>
            </div>
            <h3 className="text-xl font-bold">
              Publish to Your Real {selectedPlatform} Account Now
            </h3>
            <p className="text-xs text-white/90 max-w-xl leading-relaxed">
              Posts directly to your personal or company account on {selectedPlatform}. Zero paid developer API keys required.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyCaption}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 transition-all backdrop-blur-sm"
            >
              {copiedCaptionToast ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCaptionToast ? 'Copied to Clipboard!' : 'Copy Caption & Tags'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadImage}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 transition-all backdrop-blur-sm"
            >
              {downloadedToast ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloadedToast ? 'Downloaded! ✓' : 'Download Image'}</span>
            </button>
          </div>
        </div>

        {/* Platform Specific 1-Click Action Bar */}
        <div className="p-4 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 space-y-3">
          {selectedPlatform === 'INSTAGRAM' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-pink-200 flex items-center gap-1.5">
                  <Instagram className="w-4 h-4" />
                  Instagram 3-Step Live Publishing Assistant
                </span>
                <span className="text-[10px] text-white/70">Instagram Web Post</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadImage}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center space-x-2.5 ${
                    downloadedToast
                      ? 'bg-emerald-500/30 border-emerald-400 text-white'
                      : 'bg-white/10 hover:bg-white/15 border-white/10 text-white'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    {downloadedToast ? <Check className="w-4 h-4 text-emerald-300" /> : <span className="font-bold text-xs">1</span>}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">1. Download Visual</div>
                    <div className="text-[10px] text-white/70">Save image to device</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center space-x-2.5 ${
                    copiedCaptionToast
                      ? 'bg-emerald-500/30 border-emerald-400 text-white'
                      : 'bg-white/10 hover:bg-white/15 border-white/10 text-white'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    {copiedCaptionToast ? <Check className="w-4 h-4 text-emerald-300" /> : <span className="font-bold text-xs">2</span>}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">2. Copy Caption</div>
                    <div className="text-[10px] text-white/70">Copies text & hashtags</div>
                  </div>
                </button>

                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-white text-indigo-700 hover:bg-slate-100 font-extrabold text-xs shadow-lg transition-all flex items-center justify-center space-x-2 text-center"
                >
                  <span>3. Open Instagram (+ Create) ↗</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>

              <div className="text-[11px] text-white/80 bg-white/5 p-2.5 rounded-lg leading-relaxed flex items-center space-x-2">
                <span>💡 <strong>Tip for Instagram:</strong> On Instagram, click <strong>+ Create</strong> on the left navigation bar, drag your downloaded image in, paste your caption (Ctrl+V), and click <strong>Share</strong>!</span>
              </div>
            </div>
          )}

          {selectedPlatform === 'TWITTER_X' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Twitter className="w-4 h-4 text-sky-300" />
                  Direct X (Twitter) Web Composer
                </div>
                <p className="text-[11px] text-white/80 mt-0.5">
                  Opens the official X composer with your caption and hashtags automatically typed out.
                </p>
              </div>

              <a
                href={xIntentUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleCopyCaption}
                className="inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs shadow-lg transition-all active:scale-95 shrink-0"
              >
                <span>Open X Composer & Tweet ↗</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {selectedPlatform === 'LINKEDIN' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Linkedin className="w-4 h-4 text-sky-300" />
                  Direct LinkedIn Share Composer
                </div>
                <p className="text-[11px] text-white/80 mt-0.5">
                  Opens LinkedIn with your text prefilled. Attach your downloaded visual and share with your network.
                </p>
              </div>

              <a
                href={linkedinIntentUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleCopyCaption}
                className="inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-slate-100 font-extrabold text-xs shadow-lg transition-all active:scale-95 shrink-0"
              >
                <span>Open LinkedIn & Share ↗</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {selectedPlatform === 'FACEBOOK' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Facebook className="w-4 h-4 text-blue-300" />
                  Direct Facebook Page / Feed Publisher
                </div>
                <p className="text-[11px] text-white/80 mt-0.5">
                  Opens the Facebook composer with your campaign text ready for broadcast.
                </p>
              </div>

              <a
                href={facebookIntentUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleCopyCaption}
                className="inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-white text-blue-600 hover:bg-slate-100 font-extrabold text-xs shadow-lg transition-all active:scale-95 shrink-0"
              >
                <span>Open Facebook & Share ↗</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {selectedPlatform === 'PINTEREST' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <PinIcon className="w-4 h-4 text-rose-300" />
                  Direct Pinterest Pin Creator
                </div>
                <p className="text-[11px] text-white/80 mt-0.5">
                  Opens Pinterest with the generated image and description linked.
                </p>
              </div>

              <a
                href={pinterestIntentUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleCopyCaption}
                className="inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-white text-rose-600 hover:bg-slate-100 font-extrabold text-xs shadow-lg transition-all active:scale-95 shrink-0"
              >
                <span>Create Pin on Pinterest ↗</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Connected Account Verification Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 ${
              isAccountConnected ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          >
            <Link2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Channel Destination: {selectedPlatform}
              </span>
              {isAccountConnected ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  ● {connectedAccount.accountHandle} (Linked)
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  ○ No Account Linked
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {isAccountConnected
                ? `Associated with account: ${connectedAccount.accountHandle} for subsidiary ${selectedSubsidiary.name}.`
                : `Click to link your real handle or open login.`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setConnectAccountModalOpen(true, selectedPlatform)}
          className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 transition-all self-start sm:self-auto"
        >
          <span>{isAccountConnected ? 'Manage Account' : '+ Link Real Social Account'}</span>
        </button>
      </div>

      {/* Success Celebration View */}
      {publishSuccess ? (
        <div className="max-w-xl mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800/80 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>

          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {postNow ? 'Broadcast Saved & Synced!' : 'Campaign Scheduled into Queue!'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Recorded in your Content Calendar for {selectedSubsidiary.name} ({selectedPlatform}).
            </p>
          </div>

          {/* Quick Real Publish Button inside Success Screen */}
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-left text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-indigo-500" />
                Live Post to Your Real Account:
              </span>
              <span className="text-[10px] text-emerald-500 font-bold">1-CLICK</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Click below to immediately open the official {selectedPlatform} post composer:
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {selectedPlatform === 'TWITTER_X' && (
                <a
                  href={xIntentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/20 text-center"
                >
                  <span>Open X (Twitter) & Post ↗</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {selectedPlatform === 'LINKEDIN' && (
                <a
                  href={linkedinIntentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-blue-600/20 text-center"
                >
                  <span>Open LinkedIn & Share ↗</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {selectedPlatform === 'INSTAGRAM' && (
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-pink-600/20 text-center"
                >
                  <span>Open Instagram Web ↗</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {(selectedPlatform === 'FACEBOOK' || selectedPlatform === 'PINTEREST') && (
                <a
                  href={selectedPlatform === 'FACEBOOK' ? facebookIntentUrl : pinterestIntentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md text-center"
                >
                  <span>Open {selectedPlatform} ↗</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Target Platform:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedPlatform}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Target Handle:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {connectedAccount?.accountHandle || `@${selectedSubsidiary.slug}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Distribution Time:</span>
              <span className="font-semibold text-indigo-500">
                {postNow ? 'Immediate (Instant)' : new Date(scheduledTime).toLocaleString()}
              </span>
            </div>
            {lastDispatchResult && (
              <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-400">Dispatch Status:</span>
                <span className="font-semibold text-emerald-500">
                  {lastDispatchResult.isLive ? 'Live API Verified' : 'Local Queue Synced'}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('calendar')}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>View in Content Calendar</span>
            </button>

            <button
              onClick={resetStudio}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Another Campaign</span>
            </button>
          </div>
        </div>
      ) : (
        /* Scheduling Configuration Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Timing Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Post Now vs Schedule Later Toggle Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-indigo-500" />
                Dispatch Mode
              </span>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPostNow(false)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    !postNow
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <CalendarCheck className={`w-4 h-4 ${!postNow ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      Schedule for Later
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Queue for peak engagement time window
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPostNow(true)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    postNow
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Send className={`w-4 h-4 ${postNow ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      Publish Immediately
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Instant broadcast via social API connector
                  </p>
                </button>
              </div>

              {/* Date & Time Picker (if scheduled) */}
              {!postNow && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Select Date & Time:
                      </label>
                      <input
                        type="datetime-local"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Timezone:
                      </label>
                      <select
                        value={selectedTimezone}
                        onChange={(e) => setSelectedTimezone(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        {TIMEZONES.map((tz) => (
                          <option key={tz.id} value={tz.id}>
                            {tz.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Smart Timing Presets */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      High-Engagement Algorithmic Presets:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {PRESETS.map((p, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handlePresetClick(p.getHoursFromNow)}
                          className="p-2 rounded-lg text-left text-xs bg-slate-50 dark:bg-slate-950/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 transition-colors"
                        >
                          ✦ {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Background Autonomous Cloud Gateway & Ayrshare Key */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-500" />
                  Autonomous Headless Cloud Gateway (Ayrshare)
                </span>
                {hasLiveAyrshareKey ? (
                  <span className="text-[10px] text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    ● AYRSHARE LIVE API ACTIVE
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">
                    Optional Cloud Dispatch
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                If you have an <strong>Ayrshare API Key</strong>, you can paste it below to enable 100% autonomous background dispatching without keeping your browser open:
              </p>

              <div className="flex items-center space-x-2">
                <input
                  type="password"
                  value={ayrshareKeyInput}
                  onChange={(e) => setAyrshareKeyInput(e.target.value)}
                  placeholder="Paste Ayrshare API Key..."
                  className="flex-1 text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleSaveAyrshareKey}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all shrink-0"
                >
                  {ayrshareSavedToast ? 'Saved! ✓' : 'Save Key'}
                </button>
              </div>

              {/* Payload Inspector Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowPayloadInspector(!showPayloadInspector)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>{showPayloadInspector ? 'Hide' : 'Inspect'} JSON Payload to {activeConnector.toUpperCase()}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>

                {showPayloadInspector && (
                  <pre className="mt-2 p-3 rounded-xl bg-slate-950 text-emerald-400 text-[11px] font-mono overflow-x-auto border border-slate-800 max-h-48">
                    {activePayloadString}
                  </pre>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Broadcast Confirmation Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Campaign Summary
              </span>

              <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                <div className="relative group w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <img
                    src={generatedImageUrl || 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=200'}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-[9px] font-bold text-center p-0.5">
                    <Upload className="w-3.5 h-3.5 mb-0.5" />
                    <span>Swap</span>
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
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {selectedSubsidiary.name}
                    </h4>
                    <label className="cursor-pointer text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5">
                      <Upload className="w-3 h-3" />
                      <span>Change Photo</span>
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
                  </div>
                  <div className="text-[11px] text-indigo-500 font-semibold">
                    Target: {selectedPlatform} ({aspectRatio})
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {caption}
                  </p>
                </div>
              </div>

              <div className="text-xs space-y-2 py-2 border-y border-slate-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Account:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {connectedAccount?.accountHandle || `@${selectedSubsidiary.slug}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Scheduled Mode:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {postNow ? 'Immediate Broadcast' : 'Future Queue'}
                  </span>
                </div>
                {!postNow && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Scheduled Time:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                      {new Date(scheduledTime).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Save & Schedule into Calendar */}
              <button
                disabled={isPublishing}
                onClick={handlePublish}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white shadow-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 shadow-indigo-500/25 active:scale-95 flex items-center justify-center space-x-2 transition-all"
              >
                {isPublishing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Syncing & Saving...</span>
                  </>
                ) : (
                  <>
                    <CalendarCheck className="w-4 h-4" />
                    <span>{postNow ? 'Record & Sync Broadcast' : 'Save & Schedule into Queue'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
