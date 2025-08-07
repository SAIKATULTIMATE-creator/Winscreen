import { useState } from "react";
import AppHeader from "@/components/app-header";
import ConnectionSetup from "@/components/connection-setup";
import HostInterface from "@/components/host-interface";
import ViewerInterface from "@/components/viewer-interface";

type ViewMode = 'setup' | 'host' | 'viewer';
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('setup');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [currentRoomCode, setCurrentRoomCode] = useState<string>('');

  return (
    <div className="min-h-screen">
      <AppHeader 
        connectionStatus={connectionStatus} 
        data-testid="app-header"
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'setup' && (
          <ConnectionSetup 
            onStartHosting={() => {
              setViewMode('host');
              setConnectionStatus('connecting');
            }}
            onJoinSession={(roomCode) => {
              setCurrentRoomCode(roomCode);
              setViewMode('viewer');
              setConnectionStatus('connecting');
            }}
            data-testid="connection-setup"
          />
        )}
        
        {viewMode === 'host' && (
          <HostInterface 
            roomCode={currentRoomCode}
            onStopSharing={() => {
              setViewMode('setup');
              setConnectionStatus('disconnected');
              setCurrentRoomCode('');
            }}
            onConnectionStatusChange={setConnectionStatus}
            data-testid="host-interface"
          />
        )}
        
        {viewMode === 'viewer' && (
          <ViewerInterface 
            roomCode={currentRoomCode}
            onLeaveSession={() => {
              setViewMode('setup');
              setConnectionStatus('disconnected');
              setCurrentRoomCode('');
            }}
            onConnectionStatusChange={setConnectionStatus}
            data-testid="viewer-interface"
          />
        )}
      </main>
    </div>
  );
}
