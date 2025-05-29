import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { streamingAPI } from '../services/streaming';

export const useStreaming = () => {
  const [streams, setStreams] = useState([]);
  const [currentStream, setCurrentStream] = useState(null);
  const [loading, setLoading] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('stream-started', (stream) => {
        setStreams(prev => [...prev, stream]);
      });

      socket.on('stream-ended', (streamId) => {
        setStreams(prev => prev.filter(s => s.id !== streamId));
      });

      socket.on('stream-updated', (updatedStream) => {
        setStreams(prev => 
          prev.map(s => s.id === updatedStream.id ? updatedStream : s)
        );
      });

      return () => {
        socket.off('stream-started');
        socket.off('stream-ended');
        socket.off('stream-updated');
      };
    }
  }, [socket]);

  const fetchStreams = async () => {
    try {
      setLoading(true);
      const response = await streamingService.getStreams();
      setStreams(response.data);
    } catch (error) {
      console.error('Failed to fetch streams:', error);
    } finally {
      setLoading(false);
    }
  };

  const startStream = async (streamData) => {
    try {
      const response = await streamingService.startStream(streamData);
      setCurrentStream(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const endStream = async (streamId) => {
    try {
      await streamingService.endStream(streamId);
      setCurrentStream(null);
    } catch (error) {
      throw error;
    }
  };

  return {
    streams,
    currentStream,
    loading,
    fetchStreams,
    startStream,
    endStream
  };
};