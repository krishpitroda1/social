import { create } from 'zustand';
import {
  Organization,
  Subsidiary,
  SocialAccount,
  SocialPlatform,
  AspectRatio,
  AIModel,
  PostStatus,
  ScheduledPost,
  GenerationHistoryItem,
} from '@/types';
import {
  mockOrganization,
  mockSubsidiaries,
  mockSocialAccounts,
  mockPosts,
} from '@/lib/mock-data';
import { enhancePromptWithBrandTone, generateBrandCaption, generateVisualEngine } from '@/lib/ai-engine';
import { formatAyrsharePayload, formatBufferPayload, dispatchToSocialConnector } from '@/lib/social-connectors';

const STORAGE_KEY = 'omnibrand_studio_state_v4';

function loadSavedState(): {
  organization?: Organization;
  subsidiaries?: Subsidiary[];
  selectedSubsidiary?: Subsidiary;
  socialAccounts?: SocialAccount[];
  posts?: ScheduledPost[];
} {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse saved state from localStorage:', e);
  }
  return {};
}

function saveStateToStorage(state: {
  organization: Organization;
  subsidiaries: Subsidiary[];
  selectedSubsidiary: Subsidiary;
  socialAccounts: SocialAccount[];
  posts: ScheduledPost[];
}) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        organization: state.organization,
        subsidiaries: state.subsidiaries,
        selectedSubsidiary: state.selectedSubsidiary,
        socialAccounts: state.socialAccounts,
        posts: state.posts,
      })
    );
  } catch (e) {
    console.warn('Failed to save state to localStorage:', e);
  }
}

// Background sync helpers with server persistent database (data/db.json)
function syncSubsidiaryToServer(sub: Subsidiary, method: 'PUT' | 'POST') {
  if (typeof window === 'undefined') return;
  fetch('/api/subsidiaries', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sub),
  }).catch((err) => console.warn('[server-db] Sync subsidiary error:', err));
}

function deleteSubsidiaryFromServer(id: string) {
  if (typeof window === 'undefined') return;
  fetch(`/api/subsidiaries?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }).catch((err) => console.warn('[server-db] Delete subsidiary error:', err));
}

function syncOrganizationToServer(org: Organization) {
  if (typeof window === 'undefined') return;
  fetch('/api/organization', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(org),
  }).catch((err) => console.warn('[server-db] Sync organization error:', err));
}

function syncSocialAccountToServer(account: SocialAccount) {
  if (typeof window === 'undefined') return;
  fetch('/api/social-accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(account),
  }).catch((err) => console.warn('[server-db] Sync social account error:', err));
}

function syncPostToServer(post: ScheduledPost) {
  if (typeof window === 'undefined') return;
  fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post),
  }).catch((err) => console.warn('[server-db] Sync post error:', err));
}

function deletePostFromServer(id: string) {
  if (typeof window === 'undefined') return;
  fetch(`/api/posts?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }).catch((err) => console.warn('[server-db] Delete post error:', err));
}

interface StudioState {
  // Tenant & Brand State
  organization: Organization;
  subsidiaries: Subsidiary[];
  selectedSubsidiary: Subsidiary;
  editingSubsidiary: Subsidiary | null;
  isEditSubsidiaryModalOpen: boolean;
  isEditOrgModalOpen: boolean;

  // Social Accounts State
  socialAccounts: SocialAccount[];
  isConnectAccountModalOpen: boolean;
  connectingPlatform: SocialPlatform | null;

  // Navigation & View
  currentStep: number;
  activeTab: 'studio' | 'calendar' | 'brands' | 'settings';
  theme: 'dark' | 'light';
  isSettingsOpen: boolean;

  // Workflow Parameters (Steps 1-5)
  selectedPlatform: SocialPlatform;
  aspectRatio: AspectRatio;
  prompt: string;
  enhancedPrompt: string;
  enhanceWithBrandTone: boolean;
  selectedModel: AIModel;
  caption: string;
  hashtags: string[];

  // Generation & Gate State
  isGenerating: boolean;
  generationError: string | null;
  generatedImageUrl: string | null;
  generatedSeed: number | null;
  rejectionFeedback: string;
  revisionHistory: GenerationHistoryItem[];
  isApproved: boolean;

  // Scheduling State
  scheduledTime: string;
  postNow: boolean;
  isPublishing: boolean;
  publishSuccess: boolean;
  lastPublishedPostId: string | null;
  lastDispatchResult: {
    isLive?: boolean;
    connector?: string;
    externalPostId?: string;
    postUrl?: string;
    rawResponse?: any;
  } | null;

  // Posts / History / Calendar State
  posts: ScheduledPost[];
  filterStatus: 'ALL' | PostStatus;
  filterPlatform: 'ALL' | SocialPlatform;
  filterBrandId: 'ALL' | string;

  // Actions
  hydrateFromStorage: () => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setSelectedSubsidiary: (sub: Subsidiary) => void;
  setSelectedPlatform: (platform: SocialPlatform) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  setPrompt: (prompt: string) => void;
  setGeneratedImageUrl: (url: string) => void;
  setCaption: (caption: string) => void;
  setHashtags: (hashtags: string[]) => void;
  setEnhanceWithBrandTone: (val: boolean) => void;
  setSelectedModel: (model: AIModel) => void;
  setRejectionFeedback: (feedback: string) => void;
  setScheduledTime: (time: string) => void;
  setPostNow: (val: boolean) => void;
  setActiveTab: (tab: 'studio' | 'calendar' | 'brands' | 'settings') => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setSettingsOpen: (open: boolean) => void;
  setEditSubsidiaryModalOpen: (open: boolean, sub?: Subsidiary | null) => void;
  setEditOrgModalOpen: (open: boolean) => void;
  setConnectAccountModalOpen: (open: boolean, platform?: SocialPlatform | null) => void;
  connectSocialAccount: (subsidiaryId: string, platform: SocialPlatform, data: Partial<SocialAccount>) => void;
  disconnectSocialAccount: (subsidiaryId: string, platform: SocialPlatform) => void;
  setFilterStatus: (status: 'ALL' | PostStatus) => void;
  setFilterPlatform: (platform: 'ALL' | SocialPlatform) => void;
  setFilterBrandId: (brandId: 'ALL' | string) => void;
  setGenerationError: (err: string | null) => void;
  setOpenaiApiKey: (key: string) => void;
  setAyrshareApiKey: (key: string) => void;

  // Async Workflow Actions
  triggerGenerate: (feedback?: string, explicitApiKey?: string) => Promise<void>;
  rejectAndRegenerate: (feedback: string) => Promise<void>;
  approvePost: () => void;
  publishOrSchedule: () => Promise<void>;
  resetStudio: () => void;
  deletePost: (id: string) => void;
  updateBrand: (updated: Subsidiary) => void;
  addBrand: (newBrand: Subsidiary) => void;
  deleteSubsidiary: (id: string) => void;
  updateOrganization: (updates: Partial<Organization>) => void;
  generateAICaption: () => void;
  resetToDefaults: () => void;
}

export const useStudioStore = create<StudioState>((set, get) => {
  const initialLocal = typeof window !== 'undefined' ? loadSavedState() : {};
  const initialSubs =
    initialLocal.subsidiaries && initialLocal.subsidiaries.length > 0
      ? initialLocal.subsidiaries
      : mockSubsidiaries;
  const initialOrg = initialLocal.organization || mockOrganization;
  const initialSelected =
    initialLocal.selectedSubsidiary && initialSubs.some((s) => s.id === initialLocal.selectedSubsidiary?.id)
      ? initialLocal.selectedSubsidiary
      : initialSubs[0];
  const initialAccounts = initialLocal.socialAccounts || mockSocialAccounts;
  const initialPosts = initialLocal.posts || mockPosts;

  return {
    organization: initialOrg,
    subsidiaries: initialSubs,
    selectedSubsidiary: initialSelected,
    editingSubsidiary: null,
    isEditSubsidiaryModalOpen: false,
    isEditOrgModalOpen: false,

    socialAccounts: initialAccounts,
    isConnectAccountModalOpen: false,
    connectingPlatform: null,

    currentStep: 1,
    activeTab: 'studio',
    theme: 'dark',
    isSettingsOpen: false,

    selectedPlatform: 'INSTAGRAM',
    aspectRatio: '1:1',
    prompt: 'A sleek luxury perfume bottle resting on black obsidian stone in morning golden light',
    enhancedPrompt: '',
    enhanceWithBrandTone: true,
    // Default to ChatGPT's engine (DALL-E 3)
    selectedModel: 'DALL-E-3',
    caption: '',
    hashtags: [],

    isGenerating: false,
    generationError: null,
    generatedImageUrl: null,
    generatedSeed: null,
    rejectionFeedback: '',
    revisionHistory: [],
    isApproved: false,

    scheduledTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    postNow: false,
    isPublishing: false,
    publishSuccess: false,
    lastPublishedPostId: null,
    lastDispatchResult: null,

    posts: initialPosts,
    filterStatus: 'ALL',
    filterPlatform: 'ALL',
    filterBrandId: 'ALL',

    hydrateFromStorage: async () => {
      // 1. Instant client-side hydration from localStorage
      const saved = loadSavedState();
      if (Object.keys(saved).length > 0) {
        set((state) => {
          const subs = saved.subsidiaries && saved.subsidiaries.length > 0 ? saved.subsidiaries : state.subsidiaries;
          const org = saved.organization || state.organization;
          const selected =
            saved.selectedSubsidiary && subs.some((s) => s.id === saved.selectedSubsidiary?.id)
              ? saved.selectedSubsidiary
              : subs[0];
          const accounts = saved.socialAccounts || state.socialAccounts;
          const p = saved.posts || state.posts;

          return {
            subsidiaries: subs,
            organization: org,
            selectedSubsidiary: selected,
            socialAccounts: accounts,
            posts: p,
          };
        });
      }

      // 2. Reconcile with ground-truth persistent server database (/api/bootstrap)
      try {
        const res = await fetch('/api/bootstrap');
        const json = await res.json();
        if (json.success && json.data) {
          const { organization, subsidiaries, socialAccounts, posts } = json.data;

          set((state) => {
            const subs = subsidiaries && subsidiaries.length > 0 ? subsidiaries : state.subsidiaries;
            const org = organization || state.organization;
            const selected =
              state.selectedSubsidiary && subs.some((s: Subsidiary) => s.id === state.selectedSubsidiary?.id)
                ? subs.find((s: Subsidiary) => s.id === state.selectedSubsidiary?.id)
                : subs[0];
            const accounts = socialAccounts || state.socialAccounts;
            const p = posts || state.posts;

            saveStateToStorage({
              organization: org,
              subsidiaries: subs,
              selectedSubsidiary: selected,
              socialAccounts: accounts,
              posts: p,
            });

            return {
              subsidiaries: subs,
              organization: org,
              selectedSubsidiary: selected,
              socialAccounts: accounts,
              posts: p,
            };
          });
        }
      } catch (e) {
        console.warn('[store] Server DB sync offline, using local cache:', e);
      }
    },

  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 5) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

  setSelectedSubsidiary: (sub) => {
    const { prompt, selectedPlatform } = get();
    let ratio: AspectRatio = '1:1';
    if (selectedPlatform === 'TWITTER_X' || selectedPlatform === 'LINKEDIN') ratio = '16:9';
    if (selectedPlatform === 'PINTEREST') ratio = '4:5';

    set({
      selectedSubsidiary: sub,
      aspectRatio: ratio,
    });

    const state = get();
    saveStateToStorage({
      organization: state.organization,
      subsidiaries: state.subsidiaries,
      selectedSubsidiary: sub,
      socialAccounts: state.socialAccounts,
      posts: state.posts,
    });

    const { caption, hashtags } = generateBrandCaption(prompt, sub, selectedPlatform);
    set({ caption, hashtags });
  },

  setSelectedPlatform: (platform) => {
    let defaultRatio: AspectRatio = '1:1';
    if (platform === 'TWITTER_X' || platform === 'LINKEDIN') defaultRatio = '16:9';
    if (platform === 'PINTEREST') defaultRatio = '4:5';

    const { prompt, selectedSubsidiary } = get();
    const { caption, hashtags } = generateBrandCaption(prompt, selectedSubsidiary, platform);

    set({
      selectedPlatform: platform,
      aspectRatio: defaultRatio,
      caption,
      hashtags,
    });
  },

  setAspectRatio: (aspectRatio) => set({ aspectRatio }),
  setPrompt: (prompt) => set({ prompt }),
  setGeneratedImageUrl: (generatedImageUrl) => set({ generatedImageUrl }),
  setCaption: (caption) => set({ caption }),
  setHashtags: (hashtags) => set({ hashtags }),
  setEnhanceWithBrandTone: (enhanceWithBrandTone) => set({ enhanceWithBrandTone }),
  setSelectedModel: (selectedModel) => set({ selectedModel }),
  setRejectionFeedback: (rejectionFeedback) => set({ rejectionFeedback }),
  setScheduledTime: (scheduledTime) => set({ scheduledTime }),
  setPostNow: (postNow) => set({ postNow }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  setSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
  setGenerationError: (generationError) => set({ generationError }),

  setOpenaiApiKey: (key) => {
    set((state) => {
      const updatedOrg = { ...state.organization, openaiApiKey: key.trim() };
      saveStateToStorage({
        organization: updatedOrg,
        subsidiaries: state.subsidiaries,
        selectedSubsidiary: state.selectedSubsidiary,
        socialAccounts: state.socialAccounts,
        posts: state.posts,
      });
      syncOrganizationToServer(updatedOrg);
      return { organization: updatedOrg };
    });
  },

  setAyrshareApiKey: (key) => {
    set((state) => {
      const updatedOrg = { ...state.organization, ayrshareApiKey: key.trim() };
      saveStateToStorage({
        organization: updatedOrg,
        subsidiaries: state.subsidiaries,
        selectedSubsidiary: state.selectedSubsidiary,
        socialAccounts: state.socialAccounts,
        posts: state.posts,
      });
      syncOrganizationToServer(updatedOrg);
      return { organization: updatedOrg };
    });
  },

  setEditSubsidiaryModalOpen: (open, sub = null) =>
    set({ isEditSubsidiaryModalOpen: open, editingSubsidiary: sub }),
  setEditOrgModalOpen: (open) => set({ isEditOrgModalOpen: open }),
  setConnectAccountModalOpen: (open, platform = null) =>
    set({ isConnectAccountModalOpen: open, connectingPlatform: platform }),

  connectSocialAccount: (subsidiaryId, platform, data) => {
    set((state) => {
      const existingIndex = state.socialAccounts.findIndex(
        (a) => a.subsidiaryId === subsidiaryId && a.platform === platform
      );

      let updatedAccounts = [...state.socialAccounts];
      let targetAccount: SocialAccount;

      if (existingIndex >= 0) {
        targetAccount = {
          ...updatedAccounts[existingIndex],
          ...data,
          connectionStatus: 'CONNECTED',
          lastSyncedAt: new Date().toISOString(),
        };
        updatedAccounts[existingIndex] = targetAccount;
      } else {
        targetAccount = {
          id: `soc-${Date.now()}`,
          subsidiaryId,
          platform,
          accountHandle: data.accountHandle || `@${platform.toLowerCase()}`,
          accountName: data.accountName || state.selectedSubsidiary.name,
          avatarUrl: data.avatarUrl || state.selectedSubsidiary.logoUrl,
          followersCount: data.followersCount || 1000,
          connectionStatus: 'CONNECTED',
          lastSyncedAt: new Date().toISOString(),
          profileKey: data.profileKey,
        };
        updatedAccounts.push(targetAccount);
      }

      const activeCount = updatedAccounts.filter(
        (a) => a.subsidiaryId === subsidiaryId && a.connectionStatus === 'CONNECTED'
      ).length;

      const updatedSubs = state.subsidiaries.map((s) =>
        s.id === subsidiaryId ? { ...s, activeAccountsCount: activeCount } : s
      );

      const updatedSelected =
        state.selectedSubsidiary.id === subsidiaryId
          ? { ...state.selectedSubsidiary, activeAccountsCount: activeCount }
          : state.selectedSubsidiary;

      saveStateToStorage({
        organization: state.organization,
        subsidiaries: updatedSubs,
        selectedSubsidiary: updatedSelected,
        socialAccounts: updatedAccounts,
        posts: state.posts,
      });

      syncSocialAccountToServer(targetAccount);

      return {
        socialAccounts: updatedAccounts,
        subsidiaries: updatedSubs,
        selectedSubsidiary: updatedSelected,
      };
    });
  },

  disconnectSocialAccount: (subsidiaryId, platform) => {
    set((state) => {
      const updatedAccounts = state.socialAccounts.map((a) =>
        a.subsidiaryId === subsidiaryId && a.platform === platform
          ? { ...a, connectionStatus: 'DISCONNECTED' as const }
          : a
      );

      const activeCount = updatedAccounts.filter(
        (a) => a.subsidiaryId === subsidiaryId && a.connectionStatus === 'CONNECTED'
      ).length;

      const updatedSubs = state.subsidiaries.map((s) =>
        s.id === subsidiaryId ? { ...s, activeAccountsCount: activeCount } : s
      );

      const updatedSelected =
        state.selectedSubsidiary.id === subsidiaryId
          ? { ...state.selectedSubsidiary, activeAccountsCount: activeCount }
          : state.selectedSubsidiary;

      saveStateToStorage({
        organization: state.organization,
        subsidiaries: updatedSubs,
        selectedSubsidiary: updatedSelected,
        socialAccounts: updatedAccounts,
        posts: state.posts,
      });

      return {
        socialAccounts: updatedAccounts,
        subsidiaries: updatedSubs,
        selectedSubsidiary: updatedSelected,
      };
    });
  },

  setFilterStatus: (filterStatus) => set({ filterStatus }),
  setFilterPlatform: (filterPlatform) => set({ filterPlatform }),
  setFilterBrandId: (filterBrandId) => set({ filterBrandId }),

  generateAICaption: () => {
    const { prompt, selectedSubsidiary, selectedPlatform } = get();
    const res = generateBrandCaption(prompt, selectedSubsidiary, selectedPlatform);
    set({ caption: res.caption, hashtags: res.hashtags });
  },

  triggerGenerate: async (feedback?: string, explicitApiKey?: string) => {
    const state = get();
    set({ isGenerating: true, generationError: null, rejectionFeedback: feedback || '' });

    // Ensure the most up-to-date OpenAI API Key is retrieved from state, parameter, or persistent storage
    let activeOpenaiKey = explicitApiKey?.trim() || state.organization.openaiApiKey?.trim() || '';
    if (!activeOpenaiKey && typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.organization?.openaiApiKey) {
            activeOpenaiKey = parsed.organization.openaiApiKey.trim();
          }
        }
      } catch (e) {}
    }

    if (explicitApiKey && explicitApiKey.trim().startsWith('sk-') && explicitApiKey.trim() !== state.organization.openaiApiKey) {
      state.setOpenaiApiKey(explicitApiKey.trim());
    }

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: state.selectedSubsidiary.id,
          brandData: state.selectedSubsidiary,
          prompt: state.prompt,
          enhanceWithBrandTone: state.enhanceWithBrandTone,
          aspectRatio: state.aspectRatio,
          model: state.selectedModel,
          platform: state.selectedPlatform,
          feedback,
          apiKeys: {
            openaiApiKey: activeOpenaiKey,
            replicateApiKey: state.organization.replicateApiKey,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Image synthesis failed. Please verify your prompt or API key.');
      }

      const result = json.data;

      let caption = state.caption;
      let hashtags = state.hashtags;
      if (!caption || feedback) {
        const generated = generateBrandCaption(state.prompt, state.selectedSubsidiary, state.selectedPlatform);
        caption = generated.caption;
        hashtags = generated.hashtags;
      }

      const historyItem: GenerationHistoryItem = {
        id: `gen-${Date.now()}`,
        imageUrl: result.imageUrl,
        prompt: state.prompt,
        enhancedPrompt: result.enhancedPrompt,
        feedback,
        timestamp: new Date().toISOString(),
        model: result.model,
      };

      set((prev) => ({
        isGenerating: false,
        generationError: null,
        generatedImageUrl: result.imageUrl,
        generatedSeed: result.seed,
        enhancedPrompt: result.enhancedPrompt,
        caption,
        hashtags,
        revisionHistory: [historyItem, ...prev.revisionHistory],
        currentStep: 4,
        isApproved: false,
      }));
    } catch (err: any) {
      console.error('Generation error:', err);
      set({
        isGenerating: false,
        generationError: err.message || 'Image synthesis failed. Please verify your prompt or API key.',
      });
    }
  },

  rejectAndRegenerate: async (feedback: string) => {
    await get().triggerGenerate(feedback);
  },

  approvePost: () => {
    set({
      isApproved: true,
      currentStep: 5,
    });
  },

  publishOrSchedule: async () => {
    const state = get();
    set({ isPublishing: true });

    const account = state.socialAccounts.find(
      (a) => a.subsidiaryId === state.selectedSubsidiary.id && a.platform === state.selectedPlatform
    );

    let dispatchResult: any = null;
    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: state.selectedPlatform,
          imageUrl: state.generatedImageUrl || '',
          caption: state.caption,
          hashtags: state.hashtags,
          scheduledTime: state.scheduledTime,
          postNow: state.postNow,
          connector: 'ayrshare',
          apiKey: state.organization.ayrshareApiKey,
          profileKey: account?.profileKey,
        }),
      });
      const json = await res.json();
      dispatchResult = json.data || { success: true, isLive: false, externalPostId: `post_${Date.now()}` };
    } catch (e) {
      console.warn('API Schedule route error, falling back locally:', e);
      dispatchResult = { success: true, isLive: false, externalPostId: `local_${Date.now()}` };
    }

    const newPostStatus: PostStatus = state.postNow ? 'PUBLISHED' : 'SCHEDULED';
    const newPostId = `post-${Date.now()}`;

    const newPost: ScheduledPost = {
      id: newPostId,
      subsidiaryId: state.selectedSubsidiary.id,
      platform: state.selectedPlatform,
      prompt: state.prompt,
      enhancedPrompt: state.enhancedPrompt,
      imageUrl: state.generatedImageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&auto=format&fit=crop&q=85',
      aspectRatio: state.aspectRatio,
      caption: state.caption,
      hashtags: state.hashtags,
      status: newPostStatus,
      modelName: state.selectedModel,
      scheduledTime: state.postNow ? undefined : new Date(state.scheduledTime).toISOString(),
      publishedTime: state.postNow ? new Date().toISOString() : undefined,
      metricsLikes: 0,
      metricsComments: 0,
      metricsShares: 0,
      metricsImpressions: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((prev) => {
      const updatedPosts = [newPost, ...prev.posts];
      saveStateToStorage({
        organization: state.organization,
        subsidiaries: state.subsidiaries,
        selectedSubsidiary: state.selectedSubsidiary,
        socialAccounts: state.socialAccounts,
        posts: updatedPosts,
      });

      return {
        isPublishing: false,
        publishSuccess: true,
        lastPublishedPostId: newPostId,
        lastDispatchResult: dispatchResult,
        posts: updatedPosts,
      };
    });
  },

  resetStudio: () => {
    set({
      currentStep: 1,
      generatedImageUrl: null,
      generatedSeed: null,
      isApproved: false,
      publishSuccess: false,
      lastPublishedPostId: null,
      lastDispatchResult: null,
      rejectionFeedback: '',
      generationError: null,
      revisionHistory: [],
    });
  },

  deletePost: (id: string) => {
    set((state) => {
      const updatedPosts = state.posts.filter((p) => p.id !== id);
      saveStateToStorage({
        organization: state.organization,
        subsidiaries: state.subsidiaries,
        selectedSubsidiary: state.selectedSubsidiary,
        socialAccounts: state.socialAccounts,
        posts: updatedPosts,
      });
      deletePostFromServer(id);
      return { posts: updatedPosts };
    });
  },

  updateBrand: (updated: Subsidiary) => {
    set((state) => {
      const updatedSubs = state.subsidiaries.map((s) => (s.id === updated.id ? updated : s));
      const updatedSelected =
        state.selectedSubsidiary.id === updated.id ? updated : state.selectedSubsidiary;

      saveStateToStorage({
        organization: state.organization,
        subsidiaries: updatedSubs,
        selectedSubsidiary: updatedSelected,
        socialAccounts: state.socialAccounts,
        posts: state.posts,
      });

      // Permanent background sync to server database (data/db.json)
      syncSubsidiaryToServer(updated, 'PUT');

      return {
        subsidiaries: updatedSubs,
        selectedSubsidiary: updatedSelected,
      };
    });
  },

  addBrand: (newBrand: Subsidiary) => {
    set((state) => {
      const updatedSubs = [...state.subsidiaries, newBrand];
      saveStateToStorage({
        organization: state.organization,
        subsidiaries: updatedSubs,
        selectedSubsidiary: newBrand,
        socialAccounts: state.socialAccounts,
        posts: state.posts,
      });

      // Permanent background sync to server database (data/db.json)
      syncSubsidiaryToServer(newBrand, 'POST');

      return {
        subsidiaries: updatedSubs,
        selectedSubsidiary: newBrand,
      };
    });
  },

  deleteSubsidiary: (id: string) => {
    set((state) => {
      const remaining = state.subsidiaries.filter((s) => s.id !== id);
      const updatedSelected =
        state.selectedSubsidiary.id === id && remaining.length > 0
          ? remaining[0]
          : state.selectedSubsidiary;

      saveStateToStorage({
        organization: state.organization,
        subsidiaries: remaining,
        selectedSubsidiary: updatedSelected,
        socialAccounts: state.socialAccounts,
        posts: state.posts,
      });

      // Permanent background sync to server database (data/db.json)
      deleteSubsidiaryFromServer(id);

      return {
        subsidiaries: remaining,
        selectedSubsidiary: updatedSelected,
      };
    });
  },

  updateOrganization: (updates: Partial<Organization>) => {
    set((state) => {
      const updatedOrg = { ...state.organization, ...updates };
      saveStateToStorage({
        organization: updatedOrg,
        subsidiaries: state.subsidiaries,
        selectedSubsidiary: state.selectedSubsidiary,
        socialAccounts: state.socialAccounts,
        posts: state.posts,
      });

      // Permanent background sync to server database (data/db.json)
      syncOrganizationToServer(updatedOrg);

      return {
        organization: updatedOrg,
      };
    });
  },

  resetToDefaults: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      fetch('/api/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESET_TO_DEFAULTS' }),
      }).catch((e) => console.warn('Failed to reset server database:', e));
    }
    set({
      organization: mockOrganization,
      subsidiaries: mockSubsidiaries,
      selectedSubsidiary: mockSubsidiaries[0],
      socialAccounts: mockSocialAccounts,
      posts: mockPosts,
    });
  },
};
});
