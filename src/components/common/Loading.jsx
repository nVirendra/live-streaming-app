import React from 'react';

/**
 * Loading component with multiple variants and customization options
 * @param {Object} props - Component props
 * @param {string} props.variant - Loading variant ('spinner', 'pulse', 'bars', 'dots', 'skeleton')
 * @param {string} props.size - Size ('xs', 'sm', 'md', 'lg', 'xl')
 * @param {string} props.color - Color theme ('purple', 'blue', 'green', 'red', 'gray')
 * @param {string} props.text - Loading text to display
 * @param {boolean} props.overlay - Whether to show as overlay
 * @param {boolean} props.fullScreen - Whether to take full screen
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Loading component
 */
const Loading = ({
  variant = 'spinner',
  size = 'md',
  color = 'purple',
  text = '',
  overlay = false,
  fullScreen = false,
  className = ''
}) => {
  // Size mappings for different variants
  const sizeClasses = {
    xs: { spinner: 'h-4 w-4', text: 'text-xs' },
    sm: { spinner: 'h-6 w-6', text: 'text-sm' },
    md: { spinner: 'h-8 w-8', text: 'text-base' },
    lg: { spinner: 'h-12 w-12', text: 'text-lg' },
    xl: { spinner: 'h-16 w-16', text: 'text-xl' }
  };

  // Color mappings
  const colorClasses = {
    purple: 'text-purple-600 border-purple-600',
    blue: 'text-blue-600 border-blue-600',
    green: 'text-green-600 border-green-600',
    red: 'text-red-600 border-red-600',
    gray: 'text-gray-600 border-gray-600',
    white: 'text-white border-white'
  };

  // Base container classes
  const containerClasses = [
    'flex flex-col items-center justify-center',
    fullScreen ? 'fixed inset-0 z-50' : '',
    overlay ? 'absolute inset-0 z-40' : '',
    overlay || fullScreen ? 'bg-white bg-opacity-90' : '',
    className
  ].filter(Boolean).join(' ');

  // Spinner Loading
  const SpinnerLoader = () => (
    <div
      className={`animate-spin rounded-full border-2 border-gray-200 border-t-current ${sizeClasses[size].spinner} ${colorClasses[color]}`}
      role="status"
      aria-label="Loading"
    />
  );

  // Pulse Loading
  const PulseLoader = () => (
    <div className="flex space-x-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`rounded-full animate-pulse ${sizeClasses[size].spinner} ${colorClasses[color]} bg-current`}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );

  // Bars Loading
  const BarsLoader = () => (
    <div className="flex items-end space-x-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`bg-current animate-pulse ${colorClasses[color]}`}
          style={{
            width: size === 'xs' ? '2px' : size === 'sm' ? '3px' : size === 'md' ? '4px' : size === 'lg' ? '5px' : '6px',
            height: `${12 + i * 4}px`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );

  // Dots Loading
  const DotsLoader = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`rounded-full bg-current animate-bounce ${colorClasses[color]}`}
          style={{
            width: size === 'xs' ? '6px' : size === 'sm' ? '8px' : size === 'md' ? '10px' : size === 'lg' ? '12px' : '14px',
            height: size === 'xs' ? '6px' : size === 'sm' ? '8px' : size === 'md' ? '10px' : size === 'lg' ? '12px' : '14px',
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  );

  // Skeleton Loading
  const SkeletonLoader = () => (
    <div className="animate-pulse space-y-4 w-full max-w-md">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 rounded"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
      </div>
      <div className="h-32 bg-gray-300 rounded"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 rounded w-4/6"></div>
        <div className="h-4 bg-gray-300 rounded w-3/6"></div>
      </div>
    </div>
  );

  // Stream-specific skeleton
  const StreamSkeleton = () => (
    <div className="animate-pulse space-y-4 w-full">
      {/* Video thumbnail skeleton */}
      <div className="aspect-video bg-gray-300 rounded-lg"></div>
      
      {/* Stream info skeleton */}
      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          {/* Avatar */}
          <div className="h-10 w-10 bg-gray-300 rounded-full flex-shrink-0"></div>
          
          {/* Stream details */}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            <div className="h-3 bg-gray-300 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Chat skeleton
  const ChatSkeleton = () => (
    <div className="animate-pulse space-y-3 w-full">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-start space-x-2">
          <div className="h-6 w-6 bg-gray-300 rounded-full flex-shrink-0"></div>
          <div className="flex-1 space-y-1">
            <div className="h-3 bg-gray-300 rounded w-1/4"></div>
            <div className="h-3 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Select the appropriate loader
  const renderLoader = () => {
    switch (variant) {
      case 'pulse':
        return <PulseLoader />;
      case 'bars':
        return <BarsLoader />;
      case 'dots':
        return <DotsLoader />;
      case 'skeleton':
        return <SkeletonLoader />;
      case 'stream-skeleton':
        return <StreamSkeleton />;
      case 'chat-skeleton':
        return <ChatSkeleton />;
      case 'spinner':
      default:
        return <SpinnerLoader />;
    }
  };

  return (
    <div className={containerClasses}>
      {renderLoader()}
      
      {text && !variant.includes('skeleton') && (
        <div className={`mt-3 text-center ${sizeClasses[size].text} text-gray-600`}>
          {text}
        </div>
      )}
    </div>
  );
};

// Preset loading components for common use cases
export const PageLoading = ({ text = "Loading..." }) => (
  <Loading
    variant="spinner"
    size="lg"
    color="purple"
    text={text}
    fullScreen={false}
    className="min-h-96"
  />
);

export const OverlayLoading = ({ text = "Please wait..." }) => (
  <Loading
    variant="spinner"
    size="lg"
    color="purple"
    text={text}
    overlay={true}
  />
);

export const FullScreenLoading = ({ text = "Loading application..." }) => (
  <Loading
    variant="spinner"
    size="xl"
    color="purple"
    text={text}
    fullScreen={true}
  />
);

export const ButtonLoading = ({ text = "" }) => (
  <Loading
    variant="spinner"
    size="xs"
    color="white"
    text={text}
    className="text-white"
  />
);

export const InlineLoading = ({ text = "Loading..." }) => (
  <Loading
    variant="dots"
    size="sm"
    color="purple"
    text={text}
    className="py-2"
  />
);

export const StreamCardLoading = () => (
  <Loading
    variant="stream-skeleton"
    className="p-4"
  />
);

export const ChatLoading = () => (
  <Loading
    variant="chat-skeleton"
    className="p-3"
  />
);

// Loading with custom content
export const CustomLoading = ({ children, loading = true, fallback = null }) => {
  if (loading) {
    return fallback || <PageLoading />;
  }
  
  return children;
};

// HOC for adding loading states
export const withLoading = (WrappedComponent, LoadingComponent = PageLoading) => {
  return function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) {
      return <LoadingComponent />;
    }
    
    return <WrappedComponent {...props} />;
  };
};

export default Loading;