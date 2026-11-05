'use client';

import React, { useEffect } from 'react';
import { useStudioStore } from '@/lib/store';
import { Header } from '@/components/Header';
import { StepperNav } from '@/components/StepperNav';
import { Step1BrandSelector } from '@/components/Step1BrandSelector';
import { Step2PlatformSelector } from '@/components/Step2PlatformSelector';
import { Step3PromptStudio } from '@/components/Step3PromptStudio';
import { Step4PostPreview } from '@/components/Step4PostPreview';
import { Step5SchedulePublish } from '@/components/Step5SchedulePublish';
import { ContentCalendar } from '@/components/ContentCalendar';
import { BrandKitManager } from '@/components/BrandKitManager';
import { SettingsModal } from '@/components/SettingsModal';
import { EditSubsidiaryModal } from '@/components/EditSubsidiaryModal';
import { EditOrgModal } from '@/components/EditOrgModal';
import { ConnectSocialAccountModal } from '@/components/ConnectSocialAccountModal';

export default function Home() {
  const { currentStep, activeTab, theme, hydrateFromStorage } = useStudioStore();

  // Hydrate persistent custom company names and social accounts on mount
  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  // Apply dark mode class to root HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans flex flex-col">
      {/* Top Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'studio' && (
          <div className="space-y-6">
            {/* 5-Step Stepper Navigation */}
            <StepperNav />

            {/* Step Views */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm">
              {currentStep === 1 && <Step1BrandSelector />}
              {currentStep === 2 && <Step2PlatformSelector />}
              {currentStep === 3 && <Step3PromptStudio />}
              {currentStep === 4 && <Step4PostPreview />}
              {currentStep === 5 && <Step5SchedulePublish />}
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm">
            <ContentCalendar />
          </div>
        )}

        {activeTab === 'brands' && (
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm">
            <BrandKitManager />
          </div>
        )}
      </main>

      {/* Modals & Drawers */}
      <SettingsModal />
      <EditSubsidiaryModal />
      <EditOrgModal />
      <ConnectSocialAccountModal />

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800/80 py-6 text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              OmniBrand Studio
            </span>
            <span>•</span>
            <span>Enterprise Multi-Tenant AI Social Automation Architecture</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span className="text-[11px] font-mono text-emerald-500">Live Ayrshare + Flux Engine</span>
            </span>
            <span>Prisma ORM • Next.js 14 App Router</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
