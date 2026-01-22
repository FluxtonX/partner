
import React, { useState, useEffect } from 'react';
import { BusinessSettings as BusinessSettingsEntity, User, UserBusiness, ProductOrService, DocumentTemplate } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { Upload, Save, Settings, Users, DollarSign, Clock, Briefcase, BellRing, Lightbulb, RefreshCw, Loader2, AlertTriangle, FileText, Plus, Edit, Eye, Trash2, Info, Calculator, Sparkles, Wand2, Image, Users as UsersIcon } from 'lucide-react'; // Added UsersIcon
import { inflationTracker } from '@/api/functions';
import { getMinimumWage } from '@/api/functions';
import { calculateIndirectCostRate } from '@/api/functions';
import { GenerateImage } from '@/api/integrations';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

import DocumentBuilder from '../components/documents/DocumentBuilder';
import TemplateAIAssistant from '../components/documents/TemplateAIAssistant';

const WEEK_DAYS = [
  { id: 'sunday', label: 'Sunday' },
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
];

export default function BusinessSettings() {
  const [settings, setSettings] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [showDocumentBuilder, setShowDocumentBuilder] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [minimumWage, setMinimumWage] = useState(null);
  const [isLoadingWage, setIsLoadingWage] = useState(false);
  const [indirectRate, setIndirectRate] = useState(null);
  const [isCalculatingIndirect, setIsCalculatingIndirect] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [newTemplateType, setNewTemplateType] = useState(null);
  const [showLogoGenerator, setShowLogoGenerator] = useState(false);
  const [businessDescription, setBusinessDescription] = useState('');
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [generatedLogos, setGeneratedLogos] = useState([]);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings?.business_state) {
      const loadMinimumWageData = async () => {
        setIsLoadingWage(true);
        try {
          const response = await getMinimumWage({ state: settings.business_state });
          
          if (response.data && response.data.success) {
            const fetchedWage = response.data.minimumWage;
            setMinimumWage(fetchedWage);
            
            // Auto-populate if not already set or if current is 0
            if (settings.minimum_hourly_wage === 0 || settings.minimum_hourly_wage == null) {
              setSettings(prev => ({ ...prev, minimum_hourly_wage: fetchedWage }));
            }
            
            toast.success(`Loaded ${response.data.source}: $${fetchedWage.toFixed(2)}/hour`);
          } else {
            // Handle function error response
            const errorMsg = response.data?.error || 'Failed to load minimum wage data';
            console.error('Minimum wage API error:', errorMsg);
            toast.error(`Error: ${errorMsg}`);
            
            // Use fallback if available
            if (response.data?.minimumWage) {
              setMinimumWage(response.data.minimumWage);
            }
          }
        } catch (error) {
          console.error('Failed to load minimum wage:', error);
          
          // Provide a user-friendly error message
          if (error.toString().includes('Rate limit exceeded')) {
            toast.error('Too many requests. Please wait a moment before trying again.');
          } else if (error.toString().includes('500')) {
            toast.error('Service temporarily unavailable. Using federal minimum wage as fallback.');
            setMinimumWage(7.25); // Federal minimum wage fallback
          } else {
            toast.error('Failed to load minimum wage data. Please try again later.');
          }
        } finally {
          setIsLoadingWage(false);
        }
      };
      
      loadMinimumWageData();
    }
  }, [settings?.business_state]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      if (user.current_business_id) {
        const [businessSettings, templatesData] = await Promise.all([
          BusinessSettingsEntity.filter({ business_id: user.current_business_id }),
          DocumentTemplate.list('-created_date')
        ]);
        
        if (businessSettings.length > 0) {
          const loadedSettings = businessSettings[0];
          setSettings(loadedSettings);
          // Initialize indirectRate if available from loaded settings
          if (loadedSettings.last_calculated_indirect_rate != null) {
            setIndirectRate(loadedSettings.last_calculated_indirect_rate);
          }
        } else {
          // Initialize with defaults if no settings exist
          setSettings({
            business_id: user.current_business_id,
            business_name: '',
            business_email: '',
            business_phone: '',
            business_address: '',
            business_state: '',
            tax_rate: 0.0,
            materials_markup: 0.0,
            labor_markup: 0.0,
            minimum_profit_margin: 0.0,
            minimum_hourly_wage: 0.0,
            include_indirect_cost_in_estimates: false,
            last_calculated_indirect_rate: null,
            work_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            business_hours_start: '08:00',
            business_hours_end: '17:00',
            lunch_break_start: '12:00',
            lunch_break_end: '13:00',
            enable_workday_reminders: false,
            reminder_lead_time_minutes: 60,
            business_logo_url: null,
            // New subcontractor settings
            subcontractor_daily_delay_penalty_rate: 0.01, // 1%
            subcontractor_completion_delay_penalty_rate: 0.02, // 2%
            subcontractor_holdback_percentage: 0.10, // 10%
            subcontractor_penalty_grace_days: 1, // 1 day
          });
        }
        
        setTemplates(templatesData);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load business settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateIndirectRate = async () => {
    setIsCalculatingIndirect(true);
    try {
      const response = await calculateIndirectCostRate();
      
      if (response.data && response.data.success) {
        const rate = response.data.indirect_hourly_rate;
        setIndirectRate(rate);
        // Also save to settings object so it persists
        setSettings(prev => ({ ...prev, last_calculated_indirect_rate: rate }));
        toast.success(`Indirect cost rate calculated: $${rate.toFixed(2)}/hour`);
      } else {
        const errorMsg = response.data?.error || 'Failed to calculate indirect cost rate';
        console.error('Indirect cost calculation error:', errorMsg);
        toast.error(`Error: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Failed to calculate indirect rate:', error);
      
      if (error.toString().includes('Rate limit exceeded')) {
        toast.error('Too many requests. Please wait a moment before trying again.');
      } else {
        toast.error('Failed to calculate indirect cost rate. Please try again later.');
      }
    } finally {
      setIsCalculatingIndirect(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    try {
      if (settings.id) {
        await BusinessSettingsEntity.update(settings.id, settings);
      } else {
        await BusinessSettingsEntity.create(settings);
      }
      toast.success('Settings saved successfully!');
      loadSettings();
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSelectChange = (name, value) => {
    setSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDayToggle = (dayId) => {
    const currentDays = settings.work_days || [];
    const newDays = currentDays.includes(dayId)
      ? currentDays.filter(d => d !== dayId)
      : [...currentDays, dayId];
    setSettings(prev => ({ ...prev, work_days: newDays }));
  };

  const handleInflationAdjustment = async () => {
    if (!window.confirm('This will update the material and labor costs for ALL products based on inflation since their creation date. This action cannot be undone. Do you want to proceed?')) {
        return;
    }

    setIsAdjusting(true);
    toast.info('Starting inflation adjustment for all products... This may take a few moments.');

    try {
        const products = await ProductOrService.filter({ business_id: currentUser.current_business_id });
        let successCount = 0;
        let errorCount = 0;

        for (const product of products) {
            try {
                const effectiveOriginalLaborCost = product.original_labor_cost ?? product.labor_cost ?? 0;
                const effectiveOriginalMaterialCost = product.original_material_cost ?? product.material_cost ?? 0;
                
                const creationDate = product.created_date ? new Date(product.created_date).toISOString().split('T')[0] : null;

                if (!creationDate) {
                  console.warn(`Product ${product.id} has no creation date. Skipping inflation adjustment.`);
                  errorCount++;
                  continue;
                }

                const [laborRes, materialRes] = await Promise.all([
                    effectiveOriginalLaborCost > 0 ? inflationTracker({ action: 'calculate_adjusted_cost', originalCost: effectiveOriginalLaborCost, startDate: creationDate }) : Promise.resolve({ data: { adjustedCost: 0 } }),
                    effectiveOriginalMaterialCost > 0 ? inflationTracker({ action: 'calculate_adjusted_cost', originalCost: effectiveOriginalMaterialCost, startDate: creationDate }) : Promise.resolve({ data: { adjustedCost: 0 } })
                ]);
                
                const newLaborCost = laborRes.data.adjustedCost;
                const newMaterialCost = materialRes.data.adjustedCost;

                const updatePayload = {
                    labor_cost: newLaborCost,
                    material_cost: newMaterialCost,
                    last_inflation_adjustment_date: new Date().toISOString().split('T')[0],
                };

                if (product.original_labor_cost == null) {
                    updatePayload.original_labor_cost = product.labor_cost ?? 0;
                }
                if (product.original_material_cost == null) {
                    updatePayload.original_material_cost = product.material_cost ?? 0;
                }
                
                const laborMarkup = settings.labor_markup || 0;
                const materialsMarkup = settings.materials_markup || 0;
                const hours = product.hours || 0;
                
                const laborComponent = (newLaborCost * (1 + laborMarkup)) * hours;
                const materialComponent = newMaterialCost * (1 + materialsMarkup);
                updatePayload.unit_price = parseFloat((laborComponent + materialComponent).toFixed(2));

                await ProductOrService.update(product.id, updatePayload);
                successCount++;
            } catch(e) {
                console.error(`Failed to update product ${product.id}:`, e);
                errorCount++;
            }
        }

        toast.success(`Inflation adjustment complete. Updated: ${successCount} products. Failed: ${errorCount} products.`);
    } catch (error) {
        console.error('Failed to run inflation adjustment:', error);
        toast.error('An error occurred during the inflation adjustment process.');
    } finally {
        setIsAdjusting(false);
    }
  };

  const handleTemplateSubmit = async (templateData) => {
    try {
      // Check if editing an existing template (has an id) or creating a new one
      if (editingTemplate && editingTemplate.id) {
        await DocumentTemplate.update(editingTemplate.id, templateData);
        toast.success('Template updated successfully!');
      } else {
        // This path is for new templates, including those generated by AI
        await DocumentTemplate.create(templateData);
        toast.success('Template created successfully!');
      }
      setShowDocumentBuilder(false);
      setShowAIAssistant(false); // Close AI assistant if it was open
      setEditingTemplate(null);
      setNewTemplateType(null); // Reset newTemplateType after submission
      loadSettings(); // Reload to get updated templates
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error('Failed to save template.');
    }
  };

  const handleAIGenerate = (aiGeneratedTemplateData) => {
    setShowAIAssistant(false);
    // Set the generated template data to be passed to DocumentBuilder for review/editing.
    // Since it has no ID, DocumentBuilder's onSubmit (handleTemplateSubmit) will treat it as a new creation.
    setEditingTemplate(aiGeneratedTemplateData);
    setShowDocumentBuilder(true);
  };

  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      try {
        await DocumentTemplate.delete(templateId);
        toast.success('Template deleted successfully!');
        loadSettings(); // Reload to remove deleted template
      } catch (error) {
        console.error('Failed to delete template:', error);
        toast.error('Failed to delete template.');
      }
    }
  };

  const handleSetDefaultTemplate = async (templateId, templateType) => {
    try {
      // First, remove default flag from all templates of this type
      const templatesOfType = templates.filter(t => t.type === templateType);
      for (const template of templatesOfType) {
        if (template.default_template) {
          await DocumentTemplate.update(template.id, { default_template: false });
        }
      }
      
      // Then set the selected template as default
      await DocumentTemplate.update(templateId, { default_template: true });
      toast.success('Default template updated successfully!');
      loadSettings(); // Reload to reflect changes
    } catch (error) {
      console.error('Failed to set default template:', error);
      toast.error('Failed to set default template.');
    }
  };

  const generateLogo = async () => {
    if (!settings?.business_name || !businessDescription.trim()) {
      toast.error('Please enter both business name and description');
      return;
    }

    setIsGeneratingLogo(true);
    try {
      // Generate multiple logo variations
      const logoPrompts = [
        `Professional minimalist logo for "${settings.business_name}", a ${businessDescription}. Clean, modern design with simple typography. Corporate style, vector art, white background.`,
        `Modern logo design for "${settings.business_name}" company. ${businessDescription}. Sleek, professional, geometric shapes. Brand identity design, minimalist style.`,
        `Clean business logo for "${settings.business_name}". ${businessDescription}. Simple icon with company name, professional color scheme, modern typography.`
      ];

      const logoPromises = logoPrompts.map(prompt => 
        GenerateImage({ prompt })
      );

      const results = await Promise.all(logoPromises);
      const logoUrls = results.map(result => result.url);
      
      setGeneratedLogos(logoUrls);
      toast.success('Logos generated successfully!');
    } catch (error) {
      console.error('Error generating logo:', error);
      toast.error('Failed to generate logos. Please try again.');
    } finally {
      setIsGeneratingLogo(false);
    }
  };

  const selectLogo = (logoUrl) => {
    setSettings(prev => ({ ...prev, business_logo_url: logoUrl }));
    setShowLogoGenerator(false);
    setGeneratedLogos([]);
    toast.success('Logo selected! Remember to save your settings.');
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading settings...</div>;
  }

  if (!settings) {
    return <div className="p-8 text-center">No business selected or found. Please check your user profile.</div>;
  }
  
  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Business Settings</h1>
          <p className="text-slate-600">Manage your company's information, configurations, and document templates.</p>
        </div>
        <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
          <Save className="w-4 h-4 mr-2"/>
          Save Settings
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
          <TabsTrigger value="subcontractors">Subcontractors</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-8">
          {/* General Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Briefcase /> General Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="business_name">Business Name</Label>
                <Input id="business_name" name="business_name" value={settings.business_name || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="business_address">Business Address</Label>
                <Input id="business_address" name="business_address" value={settings.business_address || ''} onChange={handleInputChange} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="business_state">State (Abbreviation)</Label>
                <Input id="business_state" name="business_state" value={settings.business_state || ''} onChange={handleInputChange} placeholder="e.g., CA" maxLength="2" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_phone">Business Phone</Label>
                <Input id="business_phone" name="business_phone" value={settings.business_phone || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="business_email">Business Email</Label>
                <Input id="business_email" name="business_email" type="email" value={settings.business_email || ''} onChange={handleInputChange} />
              </div>
            </CardContent>
          </Card>

          {/* Company Logo Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Company Logo
                </span>
                <Button 
                  variant="outline" 
                  onClick={() => { setShowLogoGenerator(true); setGeneratedLogos([]); setBusinessDescription(''); }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 hover:from-indigo-600 hover:to-purple-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Logo Generator
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.business_logo_url && (
                <div className="p-4 border rounded-lg bg-slate-50 flex justify-center">
                    <img src={settings.business_logo_url} alt="Business Logo" className="max-h-24 object-contain"/>
                </div>
              )}
              <Button variant="outline" className="w-full" disabled>
                <Upload className="w-4 h-4 mr-2"/>
                Upload Logo
              </Button>
               <p className="text-xs text-slate-500 text-center">Manual upload coming soon. Use AI generator for now.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-8">
          {/* Financial Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><DollarSign /> Financial Defaults</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                <Input 
                  id="tax_rate" 
                  name="tax_rate" 
                  type="number" 
                  step="0.01" 
                  value={((settings.tax_rate || 0) * 100).toFixed(2)} 
                  onChange={e => setSettings(prev => ({...prev, tax_rate: parseFloat(e.target.value) / 100 || 0}))} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="materials_markup">Materials Markup (%)</Label>
                <Input 
                  id="materials_markup" 
                  name="materials_markup" 
                  type="number" 
                  step="0.01" 
                  value={((settings.materials_markup || 0) * 100).toFixed(2)} 
                  onChange={e => setSettings(prev => ({...prev, materials_markup: parseFloat(e.target.value) / 100 || 0}))} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="labor_markup">Labor Markup (%)</Label>
                <Input 
                  id="labor_markup" 
                  name="labor_markup" 
                  type="number" 
                  step="0.01" 
                  value={((settings.labor_markup || 0) * 100).toFixed(2)} 
                  onChange={e => setSettings(prev => ({...prev, labor_markup: parseFloat(e.target.value) / 100 || 0}))} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimum_profit_margin">Minimum Profit Margin (%)</Label>
                <Input 
                  id="minimum_profit_margin" 
                  name="minimum_profit_margin" 
                  type="number" 
                  step="0.01" 
                  value={((settings.minimum_profit_margin || 0) * 100).toFixed(2)} 
                  onChange={e => setSettings(prev => ({...prev, minimum_profit_margin: parseFloat(e.target.value) / 100 || 0}))} 
                />
              </div>
              
              <div className="md:col-span-2 space-y-4">
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <Label htmlFor="minimum_hourly_wage">Minimum Hourly Wage ($)</Label>
                    {settings.business_state && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={
                          // Manually trigger the minimum wage load in case user wants to re-fetch
                          // This button effectively re-runs the useEffect logic
                          () => {
                            const loadMinimumWageData = async () => {
                              setIsLoadingWage(true);
                              try {
                                const response = await getMinimumWage({ state: settings.business_state });
                                
                                if (response.data && response.data.success) {
                                  const fetchedWage = response.data.minimumWage;
                                  setMinimumWage(fetchedWage);
                                  
                                  if (settings.minimum_hourly_wage === 0 || settings.minimum_hourly_wage == null) {
                                    setSettings(prev => ({ ...prev, minimum_hourly_wage: fetchedWage }));
                                  }
                                  
                                  toast.success(`Loaded ${response.data.source}: $${fetchedWage.toFixed(2)}/hour`);
                                } else {
                                  const errorMsg = response.data?.error || 'Failed to load minimum wage data';
                                  console.error('Minimum wage API error:', errorMsg);
                                  toast.error(`Error: ${errorMsg}`);
                                  
                                  if (response.data?.minimumWage) {
                                    setMinimumWage(response.data.minimumWage);
                                  }
                                }
                              } catch (error) {
                                console.error('Failed to load minimum wage:', error);
                                
                                if (error.toString().includes('Rate limit exceeded')) {
                                  toast.error('Too many requests. Please wait a moment before trying again.');
                                } else if (error.toString().includes('500')) {
                                  toast.error('Service temporarily unavailable. Using federal minimum wage as fallback.');
                                  setMinimumWage(7.25);
                                } else {
                                  toast.error('Failed to load minimum wage data. Please try again later.');
                                }
                              } finally {
                                setIsLoadingWage(false);
                              }
                            };
                            loadMinimumWageData();
                          }
                        }
                        disabled={isLoadingWage}
                      >
                        {isLoadingWage ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Update from {settings.business_state}
                      </Button>
                    )}
                  </div>
                  <Input 
                    id="minimum_hourly_wage" 
                    name="minimum_hourly_wage" 
                    type="number" 
                    step="0.01" 
                    value={(settings.minimum_hourly_wage || 0).toFixed(2)} 
                    onChange={e => setSettings(prev => ({...prev, minimum_hourly_wage: parseFloat(e.target.value) || 0}))} 
                  />
                  {minimumWage && (
                    <p className="text-xs text-slate-600 mt-1">
                      <Info className="w-3 h-3 inline mr-1" />
                      Current {settings.business_state} minimum wage: ${minimumWage.toFixed(2)}/hour
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Indirect Cost Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calculator /> Indirect Cost Integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <Switch
                  id="include_indirect_cost_in_estimates"
                  checked={settings.include_indirect_cost_in_estimates || false}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, include_indirect_cost_in_estimates: checked }))}
                />
                <div className="flex-1">
                  <Label htmlFor="include_indirect_cost_in_estimates" className="font-medium">Include Indirect Costs in Profit Margin Calculations</Label>
                  <p className="text-sm text-slate-500">
                    Automatically factor in overhead expenses when calculating minimum profit margins for estimates and change orders.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-700">Current Indirect Cost Rate</p>
                  <p className="text-sm text-slate-500">
                    {indirectRate !== null
                      ? `$${indirectRate.toFixed(2)}/hour`
                      : (settings.last_calculated_indirect_rate != null
                         ? `$${settings.last_calculated_indirect_rate.toFixed(2)}/hour`
                         : 'Not calculated yet')
                    }
                    {(indirectRate !== null || settings.last_calculated_indirect_rate != null) && settings.updated_date && (
                      ` (Last calculated: ${format(new Date(settings.updated_date), 'MMM d, yyyy')})`
                    )}
                  </p>
                </div>
                <Button
                  onClick={calculateIndirectRate}
                  disabled={isCalculatingIndirect}
                  variant="outline"
                >
                  {isCalculatingIndirect ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Calculating...</>
                  ) : (
                    <><Calculator className="w-4 h-4 mr-2" /> Calculate Rate</>
                  )}
                </Button>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>How Indirect Costs Work</AlertTitle>
                <AlertDescription>
                  Indirect costs include office rent, utilities, software subscriptions, and other overhead expenses. 
                  When enabled, these costs are automatically added to your minimum profit margin requirements to ensure all projects remain profitable after accounting for business overhead.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Inflation Adjustment Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lightbulb /> Inflation Adjustment Tool</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Automated Cost Updates</AlertTitle>
                    <AlertDescription>
                        This tool uses historical US CPI data to adjust the material and labor costs of your items from their creation date to today. This helps keep your pricing in line with real-world cost changes.
                    </AlertDescription>
                </Alert>
                <Button onClick={handleInflationAdjustment} disabled={isAdjusting} className="w-full">
                    {isAdjusting ? 
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Adjusting Costs...</> : 
                        <><RefreshCw className="w-4 h-4 mr-2"/> Run Inflation Adjustment on All Products</>
                    }
                </Button>
                <p className="text-xs text-slate-500 text-center">Note: This action is irreversible and will update all products and services in your catalog.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduling" className="space-y-8">
          {/* Work Hours & Scheduling Card */}
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Clock /> Work Hours & Scheduling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Label className="mb-3 block">Operating Days</Label>
                    <div className="flex flex-wrap gap-2">
                        {WEEK_DAYS.map(day => (
                            <div
                                key={day.id}
                                onClick={() => handleDayToggle(day.id)}
                                className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                    (settings.work_days || []).includes(day.id)
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-200 hover:bg-slate-300'
                                }`}
                            >
                                {day.label}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="business_hours_start">Work Start</Label>
                        <Input id="business_hours_start" name="business_hours_start" type="time" value={settings.business_hours_start || '08:00'} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="business_hours_end">Work End</Label>
                        <Input id="business_hours_end" name="business_hours_end" type="time" value={settings.business_hours_end || '17:00'} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lunch_break_start">Lunch Start</Label>
                        <Input id="lunch_break_start" name="lunch_break_start" type="time" value={settings.lunch_break_start || '12:00'} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lunch_break_end">Lunch End</Label>
                        <Input id="lunch_break_end" name="lunch_break_end" type="time" value={settings.lunch_break_end || '13:00'} onChange={handleInputChange} />
                    </div>
                </div>
            </CardContent>
          </Card>
          
          {/* Reminder Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BellRing /> Workday Reminders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <Switch
                  id="enable_workday_reminders"
                  checked={settings.enable_workday_reminders || false}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enable_workday_reminders: checked }))}
                />
                <div>
                  <Label htmlFor="enable_workday_reminders" className="font-medium">Enable ETA Reminders</Label>
                  <p className="text-sm text-slate-500">
                    Automatically send alerts to users to confirm their ETA before their workday starts.
                  </p>
                </div>
              </div>

              {settings.enable_workday_reminders && (
                <div className="space-y-2">
                  <Label htmlFor="reminder_lead_time_minutes">Reminder Time (minutes before workday start)</Label>
                  <Input 
                    id="reminder_lead_time_minutes" 
                    name="reminder_lead_time_minutes" 
                    type="number" 
                    value={settings.reminder_lead_time_minutes || 60} 
                    onChange={handleNumberInputChange} 
                  />
                  <p className="text-xs text-slate-500">
                    e.g., '60' will send a reminder one hour before the official start time.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subcontractors" className="space-y-8">
          {/* Subcontractor Penalty Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="w-5 h-5" />
                Penalty & Accountability Settings
              </CardTitle>
              <CardDescription>
                Configure automatic penalties and holdback amounts for subcontractor assignments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  These settings will be automatically applied to all new subcontractor contracts. Changes will not affect existing signed contracts.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="subcontractor_daily_delay_penalty_rate">Daily Status Update Penalty (%)</Label>
                  <Input 
                    id="subcontractor_daily_delay_penalty_rate" 
                    name="subcontractor_daily_delay_penalty_rate" 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    max="10"
                    value={((settings.subcontractor_daily_delay_penalty_rate || 0.01) * 100).toFixed(2)} 
                    onChange={e => setSettings(prev => ({...prev, subcontractor_daily_delay_penalty_rate: parseFloat(e.target.value) / 100 || 0}))} 
                  />
                  <p className="text-xs text-slate-500">
                    Percentage reduction in payment for each day subcontractor doesn't update work status
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subcontractor_completion_delay_penalty_rate">Completion Delay Penalty (%)</Label>
                  <Input 
                    id="subcontractor_completion_delay_penalty_rate" 
                    name="subcontractor_completion_delay_penalty_rate" 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    max="20"
                    value={((settings.subcontractor_completion_delay_penalty_rate || 0.02) * 100).toFixed(2)} 
                    onChange={e => setSettings(prev => ({...prev, subcontractor_completion_delay_penalty_rate: parseFloat(e.target.value) / 100 || 0}))} 
                  />
                  <p className="text-xs text-slate-500">
                    Percentage reduction for each day past committed completion date
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subcontractor_holdback_percentage">Holdback Amount (%)</Label>
                  <Input 
                    id="subcontractor_holdback_percentage" 
                    name="subcontractor_holdback_percentage" 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    max="50"
                    value={((settings.subcontractor_holdback_percentage || 0.10) * 100).toFixed(2)} 
                    onChange={e => setSettings(prev => ({...prev, subcontractor_holdback_percentage: parseFloat(e.target.value) / 100 || 0}))} 
                  />
                  <p className="text-xs text-slate-500">
                    Percentage of payment held back until work completion is verified
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subcontractor_penalty_grace_days">Grace Period (Days)</Label>
                  <Input 
                    id="subcontractor_penalty_grace_days" 
                    name="subcontractor_penalty_grace_days" 
                    type="number" 
                    min="0" 
                    max="7"
                    value={settings.subcontractor_penalty_grace_days || 1} 
                    onChange={e => setSettings(prev => ({...prev, subcontractor_penalty_grace_days: parseInt(e.target.value) || 1}))} 
                  />
                  <p className="text-xs text-slate-500">
                    Number of grace days before penalties start applying
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-semibold text-slate-700 mb-3">Penalty Calculation Example</h4>
                <div className="text-sm text-slate-600 space-y-2">
                  <p><strong>Contract Amount:</strong> $5,000</p>
                  <p><strong>Daily Status Penalty:</strong> {((settings.subcontractor_daily_delay_penalty_rate || 0.01) * 100).toFixed(1)}% × 3 days = ${(5000 * (settings.subcontractor_daily_delay_penalty_rate || 0.01) * 3).toFixed(0)} reduction</p>
                  <p><strong>Completion Delay:</strong> {((settings.subcontractor_completion_delay_penalty_rate || 0.02) * 100).toFixed(1)}% × 2 days = ${(5000 * (settings.subcontractor_completion_delay_penalty_rate || 0.02) * 2).toFixed(0)} reduction</p>
                  <p><strong>Holdback Amount:</strong> {((settings.subcontractor_holdback_percentage || 0.10) * 100).toFixed(0)}% = ${(5000 * (settings.subcontractor_holdback_percentage || 0.10)).toFixed(0)}</p>
                  <div className="pt-2 border-t border-slate-300">
                    <p><strong>Initial Payment:</strong> ${(5000 - (5000 * (settings.subcontractor_holdback_percentage || 0.10)) - (5000 * (settings.subcontractor_daily_delay_penalty_rate || 0.01) * 3) - (5000 * (settings.subcontractor_completion_delay_penalty_rate || 0.02) * 2)).toFixed(0)}</p>
                    <p><strong>Final Payment:</strong> ${(5000 * (settings.subcontractor_holdback_percentage || 0.10)).toFixed(0)} (after verification)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subcontractor Payment Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payment Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 border rounded-lg">
                  <h5 className="font-semibold text-slate-700 mb-2">Standard Payment Schedule</h5>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>1. Upon contract signing: {(100 - ((settings.subcontractor_holdback_percentage || 0.10) * 100)).toFixed(0)}% of agreed amount</p>
                    <p>2. After work completion verification: Remaining {((settings.subcontractor_holdback_percentage || 0.10) * 100).toFixed(0)}% holdback</p>
                    <p>3. Penalties deducted from final payment calculations</p>
                    <p>4. Net 15 days payment terms after completion verification</p>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h5 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Payroll Integration
                  </h5>
                  <p className="text-sm text-blue-700">
                    Subcontractor payments will appear in the Payroll section when work is marked as completed. 
                    You'll be notified to verify completion and authorize final payment release.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Document Templates
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => { setEditingTemplate(null); setShowAIAssistant(true); setShowTypeSelector(true); }}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 hover:from-indigo-600 hover:to-purple-700"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Assistant
                  </Button>
                  <Button onClick={() => { setEditingTemplate(null); setShowTypeSelector(true); setShowAIAssistant(false); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.length > 0 ? (
                  templates.map(template => (
                    <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{template.name}</h3>
                          <span className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded">
                            {template.type}
                          </span>
                          {template.default_template && (
                            <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                          Last updated: {format(new Date(template.updated_date), 'PPP')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setEditingTemplate(template); setShowDocumentBuilder(true); }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {!template.default_template && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefaultTemplate(template.id, template.type)}
                          >
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 mb-2">No Document Templates</h3>
                    <p className="text-slate-500 mb-6">Create professional templates for your estimates, invoices, and receipts</p>
                    <div className="flex justify-center gap-3">
                      <Button 
                        onClick={() => { setEditingTemplate(null); setShowAIAssistant(true); setShowTypeSelector(true); }}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 hover:from-indigo-600 hover:to-purple-700"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Start with AI Assistant
                      </Button>
                      <Button variant="outline" onClick={() => { setEditingTemplate(null); setShowTypeSelector(true); setShowAIAssistant(false); }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Manually
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Type Selector Modal for Manual Creation */}
      {showTypeSelector && !showAIAssistant && (
        <Dialog open onOpenChange={() => setShowTypeSelector(false)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Select Template Type</DialogTitle>
                    <DialogDescription>
                        Choose the type of document you want to create a template for.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Select onValueChange={setNewTemplateType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a document type..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="invoice">Invoice</SelectItem>
                            <SelectItem value="estimate">Estimate</SelectItem>
                            <SelectItem value="receipt">Receipt</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowTypeSelector(false)}>Cancel</Button>
                    <Button
                        disabled={!newTemplateType}
                        onClick={() => {
                            setShowTypeSelector(false);
                            setShowDocumentBuilder(true);
                        }}
                    >
                        Continue
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}

      {/* AI Assistant Type Selector Modal */}
      {showAIAssistant && showTypeSelector && (
        <Dialog open onOpenChange={() => { setShowTypeSelector(false); setShowAIAssistant(false); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Document Type</DialogTitle>
              <DialogDescription>
                Choose the type of document template you want to create with AI assistance.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Select onValueChange={setNewTemplateType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a document type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="estimate">Estimate</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="receipt">Receipt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowTypeSelector(false); setShowAIAssistant(false); }}>Cancel</Button>
              <Button
                disabled={!newTemplateType}
                onClick={() => {
                  setShowTypeSelector(false); // Close type selector
                  // showAIAssistant remains true, which will render TemplateAIAssistant component
                }}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 hover:from-indigo-600 hover:to-purple-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Continue with AI
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* AI Assistant Main Component */}
      {showAIAssistant && !showTypeSelector && (
        <TemplateAIAssistant
          documentType={newTemplateType}
          onGenerate={handleAIGenerate}
          onCancel={() => { setShowAIAssistant(false); setNewTemplateType(null); }}
        />
      )}

      {/* Document Builder Modal */}
      {showDocumentBuilder && (
        <DocumentBuilder
          template={editingTemplate}
          documentType={editingTemplate ? editingTemplate.type : newTemplateType}
          onSubmit={handleTemplateSubmit}
          onCancel={() => { setShowDocumentBuilder(false); setEditingTemplate(null); setNewTemplateType(null); }}
        />
      )}

      {/* AI Logo Generator Modal */}
      {showLogoGenerator && (
        <Dialog open onOpenChange={() => {setShowLogoGenerator(false); setGeneratedLogos([]); setBusinessDescription('');}}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                AI Logo Generator
              </DialogTitle>
              <DialogDescription>
                Let our AI generate unique logo options for your business.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {generatedLogos.length === 0 ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 mx-auto text-indigo-600 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Create Your Professional Logo</h3>
                    <p className="text-sm text-slate-600">Describe your business and we'll generate professional logo options</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="business_name_display">Business Name</Label>
                      <Input 
                        id="business_name_display" 
                        value={settings?.business_name || ''} 
                        disabled
                        className="bg-slate-100"
                      />
                      <p className="text-xs text-slate-500 mt-1">This will be used in your logo</p>
                    </div>

                    <div>
                      <Label htmlFor="business_description">Business Description</Label>
                      <Textarea
                        id="business_description"
                        placeholder="e.g., Construction company specializing in residential remodeling and commercial build-outs"
                        value={businessDescription}
                        onChange={(e) => setBusinessDescription(e.target.value)}
                        rows={3}
                      />
                      <p className="text-xs text-slate-500 mt-1">Describe what your business does to help generate relevant logo designs</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Choose Your Logo</h3>
                    <p className="text-sm text-slate-600">Click on a logo to select it for your business</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {generatedLogos.map((logoUrl, index) => (
                      <div
                        key={index}
                        className="border-2 border-slate-200 rounded-lg p-4 cursor-pointer hover:border-indigo-500 hover:shadow-lg transition-all duration-200"
                        onClick={() => selectLogo(logoUrl)}
                      >
                        <img 
                          src={logoUrl} 
                          alt={`Logo option ${index + 1}`}
                          className="w-full h-32 object-contain bg-white rounded"
                        />
                        <div className="text-center mt-2">
                          <Button variant="outline" size="sm" className="w-full">
                            Select This Logo
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setGeneratedLogos([]);
                        setBusinessDescription(''); // Reset description for new generation
                      }}
                    >
                      Generate New Options
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => {setShowLogoGenerator(false); setGeneratedLogos([]); setBusinessDescription('');}}>
                Cancel
              </Button>
              
              {generatedLogos.length === 0 && (
                <Button 
                  onClick={generateLogo} 
                  disabled={isGeneratingLogo || !settings?.business_name || !businessDescription.trim()}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 hover:from-indigo-600 hover:to-purple-700"
                >
                  {isGeneratingLogo ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" /> Generate Logos</>
                  )}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Business ID Display for Troubleshooting */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-1">Business Information</h3>
              <p className="text-xs text-slate-500">For technical support and troubleshooting</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-1">Business ID</p>
              <code className="px-2 py-1 bg-slate-200 text-slate-800 rounded text-xs font-mono">
                {currentUser?.current_business_id || 'Not Available'}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
