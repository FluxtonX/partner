import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, AlertTriangle, Settings } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const channels = [
  { 
    name: "Google Business & Ads", 
    icon: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg", 
    description: "Manage your business profile, reviews, and ad campaigns on Google.",
    apiLink: "https://developers.google.com/my-business",
    setupInstructions: "To connect Google Business Profile and Google Ads, you'll need to create a Google Cloud Project and enable the My Business API and Google Ads API. This requires OAuth2 authentication."
  },
  { 
    name: "Facebook Page & Ads", 
    icon: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg", 
    description: "Connect with customers and run targeted ad campaigns on Facebook.",
    apiLink: "https://developers.facebook.com/docs/marketing-apis",
    setupInstructions: "Facebook Marketing API integration requires creating a Facebook App, obtaining page access tokens, and implementing Facebook Login with appropriate permissions for ads management."
  },
  { 
    name: "Angi (Angie's List)", 
    icon: "https://d1spt8a5w9x7cm.cloudfront.net/assets/images/logo/logo-square.svg", 
    description: "Manage your leads and profile on the Angi network.",
    apiLink: "https://www.angi.com/companyaccount/",
    setupInstructions: "Angi provides lead management through their Pro Center. API access is typically available for enterprise accounts. Contact Angi Business Support for API documentation."
  },
  { 
    name: "Yelp for Business", 
    icon: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Yelp_Logo.svg", 
    description: "Respond to reviews and manage your business presence on Yelp.",
    apiLink: "https://www.yelp.com/developers/documentation/v3",
    setupInstructions: "Yelp Fusion API allows you to search for businesses and read reviews. For business management features, you'll need to use Yelp for Business tools and their messaging API."
  },
  { 
    name: "Nextdoor", 
    icon: "https://assets.nextdoor.com/images/nextdoor-monogram.svg", 
    description: "Engage with local communities and advertise your services.",
    apiLink: "https://help.nextdoor.com/s/article/nextdoor-for-business",
    setupInstructions: "Nextdoor Business API is limited. Most integrations work through their Business Posts feature and Nextdoor Ads Manager. Contact Nextdoor Business Support for API access."
  },
  { 
    name: "Thumbtack", 
    icon: "https://static.thumbtack.static.com/media/logos/thumbtack_standard_1200.png", 
    description: "Find and manage leads from customers looking for professionals.",
    apiLink: "https://www.thumbtack.com/pro/",
    setupInstructions: "Thumbtack provides lead management through their Pro Dashboard. API integrations are typically available for enterprise customers. Contact Thumbtack Pro Support for integration options."
  },
];

const ConnectionDialog = ({ channel }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Settings className="w-4 h-4 mr-2" />
          Connect API
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <img src={channel.icon} alt={`${channel.name} logo`} className="w-8 h-8 object-contain" />
            Connect {channel.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              API integrations require developer setup and may involve costs from the platform provider.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <h4 className="font-semibold">Integration Requirements:</h4>
            <p className="text-sm text-slate-600">{channel.setupInstructions}</p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Next Steps:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600">
              <li>Visit the official API documentation using the link below</li>
              <li>Create developer accounts and obtain necessary API keys</li>
              <li>Contact your development team to implement the integration</li>
              <li>Test the connection in a staging environment first</li>
            </ol>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button asChild className="flex-1">
              <a href={channel.apiLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                View API Documentation
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="mailto:support@partner.com?subject=Marketing API Integration Request" target="_blank">
                Request Integration Support
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function ChannelIntegrations() {
  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Marketing Channel Integrations</CardTitle>
        <CardDescription>Connect your marketing platforms to sync data and manage campaigns directly from Partner.</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="default" className="mb-6 bg-blue-50 border-blue-200">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
                These integrations require API setup by a developer. Each platform has different requirements and authentication methods. Click "Connect API" for specific instructions.
            </AlertDescription>
        </Alert>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map(channel => (
            <Card key={channel.name} className="flex flex-col">
              <CardHeader className="flex flex-row items-center gap-4">
                <img src={channel.icon} alt={`${channel.name} logo`} className="w-10 h-10 object-contain" />
                <CardTitle className="text-lg">{channel.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-slate-600 mb-4">{channel.description}</p>
                <div className="space-y-2">
                  <ConnectionDialog channel={channel} />
                  <Button variant="ghost" size="sm" asChild className="w-full">
                    <a href={channel.apiLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Quick Link to Platform
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-6 bg-slate-50 rounded-lg">
          <h4 className="font-semibold text-slate-900 mb-2">Need Help with API Integration?</h4>
          <p className="text-sm text-slate-600 mb-4">
            Our development team can help set up these integrations for your business. Each integration typically takes 2-4 weeks to implement and test.
          </p>
          <Button asChild>
            <a href="mailto:support@partner.com?subject=Marketing API Integration Consultation" target="_blank">
              Schedule Integration Consultation
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}