import { useWebSocket } from "@/hooks/use-websocket";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

export default function ConnectionStatus() {
  const { isConnected } = useWebSocket();
  const [showReconnecting, setShowReconnecting] = useState(false);
  const [wasConnected, setWasConnected] = useState(false);

  useEffect(() => {
    if (isConnected && !wasConnected) {
      // Just reconnected
      setShowReconnecting(false);
      setWasConnected(true);
    } else if (!isConnected && wasConnected) {
      // Just disconnected
      setShowReconnecting(true);
      setWasConnected(false);
    }
  }, [isConnected, wasConnected]);

  if (!isConnected && showReconnecting) {
    return (
      <Card className="fixed top-4 right-4 z-50 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center space-x-2 text-yellow-700 dark:text-yellow-300">
          <RefreshCw size={16} className="animate-spin" />
          <span className="text-sm font-medium">Reconnecting...</span>
        </div>
      </Card>
    );
  }

  return (
    <Badge 
      variant={isConnected ? "default" : "destructive"}
      className="fixed top-4 right-4 z-50 flex items-center space-x-1"
      data-testid="connection-status"
    >
      {isConnected ? (
        <>
          <Wifi size={12} />
          <span>Online</span>
        </>
      ) : (
        <>
          <WifiOff size={12} />
          <span>Offline</span>
        </>
      )}
    </Badge>
  );
}