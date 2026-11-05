'use client';

import React, { useState } from 'react';
import { useStudioStore } from '@/lib/store';
import { ScheduledPost, PostStatus, SocialPlatform } from '@/types';
import {
  Calendar as CalendarIcon,
  Filter,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  PinIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Sparkles,
  BarChart3,
  Search,
  ExternalLink,
  ChevronRight,
  LayoutGrid,
  List,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const ContentCalendar: React.FC = () => {
  const {
    posts,
    subsidiaries,
    deletePost,
    filterStatus,
    setFilterStatus,
    filterPlatform,
    setFilterPlatform,
    filterBrandId,
    setFilterBrandId,
    setActiveTab,
  } = useStudioStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPostDetail, setSelectedPostDetail] = useState<ScheduledPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering
  const filteredPosts = posts.filter((post) => {
    if (filterStatus !== 'ALL' && post.status !== filterStatus) return false;
    if (filterPlatform !== 'ALL' && post.platform !== filterPlatform) return false;
    if (filterBrandId !== 'ALL' && post.subsidiaryId !== filterBrandId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPrompt = post.prompt.toLowerCase().includes(q);
      const matchCaption = post.caption.toLowerCase().includes(q);
      if (!matchPrompt && !matchCaption) return false;
    }
    return true;
  });

  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case 'INSTAGRAM':
        return <Instagram className="w-3.5 h-3.5 text-pink-500" />;
      case 'LINKEDIN':
        return <Linkedin className="w-3.5 h-3.5 text-blue-500" />;
      case 'TWITTER_X':
        return <Twitter className="w-3.5 h-3.5 text-sky-400" />;
      case 'FACEBOOK':
        return <Facebook className="w-3.5 h-3.5 text-blue-600" />;
      case 'PINTEREST':
        return <PinIcon className="w-3.5 h-3.5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: PostStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            PUBLISHED
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            SCHEDULED
          </span>
        );
      case 'APPROVED':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            APPROVED
          </span>
        );
      case 'DRAFT':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            DRAFT
          </span>
        );
      case 'FAILED':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            FAILED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-2">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Omnichannel Dispatch Queue & History</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Content Calendar & History Log
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time multi-tenant dashboard tracking queued, approved, and published social campaigns across all child entities.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* View toggle */}
          <div className="flex items-center space-x-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-slate-400'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-slate-400'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setActiveTab('studio')}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Post Studio</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns by prompt keywords, copy or hashtags..."
            className="w-full text-xs pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="APPROVED">Approved</option>
            <option value="DRAFT">Draft</option>
          </select>

          {/* Platform filter */}
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value as any)}
            className="text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Channels</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="LINKEDIN">LinkedIn</option>
            <option value="TWITTER_X">X (Twitter)</option>
            <option value="FACEBOOK">Facebook</option>
            <option value="PINTEREST">Pinterest</option>
          </select>

          {/* Brand filter */}
          <select
            value={filterBrandId}
            onChange={(e) => setFilterBrandId(e.target.value as any)}
            className="text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Subsidiaries</option>
            {subsidiaries.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Posts List / Grid */}
      {filteredPosts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <CalendarIcon className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-60" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No matching posts found
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Try adjusting your status or platform filters, or create a new campaign in the Studio.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPosts.map((post) => {
            const brand = subsidiaries.find((s) => s.id === post.subsidiaryId);

            return (
              <div
                key={post.id}
                onClick={() => setSelectedPostDetail(post)}
                className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col cursor-pointer"
              >
                {/* Image Cover */}
                <div className="relative aspect-video bg-slate-950 overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={post.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                    {getPlatformIcon(post.platform)}
                    <span>{post.platform}</span>
                  </div>

                  <div className="absolute top-3 right-3">
                    {getStatusBadge(post.status)}
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-medium mb-1">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {brand?.name || 'Brand'}
                      </span>
                      <span>•</span>
                      <span>{post.modelName}</span>
                    </div>

                    <p className="text-xs font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
                      {post.caption || post.prompt}
                    </p>
                  </div>

                  {/* Scheduled date / Metrics bar */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {post.status === 'PUBLISHED' && post.publishedTime
                          ? `Published ${formatDate(post.publishedTime)}`
                          : post.scheduledTime
                          ? formatDate(post.scheduledTime)
                          : 'Draft'}
                      </span>
                    </div>

                    {post.status === 'PUBLISHED' && (
                      <div className="flex items-center space-x-2 font-mono text-emerald-500 text-[10px] font-bold">
                        <span>❤️ {post.metricsLikes}</span>
                        <span>💬 {post.metricsComments}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredPosts.map((post) => {
              const brand = subsidiaries.find((s) => s.id === post.subsidiaryId);

              return (
                <div
                  key={post.id}
                  onClick={() => setSelectedPostDetail(post)}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={post.imageUrl}
                      alt={post.prompt}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        {getPlatformIcon(post.platform)}
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {brand?.name}
                        </span>
                        <span className="text-[10px] text-slate-400">({post.aspectRatio})</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-md mt-0.5">
                        {post.caption || post.prompt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0">
                    <div className="hidden sm:block text-right">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono">
                        {post.status === 'PUBLISHED' && post.publishedTime
                          ? formatDate(post.publishedTime)
                          : post.scheduledTime
                          ? formatDate(post.scheduledTime)
                          : 'Unscheduled'}
                      </div>
                      <span className="text-[10px] text-slate-400">{post.modelName}</span>
                    </div>

                    {getStatusBadge(post.status)}

                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Post Detail Drawer / Modal */}
      {selectedPostDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                {getPlatformIcon(selectedPostDetail.platform)}
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Campaign Post Intelligence
                </h3>
              </div>
              <button
                onClick={() => setSelectedPostDetail(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden aspect-square bg-slate-950">
                <img
                  src={selectedPostDetail.imageUrl}
                  alt={selectedPostDetail.prompt}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">
                    Status & Distribution:
                  </span>
                  <div className="mt-1 flex items-center space-x-2">
                    {getStatusBadge(selectedPostDetail.status)}
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {selectedPostDetail.scheduledTime
                        ? formatDate(selectedPostDetail.scheduledTime)
                        : 'Immediate Publish'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">
                    Copy & Messaging:
                  </span>
                  <p className="mt-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line max-h-36 overflow-y-auto">
                    {selectedPostDetail.caption}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">
                    Diffusion Prompt:
                  </span>
                  <p className="mt-1 text-slate-600 dark:text-slate-400 italic">
                    "{selectedPostDetail.prompt}"
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Analytics (for published posts) */}
            {selectedPostDetail.status === 'PUBLISHED' && (
              <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 mb-2">
                  <BarChart3 className="w-3.5 h-3.5" />
                  Connector Telemetry & Engagement
                </span>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900">
                    <div className="text-[10px] text-slate-400">Likes</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedPostDetail.metricsLikes || 4892}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900">
                    <div className="text-[10px] text-slate-400">Comments</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedPostDetail.metricsComments || 318}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900">
                    <div className="text-[10px] text-slate-400">Shares</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedPostDetail.metricsShares || 940}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900">
                    <div className="text-[10px] text-slate-400">Impressions</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedPostDetail.metricsImpressions || 52100}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  deletePost(selectedPostDetail.id);
                  setSelectedPostDetail(null);
                }}
                className="inline-flex items-center space-x-1.5 text-rose-500 hover:text-rose-700 text-xs font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Post</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPostDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

