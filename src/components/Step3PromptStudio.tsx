'use client';

import React, { useState, useEffect } from 'react';
import { useStudioStore } from '@/lib/store';
import { AIModel } from '@/types';
import {
  Wand2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Cpu,
  Layers,
  MessageSquare,
  Hash,
  Lightbulb,
  Check,
  AlertCircle,
  HelpCircle,
  Key,
  ExternalLink,
  Copy,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const PROMPT_TEMPLATES: Record<string, string[]> = {
  'sub-lumina': [
    'Floating iridescent glass prism dispersing violet and indigo light caustics in a dark zero-gravity studio',
    'Hyper-minimalist parametric pavilion in a foggy twilight landscape with soft interior glow',
    '3D fluid metallic chrome typography spelling visionary aesthetics floating over a deep purple gradient',
  ],
  'sub-apex': [
    'Architectural trading boardroom overlooking Singapore financial district skyline at twilight with gold accents',
    'High-resolution abstract data visualization sculpture in brushed steel and navy crystal',
    'Executive bespoke timepiece resting on black marble desk with warm editorial sidelight',
  ],
  'sub-velvet': [
    'Frosted amber dropper bottle of organic facial elixir resting on terracotta stone with morning sun rays',
    'Close-up macro shot of wild desert blooms with crystalline morning dew drops on silky petals',
    'Minimalist ceramic wellness bowl with botanical dried herbs bathed in soft golden hour light',
  ],
  'sub-zenith': [
    'Titanium robotic hand grasping an origami crane with sub-millimeter tactile micro-sensors',
    'Futuristic carbon-fiber biomechatronic arm assembly in an aerospace cleanroom with cyan rim lighting',
    'Modular autonomous rover chassis traversing simulated lunar topography in high dynamic range',
  ],
};

const MODELS: { id: AIModel; name: string; latency: string; desc: string; badge?: string }[] = [
  {
    id: 'DALL-E-3',
    name: 'ChatGPT (DALL-E 3)',
    latency: '2.4s',
    desc: 'OpenAI premier vision engine with unmatched semantic reasoning & artistic composition',
    badge: 'ChatGPT Engine',
  },
  {
    id: 'Flux.1-Pro',
    name: 'Flux.1 Pro',
    latency: '1.8s',
    desc: 'State-of-the-art prompt adherence, micro-textures, and photorealistic lighting',
  },
  {
    id: 'SDXL-Turbo',
    name: 'SDXL Turbo',
    latency: '0.8s',
    desc: 'Ultra-fast inference optimized for rapid iterative draft cycles',
  },
];

export const Step3PromptStudio: React.FC = () => {
  const {
    selectedSubsidiary,
    selectedPlatform,
    aspectRatio,
    prompt,
    setPrompt,
    caption,
    setCaption,
    hashtags,
    setHashtags,
    enhanceWithBrandTone,
    setEnhanceWithBrandTone,
    selectedModel,
    setSelectedModel,
    isGenerating,
    generationError,
    setGenerationError,
    generatedImageUrl,
    setGeneratedImageUrl,
    triggerGenerate,
    generateAICaption,
    organization,
    setOpenaiApiKey,
    prevStep,
    setStep,
  } = useStudioStore();

  const [newHashtag, setNewHashtag] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiKeySavedToast, setApiKeySavedToast] = useState(false);
  const [copiedPromptToast, setCopiedPromptToast] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [activeImportTab, setActiveImportTab] = useState<'generate' | 'manual_upload' | 'chatgpt_web'>('generate');
  const [manualPhotoPreview, setManualPhotoPreview] = useState<string | null>(null);
  const [manualPhotoName, setManualPhotoName] = useState<string>('');
  const [manualPhotoSize, setManualPhotoSize] = useState<string>('');
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Synchronize local API key input with store
  useEffect(() => {
    if (organization.openaiApiKey && !organization.openaiApiKey.includes('demo')) {
      setApiKeyInput(organization.openaiApiKey);
    }
  }, [organization.openaiApiKey]);

  // Synchronize manual photo preview if store already has an image
  useEffect(() => {
    if (generatedImageUrl && !manualPhotoPreview) {
      setManualPhotoPreview(generatedImageUrl);
    }
  }, [generatedImageUrl, manualPhotoPreview]);

  const hasOpenAiKey =
    (apiKeyInput.trim().startsWith('sk-') && !apiKeyInput.includes('demo')) ||
    (organization.openaiApiKey &&
      organization.openaiApiKey.startsWith('sk-') &&
      !organization.openaiApiKey.includes('demo'));

  const brandTemplates = PROMPT_TEMPLATES[selectedSubsidiary.id] || PROMPT_TEMPLATES['sub-lumina'];

  const handleAddHashtag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newHashtag.trim()) {
      e.preventDefault();
      const formatted = newHashtag.startsWith('#') ? newHashtag.trim() : `#${newHashtag.trim()}`;
      if (!hashtags.includes(formatted)) {
        setHashtags([...hashtags, formatted]);
      }
      setNewHashtag('');
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter((t) => t !== tagToRemove));
  };

  const handleApiKeyChange = (val: string) => {
    setApiKeyInput(val);
    setTestResult(null);
    if (val.trim().startsWith('sk-')) {
      setOpenaiApiKey(val.trim());
    }
  };

  const handleTestApiKey = async () => {
    const keyToTest = apiKeyInput.trim() || organization.openaiApiKey?.trim();
    if (!keyToTest) return;
    setIsTestingKey(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/test-openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: keyToTest }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({ success: true, message: 'Valid OpenAI Key! Connected to DALL-E 3 & GPT-4o.' });
        setOpenaiApiKey(keyToTest);
      } else {
        setTestResult({ success: false, message: data.error || 'OpenAI verification failed.' });
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Connection test failed.' });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSaveApiKey = () => {
    setOpenaiApiKey(apiKeyInput.trim());
    setApiKeySavedToast(true);
    setGenerationError(null);
    setTimeout(() => setApiKeySavedToast(false), 2500);
  };

  const handleGenerateVisual = () => {
    // Pass current typed key explicitly to triggerGenerate
    triggerGenerate(undefined, apiKeyInput.trim());
  };

  const handleCopyPromptAndOpenChatGPT = () => {
    navigator.clipboard.writeText(prompt);
    setCopiedPromptToast(true);
    setTimeout(() => setCopiedPromptToast(false), 2500);
    window.open('https://chatgpt.com/', '_blank');
  };

  const handleApplyCustomImageUrl = () => {
    if (!customImageUrl.trim()) return;
    setGeneratedImageUrl(customImageUrl.trim());
    setGenerationError(null);
    setStep(4);
  };

  const handleManualFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setManualPhotoName(file.name);
    setManualPhotoSize((file.size / 1024).toFixed(1) + ' KB');

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setManualPhotoPreview(result);
        setGeneratedImageUrl(result);
        setGenerationError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmManualPhoto = () => {
    if (manualPhotoPreview) {
      setGeneratedImageUrl(manualPhotoPreview);
      setGenerationError(null);
      setStep(4);
    }
  };

  const handleManualUrlApply = () => {
    if (!customImageUrl.trim()) return;
    setManualPhotoPreview(customImageUrl.trim());
    setManualPhotoName('Web Photo Asset');
    setGeneratedImageUrl(customImageUrl.trim());
    setGenerationError(null);
    setStep(4);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setGeneratedImageUrl(result);
        setGenerationError(null);
        setStep(4);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-2">
            <span>Step 3 of 5</span>
            <span>•</span>
            <span>Generative Prompt Engineering</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Compose Prompt & AI Generation Engine
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Engineered for <strong className="text-slate-800 dark:text-slate-200">{selectedSubsidiary.name}</strong> on <span className="font-semibold text-indigo-500">{selectedPlatform}</span> ({aspectRatio}).
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

          {activeImportTab === 'manual_upload' ? (
            <button
              disabled={!manualPhotoPreview && !generatedImageUrl}
              onClick={handleConfirmManualPhoto}
              className={`inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-all ${
                !manualPhotoPreview && !generatedImageUrl
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/25 active:scale-95'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Use This Photo & Preview ➔</span>
            </button>
          ) : (
            <button
              disabled={isGenerating || !prompt.trim()}
              onClick={handleGenerateVisual}
              className={`inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-all ${
                isGenerating || !prompt.trim()
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 shadow-indigo-500/25 active:scale-95'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Visual...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Visual & Preview</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Generation Error Banner if failed */}
      {generationError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-200 space-y-3">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <h4 className="font-bold text-sm">Image Generation Notice</h4>
              <p className="mt-1 font-mono text-[11px] text-rose-700 dark:text-rose-300">
                {generationError}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedModel('Flux.1-Pro');
                    triggerGenerate();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition-all"
                >
                  Generate with Free High-Fidelity Diffusion
                </button>
                <button
                  type="button"
                  onClick={handleCopyPromptAndOpenChatGPT}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 hover:bg-slate-50 text-rose-700 dark:text-rose-300 font-bold text-[11px] transition-all flex items-center space-x-1"
                >
                  <span>Open Prompt on ChatGPT Web (chatgpt.com) ↗</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGenerationError(null)}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold ml-2"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3 Main Workflow Modes: AI Generator vs Manual Photo Upload vs ChatGPT Web */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveImportTab('generate')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeImportTab === 'generate'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Visual Generator (ChatGPT DALL-E 3)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveImportTab('manual_upload')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeImportTab === 'manual_upload'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Upload className="w-4 h-4 text-emerald-500" />
          <span>📷 Add / Upload Photo Manually</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold uppercase tracking-wide">
            Direct File
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveImportTab('chatgpt_web')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeImportTab === 'chatgpt_web'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Import from ChatGPT Web (chatgpt.com)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold">
            Zero API Key
          </span>
        </button>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Prompt & Model Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {activeImportTab === 'generate' && (
            <>
              {/* Manual Photo Shortcut Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/20 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 rounded-lg bg-emerald-500 text-white shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-100">Have your own photo or graphic?</span>
                    <span className="hidden sm:inline text-slate-500 dark:text-slate-400 ml-1">Upload directly without AI prompt.</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveImportTab('manual_upload')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm shrink-0 flex items-center space-x-1"
                >
                  <span>📷 Add Photo Manually</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Prompt Input Box */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5 text-indigo-500" />
                    Image Generation Prompt
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {prompt.length} chars
                  </span>
                </div>

                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your desired subject matter, composition, environment, and lighting..."
                  className="w-full text-sm p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                />

                {/* Prompt Inspiration Chips */}
                <div>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium mb-2">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>Brand Inspiration Seeds (Click to load):</span>
                  </div>
                  <div className="space-y-1.5">
                    {brandTemplates.map((template, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPrompt(template)}
                        className="w-full text-left p-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-950/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800/60 transition-colors line-clamp-1"
                      >
                        ✦ {template}
                      </button>
                    ))}
                  </div>
                </div>

                {/* "Enhance with Brand Tone" Master Switch */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-pink-50/40 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/60">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Enhance with Brand Tone Engine
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                          {enhanceWithBrandTone ? 'ACTIVE' : 'RAW PROMPT'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {enhanceWithBrandTone
                          ? `Applies ${selectedSubsidiary.name} visual aesthetics (${selectedSubsidiary.brandTone}) and professional lighting directives to match ${selectedPlatform}.`
                          : 'Generates directly with your raw prompt without applying brand styling keywords.'}
                      </p>
                      {enhanceWithBrandTone && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {selectedSubsidiary.toneKeywords.map((kw, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-medium px-2 py-0.5 rounded bg-white/80 dark:bg-slate-900/80 text-indigo-600 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60"
                            >
                              +{kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                      <input
                        type="checkbox"
                        checked={enhanceWithBrandTone}
                        onChange={(e) => setEnhanceWithBrandTone(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* AI Model Engine Selector */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                    Inference Model Architecture
                  </label>
                  <span className="text-[11px] text-slate-400">ChatGPT & Diffusion Gateway</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {MODELS.map((m) => {
                    const isSelected = selectedModel === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedModel(m.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all relative ${
                          isSelected
                            ? 'bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20'
                            : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        {m.badge && (
                          <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[9px] font-extrabold uppercase tracking-wider shadow-sm">
                            {m.badge}
                          </span>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {m.name}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-500 font-semibold">
                            {m.latency}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {m.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* OpenAI / ChatGPT API Key Configuration (Inline) */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Key className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      ChatGPT (OpenAI DALL-E 3) API Key
                    </span>
                  </div>

                  {hasOpenAiKey ? (
                    <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>DALL-E 3 Connected</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      <span>Free Diffusion Active</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {hasOpenAiKey
                    ? 'Your OpenAI API key is active. Images are generated directly using OpenAI DALL-E 3.'
                    : 'To generate images directly using your ChatGPT / OpenAI developer account, paste your key below (starts with sk-). Or use our free High-Fidelity Diffusion engine with zero setup.'}
                </p>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={apiKeyInput}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    placeholder="sk-proj-xxxxxxxxxxxxxxxxxxxx..."
                    className="flex-1 text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleTestApiKey}
                    disabled={isTestingKey || !apiKeyInput.trim()}
                    className="px-3 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs transition-all shrink-0 disabled:opacity-50"
                  >
                    {isTestingKey ? 'Verifying...' : '⚡ Test Key'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveApiKey}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all shrink-0"
                  >
                    {apiKeySavedToast ? 'Saved! ✓' : 'Save Key'}
                  </button>
                </div>

                {testResult && (
                  <div
                    className={`p-2.5 rounded-xl text-[11px] font-medium flex items-center space-x-2 ${
                      testResult.success
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Manual Photo Upload Studio Tab */}
          {activeImportTab === 'manual_upload' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Direct Photo Upload Studio</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Add or Upload Photo Manually
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Select and upload your own product visuals, graphic assets, photos, or screenshots directly from your computer. You can also paste any image URL or choose a high-res sample.
                </p>
              </div>

              {/* Drag & Drop File Zone */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                  Method 1: Upload Photo from Your Device / Computer
                </label>

                <label className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-emerald-400/80 dark:border-emerald-600 hover:border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 cursor-pointer transition-all group">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-3 shadow-sm">
                    <Upload className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Click to Browse Files or Drag Photo Here
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Supports PNG, JPG, JPEG, WEBP, GIF, AVIF
                  </span>
                  <span className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-600/25 group-hover:bg-emerald-700 transition-colors">
                    📁 Choose Photo from Computer
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleManualFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Paste Image URL */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                  Method 2: Paste Direct Image Web Address (URL)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg or image address..."
                    className="flex-1 text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    disabled={!customImageUrl.trim()}
                    onClick={handleManualUrlApply}
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 shrink-0"
                  >
                    Load URL
                  </button>
                </div>
              </div>

              {/* Quick Sample Presets */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Sample Photography Presets (Click any to test immediately):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    {
                      name: 'Luxury Product',
                      url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1080&auto=format&fit=crop&q=80',
                    },
                    {
                      name: 'Minimal Tech',
                      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1080&auto=format&fit=crop&q=80',
                    },
                    {
                      name: 'Fashion / Model',
                      url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1080&auto=format&fit=crop&q=80',
                    },
                    {
                      name: 'Architecture',
                      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1080&auto=format&fit=crop&q=80',
                    },
                  ].map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setManualPhotoPreview(sample.url);
                        setManualPhotoName(sample.name);
                        setGeneratedImageUrl(sample.url);
                        setGenerationError(null);
                      }}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 transition-all flex items-center space-x-2 text-left group"
                    >
                      <img
                        src={sample.url}
                        alt={sample.name}
                        className="w-9 h-9 rounded-lg object-cover shrink-0"
                      />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 truncate">
                        {sample.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview of Uploaded Photo */}
              {(manualPhotoPreview || generatedImageUrl) && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/50 border-2 border-emerald-400 dark:border-emerald-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="text-xs font-bold">Selected Photo Asset Ready</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setManualPhotoPreview(null);
                        setManualPhotoName('');
                        setManualPhotoSize('');
                        setGeneratedImageUrl('');
                      }}
                      className="text-xs text-rose-500 font-semibold hover:underline"
                    >
                      Remove Photo
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-32 h-32 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 border border-emerald-200 dark:border-emerald-800 shadow-md">
                      <img
                        src={manualPhotoPreview || generatedImageUrl || ''}
                        alt="Manual Upload Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-1 text-center sm:text-left">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {manualPhotoName || 'Custom Photo Asset'}
                      </h4>
                      {manualPhotoSize && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          Size: {manualPhotoSize}
                        </p>
                      )}
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        Aspect Ratio tailored for {selectedPlatform} ({aspectRatio})
                      </p>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleConfirmManualPhoto}
                          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2"
                        >
                          <span>Use This Photo & Continue to Step 4 Preview Gate</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ChatGPT Web Companion Tab */}
          {activeImportTab === 'chatgpt_web' && (
            /* ChatGPT Web Companion & Direct Visual Importer Tab */
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  <span>Method 2: Use Your Existing ChatGPT Account</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Generate on ChatGPT (chatgpt.com) & Import
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  If you have a ChatGPT Plus or free account, you can generate the image directly on ChatGPT without paying for developer API tokens.
                </p>
              </div>

              {/* Step 1: Copy Prompt & Open ChatGPT */}
              <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    Step 1: Open ChatGPT with Your Brand Prompt
                  </span>
                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">1-CLICK</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Click the button below to automatically copy your tailored prompt to clipboard and launch ChatGPT in a new tab:
                </p>
                <button
                  type="button"
                  onClick={handleCopyPromptAndOpenChatGPT}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copiedPromptToast ? 'Prompt Copied! Opening ChatGPT ↗' : 'Copy Prompt & Open ChatGPT (chatgpt.com) ↗'}</span>
                </button>
              </div>

              {/* Step 2: Paste Image URL or Upload File */}
              <div className="space-y-4 pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Step 2: Bring the Generated Visual into OmniBrand Studio
                </div>

                {/* Option A: Paste URL */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 dark:text-slate-400 block">
                    Option A: Paste Image URL (Right-click image in ChatGPT → &ldquo;Copy Image Address&rdquo;):
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="url"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      placeholder="https://... (or right-click image in ChatGPT and paste URL)"
                      className="flex-1 text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      disabled={!customImageUrl.trim()}
                      onClick={handleApplyCustomImageUrl}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 shrink-0"
                    >
                      Apply & Preview ↗
                    </button>
                  </div>
                </div>

                {/* Option B: Upload File */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-xs text-slate-500 dark:text-slate-400 block">
                    Option B: Upload Image File from your Computer (Saved from ChatGPT):
                  </label>
                  <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-950/30 cursor-pointer transition-all">
                    <Upload className="w-6 h-6 text-indigo-500 mb-2" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Click to Browse or Drag Image File Here
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      Supports JPG, PNG, WEBP (Instant Preview Gate)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Social Post Copy & Hashtags (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                Target Social Caption
              </label>

              <button
                type="button"
                onClick={generateAICaption}
                className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Sparkles className="w-3 h-3" />
                <span>AI Rewrite</span>
              </button>
            </div>

            <textarea
              rows={6}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Caption will be automatically matched to the brand tone, platform rules, and prompt theme..."
              className="w-full text-sm p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
            />

            {/* Hashtag Manager */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-indigo-500" />
                  Target Hashtags ({hashtags.length})
                </span>
                <span className="text-[10px] text-slate-400">Press Enter to add</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeHashtag(tag)}
                      className="text-slate-400 hover:text-red-500 ml-1 text-xs font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <input
                type="text"
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
                onKeyDown={handleAddHashtag}
                placeholder="Type tag (e.g. #CreativeAI) and press Enter"
                className="w-full text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Generation / Photo Ready Card */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {activeImportTab === 'manual_upload' ? 'Photo Asset Ready' : 'Ready for Visual Synthesis'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Resolution: {aspectRatio} • {activeImportTab === 'manual_upload' ? 'Direct File Upload' : `Engine: ${selectedModel}`}
              </div>
            </div>

            {activeImportTab === 'manual_upload' ? (
              <button
                disabled={!manualPhotoPreview && !generatedImageUrl}
                onClick={handleConfirmManualPhoto}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Use Photo & Preview</span>
              </button>
            ) : (
              <button
                disabled={isGenerating || !prompt.trim()}
                onClick={handleGenerateVisual}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Visual</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Animated Loading Skeleton overlay if generating */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md">
          <div className="max-w-md w-full mx-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-500/40 animate-pulse">
              <Wand2 className="w-8 h-8 animate-spin" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Synthesizing Visual Asset
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Applying {selectedSubsidiary.brandTone} aesthetic directives via {selectedModel}...
              </p>
            </div>

            {/* Skeleton progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-3/4 animate-[shimmer_1.5s_infinite]" />
            </div>

            <div className="text-[11px] font-mono text-indigo-500 font-semibold">
              Step 4 Preview Gate unlocking momentarily...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
