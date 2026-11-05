'use client';

import React, { useState } from 'react';
import { useStudioStore } from '@/lib/store';
import {
  Settings,
  Key,
  CheckCircle2,
  Cpu,
  Share2,
  Building2,
  Shield,
  Save,
  X,
  Sparkles,
  Zap,
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { organization, isSettingsOpen, setSettingsOpen, updateOrganization, setOpenaiApiKey, setAyrshareApiKey } = useStudioStore();

  const [replicateKey, setReplicateKey] = useState(organization.replicateApiKey || '');
  const [openaiKey, setOpenaiKey] = useState(organization.openaiApiKey || '');
  const [ayrshareKey, setAyrshareKey] = useState(organization.ayrshareApiKey || '');
  const [bufferKey, setBufferKey] = useState(organization.bufferToken || '');
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isSettingsOpen) return null;

  const handleTestOpenAi = async () => {
    if (!openaiKey.trim()) return;
    setIsTestingKey(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/test-openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: openaiKey.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({ success: true, message: 'Valid OpenAI Key! Connected to DALL-E 3 & GPT.' });
      } else {
        setTestResult({ success: false, message: data.error || 'OpenAI verification failed.' });
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Network test failed.' });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Persist to store & storage
    updateOrganization({
      replicateApiKey: replicateKey.trim(),
      openaiApiKey: openaiKey.trim(),
      ayrshareApiKey: ayrshareKey.trim(),
      bufferToken: bufferKey.trim(),
    });

    setIsSavedToast(true);
    setTimeout(() => {
      setIsSavedToast(false);
      setSettingsOpen(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                API Keys & Live Integrations
              </h3>
              <p className="text-[11px] text-slate-400">
                Connect your real Replicate, OpenAI, and Ayrshare accounts
              </p>
            </div>
          </div>

          <button
            onClick={() => setSettingsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Real Dynamic Engine Notice */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start space-x-3">
          <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <strong className="text-emerald-700 dark:text-emerald-400">Real-Time Diffusion Active:</strong> The studio dynamically generates unique, brand-new real AI images according to your prompt on the fly. Enter your keys below if you want to route directly through your personal OpenAI or Replicate billing accounts!
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* AI Generation Keys */}
          <div className="space-y-3">
            <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-500" />
              Diffusion Engine API Keys
            </span>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 dark:text-slate-300 font-semibold">
                  OpenAI API Key (DALL-E 3 & GPT):
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleTestOpenAi}
                    disabled={isTestingKey || !openaiKey.trim()}
                    className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50"
                  >
                    {isTestingKey ? 'Verifying...' : '⚡ Test Key'}
                  </button>
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-slate-400 hover:underline"
                  >
                    Get OpenAI Key ↗
                  </a>
                </div>
              </div>
              <input
                type="text"
                value={openaiKey}
                onChange={(e) => {
                  const val = e.target.value;
                  setOpenaiKey(val);
                  setTestResult(null);
                  if (val.trim().startsWith('sk-')) {
                    setOpenaiApiKey(val.trim());
                  }
                }}
                placeholder="sk-proj-..."
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              {testResult && (
                <div
                  className={`mt-2 p-2.5 rounded-xl text-[11px] font-medium flex items-center space-x-2 ${
                    testResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 dark:text-slate-300 font-semibold">
                  Replicate API Token (Flux.1 Pro & SDXL):
                </label>
                <a
                  href="https://replicate.com/account/api-tokens"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-indigo-500 hover:underline"
                >
                  Get Replicate Token ↗
                </a>
              </div>
              <input
                type="text"
                value={replicateKey}
                onChange={(e) => setReplicateKey(e.target.value)}
                placeholder="r8_..."
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Social Publishing Connectors */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-indigo-500" />
              Omnichannel Social Connectors
            </span>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 dark:text-slate-300 font-semibold">
                  Ayrshare API Key (Direct Social Publishing):
                </label>
                <a
                  href="https://www.ayrshare.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-indigo-500 hover:underline"
                >
                  Get Ayrshare Key ↗
                </a>
              </div>
              <input
                type="text"
                value={ayrshareKey}
                onChange={(e) => setAyrshareKey(e.target.value)}
                placeholder="AYR_..."
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                Buffer Publish Access Token:
              </label>
              <input
                type="text"
                value={bufferKey}
                onChange={(e) => setBufferKey(e.target.value)}
                placeholder="buff_..."
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavedToast ? 'Saved!' : 'Save & Apply Keys'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
