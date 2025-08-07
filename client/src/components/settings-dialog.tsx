import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Settings, Upload, Trash2, Monitor, Moon, Sun, Image as ImageIcon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";

export default function SettingsDialog() {
  const { theme, backgroundImage, setTheme, setBackgroundImage } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please choose an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please choose an image file",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setBackgroundImage(result);
        toast({
          title: "Background updated",
          description: "Your custom background has been set",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = () => {
    const url = urlInputRef.current?.value;
    if (url) {
      // Basic URL validation
      try {
        new URL(url);
        setBackgroundImage(url);
        if (urlInputRef.current) {
          urlInputRef.current.value = "";
        }
        toast({
          title: "Background updated",
          description: "Your custom background has been set",
        });
      } catch {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid image URL",
          variant: "destructive",
        });
      }
    }
  };

  const removeBackground = () => {
    setBackgroundImage(null);
    toast({
      title: "Background removed",
      description: "Default background restored",
    });
  };

  const presetBackgrounds = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=1920&h=1080&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1539627831859-a911cf04d3cd?w=1920&h=1080&fit=crop&crop=center",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-gray-500 hover:text-gray-700 dark:text-muted-foreground dark:hover:text-foreground"
          data-testid="button-open-settings"
        >
          <Settings size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings size={20} />
            <span>Settings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Theme Settings */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Monitor size={18} />
              <span>Theme</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {theme === "light" ? <Sun size={16} /> : <Moon size={16} />}
                  <Label>Dark Mode</Label>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  data-testid="switch-dark-mode"
                />
              </div>
            </div>
          </Card>

          {/* Background Settings */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <ImageIcon size={18} />
              <span>Background</span>
            </h3>
            
            {/* Current Background Preview */}
            {backgroundImage && (
              <div className="mb-4">
                <Label className="block text-sm font-medium mb-2">Current Background</Label>
                <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                  <img
                    src={backgroundImage}
                    alt="Current background"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeBackground}
                    data-testid="button-remove-background"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Upload from Device */}
              <div>
                <Label className="block text-sm font-medium mb-2">Upload Image</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  data-testid="input-file-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  data-testid="button-upload-image"
                >
                  <Upload className="mr-2" size={16} />
                  Choose Image from Device
                </Button>
                <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">
                  Max file size: 5MB. Supported formats: JPG, PNG, WebP
                </p>
              </div>

              {/* URL Input */}
              <div>
                <Label className="block text-sm font-medium mb-2">Image URL</Label>
                <div className="flex space-x-2">
                  <Input
                    ref={urlInputRef}
                    placeholder="https://example.com/image.jpg"
                    data-testid="input-image-url"
                  />
                  <Button onClick={handleUrlSubmit} data-testid="button-set-url-background">
                    Set
                  </Button>
                </div>
              </div>

              {/* Preset Backgrounds */}
              <div>
                <Label className="block text-sm font-medium mb-2">Preset Backgrounds</Label>
                <div className="grid grid-cols-2 gap-2">
                  {presetBackgrounds.map((bg, index) => (
                    <button
                      key={index}
                      onClick={() => setBackgroundImage(bg)}
                      className="relative w-full h-20 rounded-lg overflow-hidden border hover:border-primary transition-colors"
                      data-testid={`button-preset-background-${index}`}
                    >
                      <img
                        src={bg}
                        alt={`Preset ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {backgroundImage === bg && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="w-4 h-4 bg-primary rounded-full" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Remove Background */}
              {backgroundImage && (
                <Button
                  variant="outline"
                  onClick={removeBackground}
                  className="w-full"
                  data-testid="button-clear-background"
                >
                  <Trash2 className="mr-2" size={16} />
                  Remove Background
                </Button>
              )}
            </div>
          </Card>

          {/* Additional Settings Placeholder */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Other Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>High Quality Mode</Label>
                <Switch defaultChecked data-testid="switch-high-quality-mode" />
              </div>
              <div className="flex items-center justify-between">
                <Label>Auto-connect on Join</Label>
                <Switch defaultChecked data-testid="switch-auto-connect" />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show Connection Stats</Label>
                <Switch data-testid="switch-show-stats" />
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}