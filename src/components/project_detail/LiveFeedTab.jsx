import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, AlertCircle, Settings, Wifi, Camera } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import LiveFeedWizard from './LiveFeedWizard';

export default function LiveFeedTab({ project, onProjectUpdate }) {
  const [showWizard, setShowWizard] = useState(false);

  const handleFeedSetup = (feedData) => {
    if (onProjectUpdate) {
      onProjectUpdate({
        live_feed_url: feedData.url,
        live_feed_provider: feedData.provider
      });
    }
    setShowWizard(false);
  };

  if (!project.live_feed_url) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <VideoOff className="w-5 h-5 text-slate-500" />
              No Live Feed Configured
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Camera className="w-16 h-16 text-slate-300 mx-auto mb-6" />
              <h3 className="text-lg font-medium text-slate-800 mb-2">Connect Your Job Site Camera</h3>
              <p className="text-slate-500 mb-6">
                Monitor your project progress in real-time with live feeds from Ring, Vivint, or other security cameras.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => setShowWizard(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Setup Live Feed
                </Button>
              </div>

              <Alert className="mt-6 text-left">
                <Wifi className="h-4 w-4" />
                <AlertTitle>Supported Systems</AlertTitle>
                <AlertDescription>
                  Ring, Vivint, Nest, Arlo, and any camera system that provides a web-accessible streaming URL.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {showWizard && (
          <LiveFeedWizard
            onComplete={handleFeedSetup}
            onCancel={() => setShowWizard(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-emerald-600" />
            Live Job Site Feed - {project.live_feed_provider || 'Camera System'}
          </CardTitle>
          <Button
            variant="outline"
            onClick={() => setShowWizard(true)}
            size="sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Reconfigure
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Live Feed Active</AlertTitle>
            <AlertDescription>
              Streaming from your {project.live_feed_provider || 'security camera'}. 
              If the feed doesn't load, check your camera settings or reconfigure the connection.
            </AlertDescription>
          </Alert>
          
          <div className="aspect-video w-full bg-slate-900 rounded-lg overflow-hidden border-2 border-slate-200">
            <iframe
              src={project.live_feed_url}
              title={`Live Feed from ${project.live_feed_provider || 'Job Site'}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
            >
              <div className="flex items-center justify-center h-full text-white">
                <div className="text-center">
                  <VideoOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Unable to load camera feed</p>
                  <p className="text-sm opacity-75">Check camera settings or try reconfiguring</p>
                </div>
              </div>
            </iframe>
          </div>

          <div className="flex justify-between items-center text-sm text-slate-500">
            <span>Provider: {project.live_feed_provider || 'Unknown'}</span>
            <span>Status: Live</span>
          </div>
        </CardContent>
      </Card>

      {showWizard && (
        <LiveFeedWizard
          currentProvider={project.live_feed_provider}
          currentUrl={project.live_feed_url}
          onComplete={handleFeedSetup}
          onCancel={() => setShowWizard(false)}
        />
      )}
    </div>
  );
}