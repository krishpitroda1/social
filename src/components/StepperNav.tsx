'use client';

import React from 'react';
import { useStudioStore } from '@/lib/store';
import {
  Building,
  Share2,
  Wand2,
  Eye,
  CalendarCheck,
  Check,
} from 'lucide-react';

const STEPS = [
  {
    step: 1,
    title: 'Subsidiary',
    subtitle: 'Brand Context',
    icon: Building,
  },
  {
    step: 2,
    title: 'Platform',
    subtitle: 'Target Channels',
    icon: Share2,
  },
  {
    step: 3,
    title: 'AI Engine',
    subtitle: 'Visuals & Copy',
    icon: Wand2,
  },
  {
    step: 4,
    title: 'Preview Gate',
    subtitle: 'Mock & Approval',
    icon: Eye,
  },
  {
    step: 5,
    title: 'Schedule',
    subtitle: 'Ayrshare / Buffer',
    icon: CalendarCheck,
  },
];

export const StepperNav: React.FC = () => {
  const { currentStep, setStep, isApproved, generatedImageUrl } = useStudioStore();

  const isStepClickable = (stepNumber: number) => {
    if (stepNumber === 1 || stepNumber === 2 || stepNumber === 3) return true;
    if (stepNumber === 4 && (generatedImageUrl || currentStep >= 4)) return true;
    if (stepNumber === 5 && isApproved) return true;
    return false;
  };

  return (
    <div className="w-full py-4 px-2 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="relative flex items-center justify-between">
          {/* Background Connecting Line */}
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />

          {/* Active Progress Fill */}
          <div
            className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 -z-0 transition-all duration-500"
            style={{
              width: `calc(${((currentStep - 1) / (STEPS.length - 1)) * 100}% - 3rem)`,
            }}
          />

          {STEPS.map((s) => {
            const Icon = s.icon;
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;
            const clickable = isStepClickable(s.step);

            return (
              <button
                key={s.step}
                type="button"
                disabled={!clickable}
                onClick={() => clickable && setStep(s.step)}
                className={`group relative flex flex-col items-center focus:outline-none transition-all ${
                  !clickable ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                }`}
              >
                {/* Node Circle */}
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-bold text-xs transition-all duration-300 z-10 ${
                    isActive
                      ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/40 ring-4 ring-indigo-500/20 scale-110'
                      : isCompleted
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </div>

                {/* Step Text Labels */}
                <div className="mt-2 text-center">
                  <div
                    className={`text-xs font-semibold whitespace-nowrap transition-colors ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                        : isCompleted
                        ? 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {s.title}
                  </div>
                  <div className="hidden sm:block text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                    {s.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

