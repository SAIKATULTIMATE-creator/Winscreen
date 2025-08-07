import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Camera, Link, Signal, Expand, AlertTriangle } from "lucide-react";
import { useWebRTC } from "@/hooks/use-webrtc";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ViewerInterfaceProps {
  roomCode: string;
  onLeaveSession: () => void;
  onConnectionStatusChange: (status: 'disconnected' | 'connecting' | 'connected') => void;
}

export default function ViewerInterface({ 
  roomCode, 
  onLeaveSession, 
  onConnectionStatusChange 
}: ViewerInterfaceProps) {
  const [autoQuality, setAutoQuality] = useState(true);
  const [fitToScreen, setFitToScreen] = useState(true);
  const [connectionQuality, setConnectionQuality] = useState('Excellent');
  const [latency, setLatency] = useState('45ms');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hostName] = useState("Host's screen");
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const deviceId = `viewer_${Date.now()}`;

  const { socket } = useWebSocket();
  const { 
    handleOffer, 
    createAnswer, 
    handleIceCandidate,
    remoteStream 
  } = useWebRTC({
    onIceCandidate: (candidate) => {
      if (socket) {
        socket.send(JSON.stringify({
          type: 'webrtc_ice_candidate',
          candidate,
          roomCode
        }));
      }
    }
  });

  // Join room mutation
  const joinRoomMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/rooms/join', { 
        code: roomCode, 
        deviceId 
      });
      return response.json();
    },
    onSuccess: () => {
      onConnectionStatusChange('connected');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to join room. Please check the room code.",
        variant: "destructive",
      });
      onLeaveSession();
    }
  });

  // Leave room mutation
  const leaveRoomMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/rooms/${roomCode}/leave`, { 
        deviceId 
      });
      return response.json();
    },
    onSettled: () => {
      onLeaveSession();
    }
  });

  useEffect(() => {
    joinRoomMutation.mutate();
  }, []);

  useEffect(() => {
    if (socket && roomCode) {
      socket.send(JSON.stringify({
        type: 'join_room',
        roomCode,
        deviceId,
        participantId: `viewer_${deviceId}`,
        role: 'viewer'
      }));

      const handleMessage = async (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'webrtc_offer':
            const answer = await handleOffer(data.offer);
            if (answer && socket) {
              socket.send(JSON.stringify({
                type: 'webrtc_answer',
                answer,
                roomCode
              }));
            }
            break;
          case 'webrtc_ice_candidate':
            handleIceCandidate(data.candidate);
            break;
          case 'host_started_sharing':
            toast({
              title: "Screen Sharing Started",
              description: "Host has started sharing their screen",
            });
            break;
          case 'host_stopped_sharing':
            toast({
              title: "Screen Sharing Stopped",
              description: "Host has stopped sharing their screen",
            });
            break;
          case 'room_closed':
            toast({
              title: "Session Ended",
              description: data.message,
            });
            onLeaveSession();
            break;
        }
      };

      socket.addEventListener('message', handleMessage);
      return () => socket.removeEventListener('message', handleMessage);
    }
  }, [socket, roomCode]);

  useEffect(() => {
    if (remoteStream && videoRef.current) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleLeaveSession = () => {
    leaveRoomMutation.mutate();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const takeScreenshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `screenshot-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
            
            toast({
              title: "Screenshot Saved",
              description: "Screenshot has been downloaded",
            });
          }
        });
      }
    }
  };

  const copySessionLink = () => {
    const url = `${window.location.origin}?join=${roomCode}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "Session link copied to clipboard",
    });
  };

  const reportIssue = () => {
    toast({
      title: "Report Issue",
      description: "Issue reporting feature will be implemented",
    });
  };

  return (
    <div>
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground">
              Viewing Session
            </h3>
            <p className="text-gray-600 dark:text-muted-foreground" data-testid="text-host-name">
              Connected to {hostName}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-accent rounded-full" />
              <span className="text-sm text-accent font-medium">Connected</span>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleLeaveSession}
              data-testid="button-leave-session"
            >
              Leave Session
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Shared Screen Display */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-foreground">Shared Screen</h4>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-muted-foreground">
                  <Signal className="text-accent" size={16} />
                  <span data-testid="text-connection-quality">{connectionQuality}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleFullscreen}
                  data-testid="button-toggle-fullscreen"
                >
                  <Expand size={16} />
                </Button>
              </div>
            </div>
            <div 
              ref={containerRef}
              className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center overflow-hidden"
            >
              {!remoteStream ? (
                <div className="text-center text-gray-400">
                  <div className="text-4xl mb-4">📺</div>
                  <p className="text-xl font-medium">Waiting for host to share screen</p>
                  <p className="text-sm opacity-75">Make sure the host has started sharing</p>
                </div>
              ) : (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  className={`${fitToScreen ? 'w-full h-full object-contain' : 'w-auto h-auto'}`}
                  data-testid="video-shared-screen"
                />
              )}
            </div>
          </Card>
        </div>

        {/* Viewer Controls */}
        <div className="space-y-6">
          {/* Connection Info */}
          <Card className="p-6">
            <h4 className="font-semibold text-gray-900 dark:text-foreground mb-4">Connection Info</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-muted-foreground">Room Code:</span>
                <span className="font-mono font-medium" data-testid="text-room-code">{roomCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-muted-foreground">Latency:</span>
                <span className="text-accent font-medium" data-testid="text-latency">{latency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-muted-foreground">Quality:</span>
                <span className="text-accent font-medium" data-testid="text-quality">HD</span>
              </div>
            </div>
          </Card>

          {/* Viewer Settings */}
          <Card className="p-6">
            <h4 className="font-semibold text-gray-900 dark:text-foreground mb-4">Settings</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700 dark:text-foreground">Auto Quality</span>
                <Switch 
                  checked={autoQuality} 
                  onCheckedChange={setAutoQuality}
                  data-testid="switch-auto-quality"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700 dark:text-foreground">Fit to Screen</span>
                <Switch 
                  checked={fitToScreen} 
                  onCheckedChange={setFitToScreen}
                  data-testid="switch-fit-to-screen"
                />
              </div>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={reportIssue}
                data-testid="button-report-issue"
              >
                <AlertTriangle className="mr-2" size={16} />
                Report Issue
              </Button>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h4 className="font-semibold text-gray-900 dark:text-foreground mb-4">Quick Actions</h4>
            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={takeScreenshot}
                data-testid="button-take-screenshot"
              >
                <Camera className="mr-2" size={16} />
                Screenshot
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={copySessionLink}
                data-testid="button-copy-session-link"
              >
                <Link className="mr-2" size={16} />
                Copy Link
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
