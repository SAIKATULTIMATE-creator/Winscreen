import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Radio, Eye, Shield, Smartphone, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConnectionSetupProps {
  onStartHosting: () => void;
  onJoinSession: (roomCode: string) => void;
}

export default function ConnectionSetup({ onStartHosting, onJoinSession }: ConnectionSetupProps) {
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const { toast } = useToast();

  const handleJoinRoom = () => {
    if (roomCode && roomCode.length === 6) {
      onJoinSession(roomCode);
    } else {
      toast({
        title: "Invalid Room Code",
        description: "Please enter a valid 6-digit room code",
        variant: "destructive",
      });
    }
  };

  const formatRoomCode = (value: string) => {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-foreground mb-4">
          Share Your Screen
        </h2>
        <p className="text-lg text-gray-600 dark:text-muted-foreground">
          Connect with friends and share your screen across multiple devices
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Host Option */}
        <Card className="p-6 hover:shadow-xl transition-shadow backdrop-card">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Radio className="text-primary text-2xl" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-foreground mb-3">
              Host a Session
            </h3>
            <p className="text-gray-600 dark:text-muted-foreground mb-6">
              Share your screen with others
            </p>
            <Button 
              className="w-full" 
              onClick={onStartHosting}
              data-testid="button-start-hosting"
            >
              Start Sharing
            </Button>
          </div>
        </Card>

        {/* Join Option */}
        <Card className="p-6 hover:shadow-xl transition-shadow backdrop-card">
          <div className="text-center">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="text-accent text-2xl" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-foreground mb-3">
              Join a Session
            </h3>
            <p className="text-gray-600 dark:text-muted-foreground mb-6">
              View someone else's screen
            </p>
            <Button 
              className="w-full bg-accent hover:bg-accent/90" 
              onClick={() => setShowJoinForm(true)}
              data-testid="button-show-join-form"
            >
              Join Session
            </Button>
          </div>
        </Card>
      </div>

      {/* Join Form */}
      {showJoinForm && (
        <Card className="p-6 backdrop-card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-4">
            Enter Room Code
          </h3>
          <div className="space-y-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 dark:text-muted-foreground mb-2">
                Room Code
              </Label>
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={roomCode}
                onChange={(e) => setRoomCode(formatRoomCode(e.target.value))}
                className="text-center text-2xl font-mono tracking-widest"
                data-testid="input-room-code"
              />
            </div>
            <div className="flex space-x-3">
              <Button 
                className="flex-1 bg-accent hover:bg-accent/90" 
                onClick={handleJoinRoom}
                data-testid="button-join-room"
              >
                Join Room
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setShowJoinForm(false)}
                data-testid="button-cancel-join"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <div className="text-center">
          <div className="feature-icon blue">
            <Shield className="text-primary" size={24} />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-foreground mb-2">
            Secure Connection
          </h4>
          <p className="text-sm text-gray-600 dark:text-muted-foreground">
            End-to-end encrypted peer-to-peer connection
          </p>
        </div>
        <div className="text-center">
          <div className="feature-icon green">
            <Smartphone className="text-accent" size={24} />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-foreground mb-2">
            Multi-Device
          </h4>
          <p className="text-sm text-gray-600 dark:text-muted-foreground">
            Works on desktop, tablet, and mobile devices
          </p>
        </div>
        <div className="text-center">
          <div className="feature-icon orange">
            <Zap className="text-warning" size={24} />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-foreground mb-2">
            Real-time
          </h4>
          <p className="text-sm text-gray-600 dark:text-muted-foreground">
            Low latency screen sharing with WebRTC
          </p>
        </div>
      </div>
    </div>
  );
}
