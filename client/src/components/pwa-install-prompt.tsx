import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 p-4 max-w-sm backdrop-card shadow-lg z-50">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
          <Download className="text-white" size={16} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-foreground text-sm">
            Install App
          </h3>
          <p className="text-xs text-gray-600 dark:text-muted-foreground mb-3">
            Add ScreenShare Connect to your home screen for quick access
          </p>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              onClick={handleInstall}
              className="text-xs"
              data-testid="button-install-pwa"
            >
              Install
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDismiss}
              className="text-xs"
              data-testid="button-dismiss-pwa"
            >
              <X size={12} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}