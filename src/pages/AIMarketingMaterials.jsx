
import React, { useState, useEffect } from 'react';
import { User, BusinessSettings } from '@/api/entities';
import { GenerateImage } from '@/api/integrations';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Palette, Download, Save, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function AIMarketingMaterialsPage() {
    const [businessSettings, setBusinessSettings] = useState(null);
    const [logoPrompt, setLogoPrompt] = useState('');
    const [generatedLogo, setGeneratedLogo] = useState(null);
    const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);

    useEffect(() => {
        const loadBusinessSettings = async () => {
            try {
                const user = await User.me();
                const settings = await BusinessSettings.filter({ business_id: user.current_business_id });
                if (settings.length > 0) {
                    setBusinessSettings(settings[0]);
                }
            } catch (error) {
                console.error("Error loading business settings:", error);
                toast.error("Could not load your business information.");
            }
        };
        loadBusinessSettings();
    }, []);

    const handleGenerateLogo = async () => {
        if (!logoPrompt || !businessSettings) {
            toast.error("Please enter a prompt and ensure business settings are loaded.");
            return;
        }
        setIsGeneratingLogo(true);
        setGeneratedLogo(null);
        try {
            const result = await GenerateImage({ prompt: `Clean, modern, vector-style logo for a construction/contracting business named "${businessSettings.business_name}". Design based on: "${logoPrompt}". White background.` });
            setGeneratedLogo(result.url);
            toast.success("Logo generated successfully!");
        } catch (error) {
            console.error("Error generating logo:", error);
            toast.error("Failed to generate logo. Please try again.");
        } finally {
            setIsGeneratingLogo(false);
        }
    };
    
    const handleSaveLogo = async () => {
        if (!generatedLogo || !businessSettings) {
            toast.error("No logo to save or business settings not found.");
            return;
        }
        try {
            await BusinessSettings.update(businessSettings.id, { business_logo_url: generatedLogo });
            setBusinessSettings(prev => ({...prev, business_logo_url: generatedLogo}));
            toast.success("New logo saved as your business logo!");
        } catch(error) {
            console.error("Error saving logo:", error);
            toast.error("Failed to save logo.");
        }
    };

    const downloadImage = (url, filename) => {
        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch(e => {
                console.error("Error downloading image:", e);
                toast.error("Could not download image.");
            });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
            <div className="p-6 md:p-8 max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <Palette className="w-8 h-8 text-slate-700" />
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">AI Logo Generator</h1>
                        <p className="text-slate-600">Generate professional logos for your business using AI.</p>
                    </div>
                </div>

                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-600"/>
                            Generate a New Logo
                        </CardTitle>
                        <CardDescription>Describe the logo you want. Be specific about style, colors, and imagery.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea 
                            placeholder="e.g., A minimalist logo with a hammer and a roofline, using blue and gray colors."
                            value={logoPrompt}
                            onChange={(e) => setLogoPrompt(e.target.value)}
                            disabled={isGeneratingLogo}
                            rows={3}
                        />
                        <Button onClick={handleGenerateLogo} disabled={isGeneratingLogo || !logoPrompt} className="w-full">
                            {isGeneratingLogo ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                            ) : (
                                "Generate Logo"
                            )}
                        </Button>

                        {generatedLogo && (
                            <div className="mt-6 space-y-4">
                                <h4 className="font-semibold text-center">Generated Logo</h4>
                                <div className="p-4 border rounded-lg bg-slate-50 flex justify-center">
                                    <img src={generatedLogo} alt="Generated Logo" className="max-w-full h-48 object-contain"/>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => downloadImage(generatedLogo, 'generated_logo.png')} className="flex-1">
                                        <Download className="w-4 h-4 mr-2"/> Download
                                    </Button>
                                    <Button onClick={handleSaveLogo} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                                        <Save className="w-4 h-4 mr-2"/> Save as Business Logo
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
