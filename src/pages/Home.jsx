import React, { useEffect } from 'react';
import { useStreaming } from '../hooks/useStreaming';
import StreamGrid from '../components/stream/StreamGrid';
import Loading from '../components/common/Loading';

const Home = () => {
  const { streams, loading, fetchStreams } = useStreaming();

  useEffect(() => {
    fetchStreams();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Live Streams
        </h1>
        <p className="text-gray-600">
          Discover and watch live streams from creators around the world
        </p>
      </div>

      {streams.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No live streams at the moment
          </h3>
          <p className="text-gray-500">
            Check back later or start your own stream!
          </p>
        </div>
      ) : (
        <StreamGrid streams={streams} />
      )}
    </div>
  );
};

export default Home;