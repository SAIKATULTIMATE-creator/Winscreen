import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Copy, Share, Wifi } from "lucide-react";
import { useWebRTC } from "@/hooks/use-webrtc";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface HostInterfaceProps {
  roomCode: string;
  onStopSharing: () => void;
  onConnectionStatusChange: (status: 'disconnected' | 'connecting' | 'connected') => void;
}

interface Participant {
  id: string;
  deviceId: string;
  role: string;
  isConnected: string;
}

export default function HostInterface({ 
  roomCode: initialRoomCode, 
  onStopSharing, 
  onConnectionStatusChange 
}: HostInterfaceProps) {
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [shareAudio, setShareAudio] = useState(false);
  const [highQuality, setHighQuality] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deviceId = `device_${Date.now()}`;

  // Create room mutation
  const createRoomMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/rooms', { deviceId });
      return response.json();
    },
    onSuccess: (data) => {
      setRoomCode(data.code);
      onConnectionStatusChange('connected');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create room",
        variant: "destructive",
      });
    }
  });

  // Get participants query
  const { data: participantsData } = useQuery({
    queryKey: ['/api/rooms', roomCode, 'participants'],
    enabled: !!roomCode,
    refetchInterval: 5000,
  });

  const { socket } = useWebSocket();
  const { 
    startScreenShare, 
    stopScreenShare, 
    createOffer, 
    handleAnswer, 
    handleIceCandidate 
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

  useEffect(() => {
    if (!roomCode) {
      createRoomMutation.mutate();
    }
  }, []);

  useEffect(() => {
    if (socket && roomCode) {
      socket.send(JSON.stringify({
        type: 'join_room',
        roomCode,
        deviceId,
        participantId: `host_${deviceId}`,
        role: 'host'
      }));

      const handleMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'participant_joined':
            queryClient.invalidateQueries({ queryKey: ['/api/rooms', roomCode, 'participants'] });
            handleNewViewer();
            break;
          case 'webrtc_answer':
            handleAnswer(data.answer);
            break;
          case 'webrtc_ice_candidate':
            handleIceCandidate(data.candidate);
            break;
        }
      };

      socket.addEventListener('message', handleMessage);
      return () => socket.removeEventListener('message', handleMessage);
    }
  }, [socket, roomCode]);

  const handleNewViewer = async () => {
    if (isSharing && streamRef.current) {
      const offer = await createOffer(streamRef.current);
      if (socket && offer) {
        socket.send(JSON.stringify({
          type: 'webrtc_offer',
          offer,
          roomCode
        }));
      }
    }
  };

  const handleStartSharing = async () => {
    try {
      const stream = await startScreenShare({ 
        includeAudio: shareAudio,
        video: {
          width: highQuality ? 1920 : 1280,
          height: highQuality ? 1080 : 720,
          frameRate: highQuality ? 30 : 15
        }
      });
      
      if (stream && videoRef.current) {
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        setIsSharing(true);
        
        if (socket) {
          socket.send(JSON.stringify({
            type: 'screen_share_started',
            roomCode
          }));
        }

        stream.getVideoTracks()[0].addEventListener('ended', handleStopSharing);
        toast({
          title: "Screen Sharing Started",
          description: "Your screen is now being shared",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start screen sharing. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const handleStopSharing = () => {
    stopScreenShare();
    setIsSharing(false);
    streamRef.current = null;
    
    if (socket) {
      socket.send(JSON.stringify({
        type: 'screen_share_stopped',
        roomCode
      }));
    }
    
    onStopSharing();
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast({
      title: "Copied!",
      description: "Room code copied to clipboard",
    });
  };

  const shareLink = () => {
    const url = `${window.location.origin}?join=${roomCode}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Shared",
      description: "Session link copied to clipboard",
    });
  };

  const participants = participantsData?.participants?.filter((p: Participant) => p.role === 'viewer') || [];
  const connectedViewers = participants.filter((p: Participant) => p.isConnected === 'true');

  useEffect(() => {
    if (isSharing) {
      handleStartSharing();
    }
  }, [shareAudio, highQuality]);

  return (
    <div>
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground">
              Hosting Session
            </h3>
            <p className="text-gray-600 dark:text-muted-foreground">
              Share this room code with others to join
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {isSharing && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-accent rounded-full animate-pulse" />
                <span className="text-sm text-accent font-medium">Live</span>
              </div>
            )}
            <Button 
              variant="destructive" 
              onClick={handleStopSharing}
              data-testid="button-stop-sharing"
            >
              Stop Sharing
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Room Code Display */}
        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 dark:text-foreground mb-4">Room Code</h4>
          <div className="text-center">
            <div className="bg-gray-100 dark:bg-muted rounded-lg p-4 mb-4">
              <span className="room-code-display" data-testid="text-room-code">
                {roomCode || 'LOADING'}
              </span>
            </div>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={copyRoomCode}
              data-testid="button-copy-room-code"
            >
              <Copy className="mr-2" size={16} />
              Copy Code
            </Button>
          </div>
        </Card>

        {/* Connected Viewers */}
        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 dark:text-foreground mb-4">
            Connected Viewers
          </h4>
          <div className="space-y-3">
            {connectedViewers.map((viewer: Participant, index: number) => (
              <div key={viewer.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {`V${index + 1}`}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-foreground">
                    Viewer {index + 1}
                  </span>
                </div>
                <div className="w-2 h-2 bg-accent rounded-full" />
              </div>
            ))}
            {connectedViewers.length === 0 && (
              <p className="text-gray-500 dark:text-muted-foreground text-center py-4">
                No viewers connected
              </p>
            )}
          </div>
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-500 dark:text-muted-foreground" data-testid="text-viewer-count">
              {connectedViewers.length} viewers connected
            </span>
          </div>
        </Card>

        {/* Sharing Controls */}
        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 dark:text-foreground mb-4">Sharing Options</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700 dark:text-foreground">Share Audio</span>
              <Switch 
                checked={shareAudio} 
                onCheckedChange={setShareAudio}
                data-testid="switch-share-audio"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700 dark:text-foreground">High Quality</span>
              <Switch 
                checked={highQuality} 
                onCheckedChange={setHighQuality}
                data-testid="switch-high-quality"
              />
            </div>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={shareLink}
              data-testid="button-share-link"
            >
              <Share className="mr-2" size={16} />
              Share Link
            </Button>
          </div>
        </Card>
      </div>

      {/* Screen Preview */}
      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-foreground">Your Screen Preview</h4>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-muted-foreground">
            <Wifi className="text-accent" size={16} />
            <span>Connection: Excellent</span>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center overflow-hidden">
          {!isSharing && (
            <div className="text-center">
              <Button onClick={handleStartSharing} data-testid="button-start-screen-share">
                Start Screen Share
              </Button>
            </div>
          )}
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            className="w-full h-full object-contain"
            data-testid="video-screen-preview"
          />
        </div>
      </Card>
    </div>
  );
}
