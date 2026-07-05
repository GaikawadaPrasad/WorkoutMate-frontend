import React from 'react';

export const CardSkeleton = () => {
  return (
    <div className="glass-card rounded-xl overflow-hidden p-4 space-y-4">
      {/* Image skeleton */}
      <div className="shimmer-loading h-48 w-full rounded-lg" />
      {/* Title skeleton */}
      <div className="shimmer-loading h-6 w-3/4 rounded" />
      {/* Description skeleton */}
      <div className="space-y-2">
        <div className="shimmer-loading h-4 w-full rounded" />
        <div className="shimmer-loading h-4 w-5/6 rounded" />
      </div>
      {/* Meta tags skeleton */}
      <div className="flex items-center space-x-2 pt-2">
        <div className="shimmer-loading h-6 w-16 rounded-full" />
        <div className="shimmer-loading h-6 w-16 rounded-full" />
        <div className="shimmer-loading h-6 w-16 rounded-full" />
      </div>
    </div>
  );
};

export const GridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Greeting Banner */}
      <div className="shimmer-loading h-28 w-full rounded-2xl" />

      {/* Grid of stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="shimmer-loading h-24 rounded-xl" />
        ))}
      </div>

      {/* Main double column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 shimmer-loading h-96 rounded-2xl" />
        <div className="shimmer-loading h-96 rounded-2xl" />
      </div>
    </div>
  );
};
