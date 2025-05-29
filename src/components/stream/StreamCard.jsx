import React from 'react';
import { Link } from 'react-router-dom';
import { EyeIcon, HeartIcon, UserIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';
import { formatViewerCount } from '../../utils/formatters';

const StreamCard = ({ stream, onLike, isLiked, className = "" }) => {
  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onLike?.(stream.id);
  };

  return (
    <Link 
      to={`/stream/${stream.id}`}
      className={`group block bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-all duration-200 transform hover:scale-105 ${className}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-900">
        {stream.thumbnailUrl ? (
          <img
            src={stream.thumbnailUrl}
            alt={stream.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl text-gray-600">📹</div>
          </div>
        )}

        {/* Live Badge */}
        {stream.isLive && (
          <div className="absolute top-2 left-2 bg-red-600 px-2 py-1 rounded text-xs font-bold flex items-center">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
            LIVE
          </div>
        )}

        {/* Viewer Count */}
        <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs flex items-center">
          <EyeIcon className="w-3 h-3 mr-1" />
          {formatViewerCount(stream.viewerCount)}
        </div>

        {/* Duration (if not live) */}
        {!stream.isLive && stream.duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs">
            {Math.floor(stream.duration / 60)}:{(stream.duration % 60).toString().padStart(2, '0')}
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-white/20 rounded-full p-3">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Stream Info */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-white text-sm line-clamp-2 mb-2 group-hover:text-blue-300 transition-colors">
          {stream.title}
        </h3>

        {/* Streamer Info */}
        <div className="flex items-center space-x-2 mb-2">
          {stream.streamer?.avatarUrl ? (
            <img
              src={stream.streamer.avatarUrl}
              alt={stream.streamer.name}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-gray-400" />
            </div>
          )}
          <span className="text-gray-400 text-sm hover:text-white transition-colors">
            {stream.streamer?.name || 'Unknown Streamer'}
          </span>
        </div>

        {/* Stream Stats */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-4">
            {/* Category */}
            {stream.category && (
              <span className="bg-gray-700 px-2 py-1 rounded">
                {stream.category}
              </span>
            )}
            
            {/* Time */}
            <span>
              {stream.isLive 
                ? `Started ${formatDistanceToNow(new Date(stream.startedAt), { addSuffix: true })}`
                : formatDistanceToNow(new Date(stream.createdAt), { addSuffix: true })
              }
            </span>
          </div>

          {/* Like Button */}
          <button
            onClick={handleLike}
            className="flex items-center space-x-1 hover:text-red-400 transition-colors p-1 rounded"
            aria-label={isLiked ? 'Unlike stream' : 'Like stream'}
          >
            {isLiked ? (
              <HeartSolidIcon className="w-4 h-4 text-red-500" />
            ) : (
              <HeartIcon className="w-4 h-4" />
            )}
            <span>{stream.likeCount || 0}</span>
          </button>
        </div>

        {/* Tags */}
        {stream.tags && stream.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {stream.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
              >
                #{tag}
              </span>
            ))}
            {stream.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{stream.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default StreamCard;