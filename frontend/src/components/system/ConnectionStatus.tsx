'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui';

interface ConnectionStatus {
  backend: 'connected' | 'disconnected' | 'checking';
  database: 'connected' | 'disconnected' | 'checking';
  websocket: 'connected' | 'disconnected' | 'checking';
  claude: 'connected' | 'disconnected' | 'checking';
}

export function ConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>({
    backend: 'checking',
    database: 'checking',
    websocket: 'checking',
    claude: 'checking',
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    checkConnections();
    const interval = setInterval(checkConnections, 30000); // 30초마다 체크

    return () => clearInterval(interval);
  }, []);

  const checkConnections = async () => {
    // Backend API 체크
    try {
      const response = await fetch('/api/health');
      setStatus(prev => ({ 
        ...prev, 
        backend: response.ok ? 'connected' : 'disconnected' 
      }));
    } catch (error) {
      setStatus(prev => ({ ...prev, backend: 'disconnected' }));
    }

    // Database 체크 (Supabase)
    try {
      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase.from('curriculums').select('count').limit(1);
      setStatus(prev => ({ 
        ...prev, 
        database: error ? 'disconnected' : 'connected' 
      }));
    } catch (error) {
      setStatus(prev => ({ ...prev, database: 'disconnected' }));
    }

    // WebSocket 체크
    try {
      const { webSocketService } = await import('@/lib/websocket');
      setStatus(prev => ({ 
        ...prev, 
        websocket: webSocketService.isConnected() ? 'connected' : 'disconnected' 
      }));
    } catch (error) {
      setStatus(prev => ({ ...prev, websocket: 'disconnected' }));
    }

    // Claude API 체크
    try {
      const response = await fetch('/api/claude/health');
      setStatus(prev => ({ 
        ...prev, 
        claude: response.ok ? 'connected' : 'disconnected' 
      }));
    } catch (error) {
      setStatus(prev => ({ ...prev, claude: 'disconnected' }));
    }
  };

  const getStatusColor = (connectionStatus: string) => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-red-100 text-red-800';
      case 'checking': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (connectionStatus: string) => {
    switch (connectionStatus) {
      case 'connected': return '✅';
      case 'disconnected': return '❌';
      case 'checking': return '🔄';
      default: return '❓';
    }
  };

  const hasDisconnectedServices = Object.values(status).some(s => s === 'disconnected');

  return (
    <>
      {/* Status Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all ${
          hasDisconnectedServices 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-green-500 hover:bg-green-600'
        } text-white`}
        title="시스템 연결 상태"
      >
        {hasDisconnectedServices ? '⚠️' : '✅'}
      </button>

      {/* Status Panel */}
      {isVisible && (
        <div className="fixed bottom-20 right-4 z-50 bg-white rounded-lg shadow-xl border p-4 min-w-[300px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">시스템 연결 상태</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">백엔드 API</span>
              <Badge className={getStatusColor(status.backend)}>
                {getStatusIcon(status.backend)} {status.backend}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">데이터베이스</span>
              <Badge className={getStatusColor(status.database)}>
                {getStatusIcon(status.database)} {status.database}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">WebSocket</span>
              <Badge className={getStatusColor(status.websocket)}>
                {getStatusIcon(status.websocket)} {status.websocket}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Claude AI</span>
              <Badge className={getStatusColor(status.claude)}>
                {getStatusIcon(status.claude)} {status.claude}
              </Badge>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t">
            <button
              onClick={checkConnections}
              className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              🔄 연결 상태 새로고침
            </button>
          </div>
        </div>
      )}
    </>
  );
}