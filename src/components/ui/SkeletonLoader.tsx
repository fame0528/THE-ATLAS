"use client";

import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export function SkeletonLoader({
  className = '',
  variant = 'rectangular',
  width,
  height,
  count = 1
}: SkeletonLoaderProps) {
  const baseClasses = 'animate-pulse bg-gray-700/60';

  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full'
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1em' : undefined)
  };

  const items = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  ));

  return <>{items}</>;
}

// Pre-built skeleton components for common patterns
export function CardSkeleton() {
  return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
      <div className="flex items-center gap-3 mb-4">
        <SkeletonLoader variant="circular" width={40} height={40} />
        <div className="flex-1">
          <SkeletonLoader variant="text" width="60%" height={16} className="mb-2" />
          <SkeletonLoader variant="text" width="40%" height={12} />
        </div>
      </div>
      <div className="space-y-2">
        <SkeletonLoader variant="text" width="100%" height={14} />
        <SkeletonLoader variant="text" width="80%" height={14} />
        <SkeletonLoader variant="text" width="90%" height={14} />
      </div>
    </div>
  );
}

export function ListItemSkeleton({ lines = 2 }: { lines?: number }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <SkeletonLoader variant="rectangular" width={48} height={48} className="flex-shrink-0" />
      <div className="flex-1 space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonLoader key={i} variant="text" width={i === lines - 1 ? '60%' : '100%'} height={14} />
        ))}
      </div>
    </div>
  );
}

export function GridSkeleton({ columns = 2 }: { columns?: number }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-6`}>
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
