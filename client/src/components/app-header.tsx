import { Monitor, HelpCircle } from "lucide-react";

interface AppHeaderProps {
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
}

export default function AppHeader({ connectionStatus }: AppHeaderProps) {
  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      default: return 'Disconnected';
    }
  };

  return (
    <header className="bg-surface dark:bg-card shadow-sm border-b border-gray-200 dark:border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Monitor className="text-white text-sm" size={16} />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-foreground">
              ScreenShare Connect
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2" data-testid="connection-status">
              <div className={`connection-status-dot ${connectionStatus}`} />
              <span className="text-sm text-gray-600 dark:text-muted-foreground">
                {getStatusText()}
              </span>
            </div>
            <button 
              className="text-gray-500 hover:text-gray-700 dark:text-muted-foreground dark:hover:text-foreground"
              data-testid="button-help"
            >
              <HelpCircle size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
