import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    if (token && user) {
      const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Socket connected');
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Socket disconnected');
      });

      newSocket.on('test_result_ready', (data) => {
        toast.success('Your eye test results are ready!', {
          duration: 5000,
          onClick: () => {
            window.location.href = `/patient/results/${data.testId}`;
          },
        });
      });

      newSocket.on('appointment_reminder', (data) => {
        toast.success(`Appointment reminder: ${data.message}`, {
          duration: 6000,
        });
      });

      newSocket.on('doctor_assigned', (data) => {
        toast.success(`Dr. ${data.doctorName} has been assigned to your case`, {
          duration: 5000,
        });
      });

      newSocket.on('priority_update', (data) => {
        const priorityColors = {
          critical: 'bg-red-500',
          urgent: 'bg-yellow-500',
          moderate: 'bg-orange-500',
          routine: 'bg-green-500',
          normal: 'bg-blue-500',
        };

        toast.success(
          `Priority updated to ${data.priority} for test #${data.testId}`,
          {
            duration: 5000,
            style: {
              background: priorityColors[data.priority] || 'bg-blue-500',
            },
          }
        );
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        toast.error('Connection error. Please refresh the page.');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [token, user]);

  const emitEvent = (event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  };

  const joinRoom = (roomId) => {
    if (socket && isConnected) {
      socket.emit('join_room', roomId);
    }
  };

  const leaveRoom = (roomId) => {
    if (socket && isConnected) {
      socket.emit('leave_room', roomId);
    }
  };

  const value = {
    socket,
    isConnected,
    emitEvent,
    joinRoom,
    leaveRoom,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}; 