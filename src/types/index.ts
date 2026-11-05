export type SubscriptionPlan = 'STARTER' | 'PRO' | 'ENTERPRISE';

export type SocialPlatform = 'INSTAGRAM' | 'LINKEDIN' | 'TWITTER_X' | 'FACEBOOK' | 'PINTEREST';

export type ConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'EXPIRED';

export type PostStatus = 'DRAFT' | 'APPROVED' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:5';

export type AIModel = 'Flux.1-Pro' | 'DALL-E-3' | 'SDXL-Turbo';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: SubscriptionPlan;
  replicateApiKey?: string;
  openaiApiKey?: string;
  ayrshareApiKey?: string;
  bufferToken?: string;
}

export interface Subsidiary {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  tagline: string;
  brandTone: string;
  toneKeywords: string[];
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  websiteUrl: string;
  targetAudience: string;
  activeAccountsCount?: number;
}

export interface SocialAccount {
  id: string;
  subsidiaryId: string;
  platform: SocialPlatform;
  accountHandle: string;
  accountName: string;
  avatarUrl: string;
  followersCount: number;
  connectionStatus: ConnectionStatus;
  lastSyncedAt: string;
  profileKey?: string;
}

export interface GenerationHistoryItem {
  id: string;
  imageUrl: string;
  prompt: string;
  enhancedPrompt?: string;
  feedback?: string;
  timestamp: string;
  model: AIModel;
}

export interface ScheduledPost {
  id: string;
  subsidiaryId: string;
  socialAccountId?: string;
  platform: SocialPlatform;
  prompt: string;
  enhancedPrompt?: string;
  imageUrl: string;
  aspectRatio: AspectRatio;
  caption: string;
  hashtags: string[];
  status: PostStatus;
  modelName: AIModel;
  scheduledTime?: string;
  publishedTime?: string;
  rejectionFeedback?: string;
  revisionHistory?: GenerationHistoryItem[];
  metricsLikes?: number;
  metricsComments?: number;
  metricsShares?: number;
  metricsImpressions?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GenerationRequest {
  brandId: string;
  prompt: string;
  enhanceWithBrandTone: boolean;
  aspectRatio: AspectRatio;
  model: AIModel;
  platform: SocialPlatform;
  feedback?: string;
}

export interface CaptionRequest {
  brandId: string;
  prompt: string;
  platform: SocialPlatform;
  tonePreference?: string;
}

export interface ScheduleRequest {
  postId?: string;
  subsidiaryId: string;
  platform: SocialPlatform;
  imageUrl: string;
  caption: string;
  hashtags: string[];
  aspectRatio: AspectRatio;
  scheduledTime?: string;
  postNow?: boolean;
}

