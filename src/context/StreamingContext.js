import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { streamingAPI } from '../services/streaming';
import { useSocket } from './SocketContext';

const StreamingContext = createContext();

const initialState = {
  liveStreams: [],
  currentStream: null,
  loading: false,
  error: null,
  categories: ['Gaming', 'Music', 'Talk', 'Education', 'Entertainment', 'Sports', 'Other']
};

function streamingReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_LIVE_STREAMS':
      return { ...state, liveStreams: action.payload, loading: false };
    case 'SET_CURRENT_STREAM':
      return { ...state, currentStream: action.payload };
    case 'UPDATE_STREAM':
      return {
        ...state,
        liveStreams: state.liveStreams.map(stream =>
          stream.id === action.payload.id ? { ...stream, ...action.payload } : stream
        ),
        currentStream: state.currentStream?.id === action.payload.id
          ? { ...state.currentStream, ...action.payload }
          : state.currentStream
      };
    case 'ADD_STREAM':
      return {
        ...state,
        liveStreams: [action.payload, ...state.liveStreams]
      };
    case 'REMOVE_STREAM':
      return {
        ...state,
        liveStreams: state.liveStreams.filter(stream => stream.id !== action.payload)
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

export function StreamingProvider({ children }) {
  const [state, dispatch] = useReducer(streamingReducer, initialState);
  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('stream-started', (streamData) => {
        dispatch({ type: 'ADD_STREAM', payload: streamData });
      });

      socket.on('stream-ended', (streamId) => {
        dispatch({ type: 'REMOVE_STREAM', payload: streamId });
      });

      socket.on('viewer-count-update', (data) => {
        dispatch({ type: 'UPDATE_STREAM', payload: {
          id: data.streamId,
          viewerCount: data.viewerCount
        }});
      });

      socket.on('stream-updated', (streamData) => {
        dispatch({ type: 'UPDATE_STREAM', payload: streamData });
      });

      return () => {
        socket.off('stream-started');
        socket.off('stream-ended');
        socket.off('viewer-count-update');
        socket.off('stream-updated');
      };
    }
  }, [socket]);

  const fetchLiveStreams = async (filters = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await streamingAPI.getLiveStreams(filters);
      
      if (response.success) {
        dispatch({ type: 'SET_LIVE_STREAMS', payload: response.streams });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch streams' });
    }
  };

  const getStream = async (streamId) => {
    try {
      const response = await streamingAPI.getStream(streamId);
      
      if (response.success) {
        dispatch({ type: 'SET_CURRENT_STREAM', payload: response.stream });
        return response.stream;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error });
        return null;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch stream' });
      return null;
    }
  };

  const createStream = async (streamData) => {
    try {
      const response = await streamingAPI.createStream(streamData);
      
      if (response.success) {
        return { success: true, stream: response.stream };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return { success: false, error: 'Failed to create stream' };
    }
  };

  const joinStream = (streamId) => {
    if (socket) {
      socket.emit('join-stream', { streamId });
    }
  };

  const leaveStream = (streamId) => {
    if (socket) {
      socket.emit('leave-stream', { streamId });
    }
  };

  return (
    <StreamingContext.Provider value={{
      ...state,
      fetchLiveStreams,
      getStream,
      createStream,
      joinStream,
      leaveStream
    }}>
      {children}
    </StreamingContext.Provider>
  );
}

export const useStreaming = () => {
  const context = useContext(StreamingContext);
  if (!context) {
    throw new Error('useStreaming must be used within a StreamingProvider');
  }
  return context;
};