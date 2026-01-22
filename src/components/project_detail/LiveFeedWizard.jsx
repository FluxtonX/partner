import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ChevronRight, 
  ChevronLeft, 
  Video, 
  Shield, 
  Wifi, 
  Eye, 
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  Smartphone,
  Monitor
} from 'lucide-react';

const CAMERA_PROVIDERS = [
  {
    id: 'ring',
    name: 'Ring',
    logo: '🔔',
    description: 'Amazon Ring doorbells and security cameras',
    difficulty: 'Easy',
    features: ['Motion alerts', 'Two-way audio', 'Night vision'],
    instructions: [
      'Open the Ring app on your phone',
      'Select your camera from the dashboard',
      'Tap the gear icon (Settings)',
      'Go to "Device Settings" → "Video Settings"',
      'Look for "Live View" or "Streaming" options',
      'Copy the web streaming URL if available'
    ],
    notes: 'Ring cameras typically require Ring Protect subscription for web streaming. Some models may not support direct web streaming.',
    testUrl: 'https://ring.com/share/your-camera-id'
  },
  {
    id: 'vivint',
    name: 'Vivint',
    logo: '🏠',
    description: 'Vivint home security cameras',
    difficulty: 'Easy',
    features: ['Professional monitoring', 'Smart home integration', 'Cloud storage'],
    instructions: [
      'Log into your Vivint Sky app',
      'Navigate to "Cameras" section',
      'Select your outdoor camera',
      'Look for "Share" or "Web View" option',
      'Generate a shareable link',
      'Copy the streaming URL'
    ],
    notes: 'Vivint cameras require an active monitoring plan. Web streaming may need to be enabled in your account settings.',
    testUrl: 'https://vivint.com/stream/camera-id'
  },
  {
    id: 'nest',
    name: 'Google Nest',
    logo: '🏡',
    description: 'Google Nest and Nest Cam devices',
    difficulty: 'Medium',
    features: ['Google integration', 'Intelligent alerts', '24/7 recording'],
    instructions: [
      'Open the Google Home app',
      'Select your Nest camera',
      'Tap the settings gear',
      'Go to "Camera settings" → "Sharing"',
      'Enable "Public sharing" if available',
      'Copy the public stream URL'
    ],
    notes: 'Google discontinued public streaming for newer Nest cameras. Older models may still support web embedding.',
    testUrl: 'https://nest.com/cameras/your-camera-id'
  },
  {
    id: 'arlo',
    name: 'Arlo',
    logo: '📹',
    description: 'Arlo wireless security cameras',
    difficulty: 'Medium',
    features: ['Wire-free', 'Weather resistant', 'Smart detection'],
    instructions: [
      'Open the Arlo app',
      'Select your camera',
      'Go to Settings → Sharing',
      'Create a shareable link',
      'Set permissions to "Public" if needed',
      'Copy the web streaming URL'
    ],
    notes: 'Arlo Smart subscription may be required for sharing features. Check privacy settings before sharing.',
    testUrl: 'https://arlo.com/share/camera-stream'
  },
  {
    id: 'wyze',
    name: 'Wyze',
    logo: '👁️',
    description: 'Wyze affordable smart cameras',
    difficulty: 'Hard',
    features: ['Very affordable', 'Local storage', 'Motion detection'],
    instructions: [
      'Wyze cameras require RTSP firmware',
      'Flash RTMP firmware to your camera',
      'Configure RTSP stream in camera settings',
      'Use third-party streaming service',
      'Set up port forwarding on your router',
      'Create web-accessible stream URL'
    ],
    notes: 'Wyze requires technical setup. Consider using a streaming service like YouTube Live or similar.',
    testUrl: 'rtsp://camera-ip:554/live'
  },
  {
    id: 'custom',
    name: 'Other/Custom',
    logo: '⚙️',
    description: 'Any camera with web streaming capability',
    difficulty: 'Varies',
    features: ['Flexible setup', 'Any manufacturer', 'Custom integration'],
    instructions: [
      'Check your camera\'s manual or app',
      'Look for "Web streaming" or "RTMP" options',
      'Enable public/web access if available',
      'Configure any required port forwarding',
      'Test the stream URL in a web browser',
      'Copy the working stream URL'
    ],
    notes: 'Setup varies by manufacturer. Look for options like "Web View", "Public Stream", or "RTMP URL".',
    testUrl: 'https://your-camera-system.com/stream'
  }
];

export default function LiveFeedWizard({ currentProvider, currentUrl, onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState(currentProvider || '');
  const [streamUrl, setStreamUrl] = useState(currentUrl || '');
  const [testingUrl, setTestingUrl] = useState(false);
  const [urlValid, setUrlValid] = useState(null);

  const selectedProviderData = CAMERA_PROVIDERS.find(p => p.id === selectedProvider);

  const testStreamUrl = async () => {
    if (!streamUrl.trim()) return;
    
    setTestingUrl(true);
    setUrlValid(null);

    try {
      // Simple validation - check if URL is properly formatted
      const url = new URL(streamUrl);
      if (url.protocol !== 'https:' && url.protocol !== 'http:' && url.protocol !== 'rtsp:') {
        throw new Error('Invalid protocol');
      }
      
      // For demo purposes, we'll assume the URL is valid after basic checks
      setTimeout(() => {
        setUrlValid(true);
        setTestingUrl(false);
      }, 1500);
      
    } catch (error) {
      setTimeout(() => {
        setUrlValid(false);
        setTestingUrl(false);
      }, 1500);
    }
  };

  const handleComplete = () => {
    if (!selectedProvider || !streamUrl.trim()) return;
    
    onComplete({
      provider: selectedProviderData?.name || selectedProvider,
      url: streamUrl.trim()
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Video className="w-12 h-12 mx-auto text-blue-600 mb-2" />
        <h2 className="text-xl font-semibold">Choose Your Camera System</h2>
        <p className="text-slate-600">Select your security camera brand to get setup instructions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CAMERA_PROVIDERS.map((provider) => (
          <Card 
            key={provider.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedProvider === provider.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => setSelectedProvider(provider.id)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{provider.logo}</span>
                  {provider.name}
                </div>
                <Badge variant={
                  provider.difficulty === 'Easy' ? 'default' : 
                  provider.difficulty === 'Medium' ? 'secondary' : 
                  'destructive'
                }>
                  {provider.difficulty}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-3">{provider.description}</p>
              <div className="flex flex-wrap gap-1">
                {provider.features.slice(0, 2).map((feature) => (
                  <Badge key={feature} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-3xl">{selectedProviderData?.logo}</span>
          <h2 className="text-xl font-semibold">{selectedProviderData?.name} Setup</h2>
        </div>
        <p className="text-slate-600">Follow these steps to get your camera's streaming URL</p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> {selectedProviderData?.notes}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Step-by-Step Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {selectedProviderData?.instructions.map((instruction, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <span className="text-sm">{instruction}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <div className="bg-slate-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-slate-800">Example URL Format:</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(selectedProviderData?.testUrl || '')}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        <code className="text-sm bg-white px-2 py-1 rounded border">
          {selectedProviderData?.testUrl}
        </code>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Monitor className="w-12 h-12 mx-auto text-blue-600 mb-2" />
        <h2 className="text-xl font-semibold">Enter Your Stream URL</h2>
        <p className="text-slate-600">Paste the streaming URL from your {selectedProviderData?.name} camera</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="stream-url">Camera Stream URL *</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="stream-url"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              placeholder="https://your-camera-stream-url..."
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={testStreamUrl}
              disabled={!streamUrl.trim() || testingUrl}
            >
              {testingUrl ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                  Testing
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Test
                </>
              )}
            </Button>
          </div>
        </div>

        {urlValid === true && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              URL format looks good! Click "Complete Setup" to save your camera feed.
            </AlertDescription>
          </Alert>
        )}

        {urlValid === false && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              URL appears invalid. Please check the format and try again, or go back to review the setup instructions.
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Troubleshooting Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Make sure your camera is online and accessible</li>
            <li>• Check that web streaming is enabled in your camera settings</li>
            <li>• Ensure the URL starts with https:// or http://</li>
            <li>• Some cameras require you to be on the same network initially</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Live Camera Feed Setup</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i <= step ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-slate-500">Step {step} of 3</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={step === 1 ? onCancel : () => setStep(step - 1)}
          >
            {step === 1 ? (
              'Cancel'
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </>
            )}
          </Button>

          <Button
            onClick={step === 3 ? handleComplete : () => setStep(step + 1)}
            disabled={step === 1 && !selectedProvider || (step === 3 && !streamUrl.trim())}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {step === 3 ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Setup
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}