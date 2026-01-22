import React from 'react';

const Skeleton = ({ 
  width, 
  height, 
  variant = 'text', 
  className = '', 
  count = 1 
}) => {
  const baseClasses = "skeleton-shimmer";
  
  const variantClasses = {
    text: "rounded h-4 w-full",
    circular: "rounded-full",
    rectangular: "rounded-lg",
    card: "rounded-2xl"
  };

  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  const renderSkeleton = (key) => (
    <div
      key={key}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );

  if (count === 1) {
    return renderSkeleton(0);
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => renderSkeleton(index))}
    </div>
  );
};

export const SkeletonCard = () => (
    <div className="rounded-3xl p-6 border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="flex items-center space-x-4 mb-4">
            <Skeleton variant="circular" width={48} height={48} />
            <div className="space-y-2 flex-1">
                <Skeleton width="60%" />
                <Skeleton width="40%" />
            </div>
        </div>
        <div className="space-y-3">
            <Skeleton variant="rectangular" height={20} />
            <Skeleton variant="rectangular" height={20} />
            <Skeleton variant="rectangular" height={20} width="80%" />
        </div>
    </div>
);

export const SkeletonList = ({ count = 5 }) => (
    <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
             <div key={i} className="flex items-center space-x-4 p-4 rounded-xl border border-white/5 bg-white/5">
                <Skeleton variant="circular" width={40} height={40} />
                <div className="flex-1 space-y-2">
                    <Skeleton width="30%" />
                    <Skeleton width="20%" />
                </div>
                <Skeleton variant="rectangular" width={80} height={32} />
             </div>
        ))}
    </div>
);

export default Skeleton;
