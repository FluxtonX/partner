
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wand2, Sparkles, FileText, Calculator, Receipt, Loader2 } from 'lucide-react';
import { InvokeLLM } from '@/api/integrations';
import { toast } from 'sonner';

// Mock classes for demonstration purposes. In a real application, these would be imported from an API layer.
class BusinessSettings {
  static async list() {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return [{ business_name: 'Acme Solutions', business_address: '123 Tech Blvd, Suite 100', business_phone: '555-TECH-001', business_email: 'info@acmesolutions.com' }];
  }
}

class Project {
  static async list(sortBy, limit) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return [
      { id: 'proj1', title: 'Website Redesign for Global Corp', updated_date: '2023-10-01' },
      { id: 'proj2', title: 'Mobile App Development for Startup X', updated_date: '2023-09-15' },
      { id: 'proj3', title: 'Cloud Migration Strategy', updated_date: '2023-08-20' },
    ].slice(0, limit);
  }
}

class Client {
  static async list(sortBy, limit) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return [
      { id: 'client1', contact_person: 'Sarah Johnson', company_name: 'Global Corp', updated_date: '2023-10-05' },
      { id: 'client2', contact_person: 'Michael Lee', company_name: 'Startup X', updated_date: '2023-09-28' },
    ].slice(0, limit);
  }
}


const DEFAULT_LAYOUTS = {
  estimate: {
    name: 'Professional Estimate',
    description: 'Clean, professional estimate with company branding and detailed line items',
    layout: {
      components: [
        {
          id: 'header_text',
          type: 'text',
          props: {
            content: 'ESTIMATE',
            fontSize: '28px',
            fontWeight: 'bold'
          },
          styles: { margin: '0 0 20px 0', padding: '0', textAlign: 'center' }
        },
        {
          id: 'business_info',
          type: 'text',
          props: {
            content: '{{business_name}}\n{{business_address}}\n{{business_phone}} | {{business_email}}',
            fontSize: '14px',
            fontWeight: 'normal'
          },
          styles: { margin: '0 0 30px 0', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px' }
        },
        {
          id: 'client_info',
          type: 'text',
          props: {
            content: 'Prepared for:\n{{client_name}}\n{{client_address}}\n{{client_email}}',
            fontSize: '14px',
            fontWeight: 'normal'
          },
          styles: { margin: '0 0 20px 0', padding: '0' }
        },
        {
          id: 'estimate_details',
          type: 'text',
          props: {
            content: 'Estimate #: {{estimate_number}}\nDate: {{issue_date}}\nValid Until: {{expiry_date}}',
            fontSize: '12px',
            fontWeight: 'normal'
          },
          styles: { margin: '0 0 30px 0', padding: '0' }
        },
        {
          id: 'line_items_table',
          type: 'table',
          props: {
            dataSource: 'lineItems',
            columns: [
              { key: 'description', title: 'Description', width: '50%' },
              { key: 'quantity', title: 'Qty', width: '15%' },
              { key: 'unitPrice', title: 'Unit Price', width: '20%' },
              { key: 'total', title: 'Total', width: '15%' }
            ]
          },
          styles: { margin: '20px 0', padding: '0' }
        },
        {
          id: 'total_amount',
          type: 'currency',
          props: {
            field: 'totalAmount',
            label: 'Total Amount',
            format: 'currency'
          },
          styles: { margin: '20px 0', padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px' }
        },
        {
          id: 'terms',
          type: 'text',
          props: {
            content: 'Terms & Conditions:\n• Estimate valid for 30 days\n• 50% deposit required to begin work\n• Final payment due upon completion\n• All work performed according to local building codes',
            fontSize: '12px',
            fontWeight: 'normal'
          },
          styles: { margin: '30px 0 0 0', padding: '15px', backgroundColor: '#fafafa', borderRadius: '8px' }
        }
      ]
    },
    styles: {
      primaryColor: '#059669',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      fontSize: '14px',
      fontFamily: 'Inter, sans-serif'
    }
  },
  invoice: {
    name: 'Professional Invoice',
    description: 'Standard invoice format with payment details and terms',
    layout: {
      components: [
        {
          id: 'header_text',
          type: 'text',
          props: {
            content: 'INVOICE',
            fontSize: '28px',
            fontWeight: 'bold'
          },
          styles: { margin: '0 0 20px 0', padding: '0', textAlign: 'center' }
        },
        {
          id: 'business_info',
          type: 'text',
          props: {
            content: '{{business_name}}\n{{business_address}}\n{{business_phone}} | {{business_email}}',
            fontSize: '14px',
            fontWeight: 'normal'
          },
          styles: { margin: '0 0 30px 0', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px' }
        },
        {
          id: 'bill_to',
          type: 'text',
          props: {
            content: 'Bill To:\n{{client_name}}\n{{client_address}}\n{{client_email}}',
            fontSize: '14px',
            fontWeight: 'normal'
          },
          styles: { margin: '0 0 20px 0', padding: '0' }
        },
        {
          id: 'invoice_details',
          type: 'text',
          props: {
            content: 'Invoice #: {{invoice_number}}\nIssue Date: {{issue_date}}\nDue Date: {{due_date}}\nProject: {{project_name}}',
            fontSize: '12px',
            fontWeight: 'normal'
          },
          styles: { margin: '0 0 30px 0', padding: '0' }
        },
        {
          id: 'line_items_table',
          type: 'table',
          props: {
            dataSource: 'lineItems',
            columns: [
              { key: 'description', title: 'Description', width: '50%' },
              { key: 'quantity', title: 'Qty', width: '15%' },
              { key: 'unitPrice', title: 'Rate', width: '20%' },
              { key: 'total', title: 'Amount', width: '15%' }
            ]
          },
          styles: { margin: '20px 0', padding: '0' }
        },
        {
          id: 'total_amount',
          type: 'currency',
          props: {
            field: 'totalAmount',
            label: 'Amount Due',
            format: 'currency'
          },
          styles: { margin: '20px 0', padding: '15px', backgroundColor: '#fef3c7', borderRadius: '8px' }
        },
        {
          id: 'payment_terms',
          type: 'text',
          props: {
            content: 'Payment Terms:\n• Payment due within 30 days of invoice date\n• Late payments subject to 1.5% monthly service charge\n• Please include invoice number with payment\n\nThank you for your business!',
            fontSize: '12px',
            fontWeight: 'normal'
          },
          styles: { margin: '30px 0 0 0', padding: '15px', backgroundColor: '#fafafa', borderRadius: '8px' }
        }
      ]
    },
    styles: {
      primaryColor: '#d97706',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      fontSize: '14px',
      fontFamily: 'Inter, sans-serif'
    }
  },
  receipt: {
    name: 'Payment Receipt',
    description: 'Simple receipt format for payment confirmation',
    layout: {
      components: [
        {
          id: 'header_text',
          type: 'text',
          props: {
            content: 'PAYMENT RECEIPT',
            fontSize: '24px',
            fontWeight: 'bold'
          },
          styles: { margin: '0 0 20px 0', padding: '0', textAlign: 'center' }
        },
        {
          id: 'business_info',
          type: 'text',
          props: {
            content: '{{business_name}}\n{{business_address}}\n{{business_phone}}',
            fontSize: '14px',
            fontWeight: 'normal'
          },
          styles: { margin: '0 0 30px 0', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px' }
        },
        {
          id: 'receipt_details',
          type: 'text',
          props: {
            content: 'Receipt #: {{receipt_number}}\nPayment Date: {{payment_date}}\nPayment Method: {{payment_method}}\nFor Invoice #: {{invoice_number}}',
            fontSize: '12px',
            fontWeight: 'normal'
          },
          styles: { margin: '0 0 20px 0', padding: '0' }
        },
        {
          id: 'payment_amount',
          type: 'currency',
          props: {
            field: 'paymentAmount',
            label: 'Amount Received',
            format: 'currency'
          },
          styles: { margin: '20px 0', padding: '15px', backgroundColor: '#dcfce7', borderRadius: '8px' }
        },
        {
          id: 'thank_you',
          type: 'text',
          props: {
            content: 'Thank you for your payment!\n\nThis receipt serves as proof of payment for the services rendered.\nPlease retain this receipt for your records.',
            fontSize: '12px',
            fontWeight: 'normal'
          },
          styles: { margin: '30px 0 0 0', padding: '15px', backgroundColor: '#fafafa', borderRadius: '8px' }
        }
      ]
    },
    styles: {
      primaryColor: '#16a34a',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      fontSize: '14px',
      fontFamily: 'Inter, sans-serif'
    }
  }
};

export default function TemplateAIAssistant({ documentType, onGenerate, onCancel }) {
  const [step, setStep] = useState('selection'); // 'selection', 'customization', 'generating'
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [customization, setCustomization] = useState({
    businessType: '',
    specialRequirements: '',
    branding: 'professional',
    includeLogo: true,
    includeTerms: true
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [businessData, setBusinessData] = useState(null);

  // Load business context for AI prompts
  useEffect(() => {
    const loadBusinessContext = async () => {
      try {
        // Ensure BusinessSettings, Project, Client are available (e.g., imported or globally defined)
        const [businessSettings, recentProjects, recentClients] = await Promise.all([
          BusinessSettings.list(),
          Project.list('-updated_date', 3), // Fetch 3 recent projects
          Client.list('-updated_date', 2)   // Fetch 2 recent clients
        ]);

        setBusinessData({
          business: businessSettings[0] || {},
          recentProjects: recentProjects,
          recentClients: recentClients
        });
      } catch (error) {
        console.error('Error loading business context:', error);
        toast.error('Failed to load business context for AI. Generating with limited context.');
        setBusinessData({ business: {}, recentProjects: [], recentClients: [] }); // Set empty data to proceed
      }
    };
    loadBusinessContext();
  }, []);

  const handleLayoutSelect = (layoutKey) => {
    setSelectedLayout(layoutKey);
    setStep('customization');
  };

  const handleUseDefault = () => {
    const layout = DEFAULT_LAYOUTS[selectedLayout];
    onGenerate({
      name: layout.name,
      type: documentType,
      layout: layout.layout,
      styles: layout.styles
    });
  };

  const handleCustomGenerate = async () => {
    setIsGenerating(true);
    setStep('generating');

    try {
      const baseLayout = DEFAULT_LAYOUTS[selectedLayout];
      
      // Enhanced prompt with business context
      const businessContext = businessData ? `
Current Business Context:
- Business Name: ${businessData.business.business_name || 'Your Business'}
- Business Address: ${businessData.business.business_address || 'Your Business Address'}
- Business Phone: ${businessData.business.business_phone || 'Your Business Phone'}
- Business Email: ${businessData.business.business_email || 'Your Business Email'}
- User provided Business Type: ${customization.businessType || 'General Business'}
- Recent Projects: ${businessData.recentProjects?.map(p => p.title).join(', ') || 'No recent projects available'}
- Typical Clients: ${businessData.recentClients?.map(c => c.contact_person || c.company_name).join(', ') || 'No recent clients available'}
` : '';

      const dataVariablesInfo = `
Available Data Variables for Templates (use in double curly braces, e.g., {{variable_name}}):
- Business Info: {{business_name}}, {{business_address}}, {{business_phone}}, {{business_email}}
- Client Info: {{client_name}}, {{client_address}}, {{client_email}}
- Document Details: {{${documentType}_number}}, {{issue_date}}, {{due_date}}, {{expiry_date}}, {{project_name}}, {{receipt_number}}, {{payment_date}}, {{payment_method}}
- Financial Data: {{totalAmount}} (for total amount), {{lineItems}} (for table data, e.g., descriptions, quantities, unit prices, totals)
`;

      const prompt = `Create a professional ${documentType} template layout with the following requirements:

${businessContext}
      
User Customization:
Business Type: ${customization.businessType || 'N/A'}
Branding Style: ${customization.branding}
Special Requirements: ${customization.specialRequirements || 'None specified.'}
Include Logo: ${customization.includeLogo ? 'Yes' : 'No'}
Include Terms: ${customization.includeTerms ? 'Yes' : 'No'}

${dataVariablesInfo}

Based on these requirements, customize the template layout to be more specific, professional, and aligned with the provided business context. 
Focus on improving the content, styling, and component arrangement while maintaining the core structure.

IMPORTANT: When creating text components that should display dynamic data, use the actual variable names in double curly braces (like {{business_name}}). For terms and conditions, ensure they are relevant to the business type if possible.

Return a JSON object with the following structure:
{
  "name": "Template Name reflecting the business type and style (e.g., 'Modern Construction Invoice')",
  "improvements": ["List of specific improvements made (e.g., 'Updated header text for construction business', 'Refined color scheme for modern look')"],
  "content_suggestions": {
    "header_text": "Suggested header text, using variables if appropriate (e.g., 'Invoice from {{business_name}}')",
    "terms_content": "Suggested terms and conditions content, specific to ${customization.businessType || 'general business'} if applicable (e.g., 'For construction services: Payment due upon completion of phase...')",
    "styling_notes": "Color scheme and styling recommendations for the ${customization.branding} style, considering ${customization.businessType || 'general business'}."
  }
}`;

      const response = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            improvements: { type: "array", items: { type: "string" } },
            content_suggestions: {
              type: "object",
              properties: {
                header_text: { type: "string" },
                terms_content: { type: "string" },
                styling_notes: { type: "string" }
              }
            }
          },
          required: ["name", "improvements", "content_suggestions"]
        }
      });

      // Apply AI suggestions to the base layout
      const enhancedLayout = { ...baseLayout };
      enhancedLayout.name = response.name;
      
      // Update specific components based on AI suggestions
      if (response.content_suggestions.header_text) {
        const headerComponent = enhancedLayout.layout.components.find(c => c.id === 'header_text');
        if (headerComponent) {
          headerComponent.props.content = response.content_suggestions.header_text;
        }
      }

      if (customization.includeTerms) { // Only update terms if the user chose to include them
        const termsComponent = enhancedLayout.layout.components.find(c => c.id === 'terms' || c.id === 'payment_terms');
        if (termsComponent) {
          if (response.content_suggestions.terms_content) {
            termsComponent.props.content = response.content_suggestions.terms_content;
          }
        } else if (response.content_suggestions.terms_content) {
          // If terms component doesn't exist but user wants terms and AI suggests them,
          // ideally, we'd add a new component. For this scope, we'll ensure it exists.
          // This part assumes DEFAULT_LAYOUTS generally have a terms component to modify.
          console.warn("Terms component not found but AI suggested terms content. Defaulting to original terms or adding a new component is outside current scope.");
        }
      } else {
        // If user does not want terms, remove them or ensure they are empty
        enhancedLayout.layout.components = enhancedLayout.layout.components.filter(c => c.id !== 'terms' && c.id !== 'payment_terms');
      }
      
      // Apply branding style with business context
      if (customization.branding === 'modern') {
        enhancedLayout.styles.primaryColor = '#3b82f6'; // Blue
        enhancedLayout.styles.fontFamily = 'Helvetica, Arial, sans-serif';
      } else if (customization.branding === 'elegant') {
        enhancedLayout.styles.primaryColor = '#7c3aed'; // Purple
        enhancedLayout.styles.fontFamily = 'Georgia, serif';
      } else if (customization.branding === 'minimal') {
        enhancedLayout.styles.primaryColor = '#6b7280'; // Gray
        enhancedLayout.styles.fontFamily = 'Inter, sans-serif'; // Default to a clean sans-serif
      }
      // 'professional' branding uses default primaryColor from DEFAULT_LAYOUTS[selectedLayout]

      // Add business-specific primary color adjustments if customization.businessType is provided
      const lowerCaseBusinessType = customization.businessType.toLowerCase();
      if (lowerCaseBusinessType.includes('construction') || lowerCaseBusinessType.includes('contractor')) {
        enhancedLayout.styles.primaryColor = '#f59e0b'; // Amber
      } else if (lowerCaseBusinessType.includes('consulting') || lowerCaseBusinessType.includes('tech') || lowerCaseBusinessType.includes('software')) {
        enhancedLayout.styles.primaryColor = '#3b82f6'; // Blue
      } else if (lowerCaseBusinessType.includes('design') || lowerCaseBusinessType.includes('creative')) {
        enhancedLayout.styles.primaryColor = '#ec4899'; // Pink
      } else if (lowerCaseBusinessType.includes('legal') || lowerCaseBusinessType.includes('finance')) {
        enhancedLayout.styles.primaryColor = '#10b981'; // Green
      }


      onGenerate({
        name: enhancedLayout.name,
        type: documentType,
        layout: enhancedLayout.layout,
        styles: enhancedLayout.styles
      });

      toast.success(`AI-enhanced ${customization.businessType || ''} template generated successfully!`);

    } catch (error) {
      console.error('AI generation failed:', error);
      toast.error('Failed to generate custom template. Using default layout.');
      handleUseDefault();
    } finally {
      setIsGenerating(false);
    }
  };

  const layoutOptions = DEFAULT_LAYOUTS[documentType] ? [documentType] : Object.keys(DEFAULT_LAYOUTS);

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'estimate': return Calculator;
      case 'invoice': return FileText;
      case 'receipt': return Receipt;
      default: return FileText;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            AI Template Assistant - {documentType?.charAt(0).toUpperCase() + documentType?.slice(1)}
          </DialogTitle>
        </DialogHeader>

        {step === 'selection' && (
          <div className="space-y-6">
            <div className="text-center">
              <Sparkles className="w-12 h-12 mx-auto text-indigo-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Choose a Starting Layout</h3>
              <p className="text-sm text-slate-600">Select a professionally designed template that fits your needs</p>
            </div>

            <div className="grid gap-4">
              {layoutOptions.map((layoutKey) => {
                const layout = DEFAULT_LAYOUTS[layoutKey];
                const IconComponent = getDocumentIcon(layoutKey);
                
                return (
                  <Card 
                    key={layoutKey}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedLayout === layoutKey ? 'ring-2 ring-indigo-500 bg-indigo-50' : ''
                    }`}
                    onClick={() => handleLayoutSelect(layoutKey)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{layout.name}</CardTitle>
                            <p className="text-sm text-slate-600">{layout.description}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{layoutKey.charAt(0).toUpperCase() + layoutKey.slice(1)}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-xs text-slate-500">
                        Includes: Company info, client details, line items, totals, and terms
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {step === 'customization' && selectedLayout && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Customize Your Template</h3>
              <p className="text-sm text-slate-600">Help AI tailor the template to your business needs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="businessType">Type of Business</Label>
                  <Input
                    id="businessType"
                    placeholder="e.g., Construction, Consulting, Design"
                    value={customization.businessType}
                    onChange={(e) => setCustomization(prev => ({ ...prev, businessType: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="branding">Branding Style</Label>
                  <Select value={customization.branding} onValueChange={(value) => setCustomization(prev => ({ ...prev, branding: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="elegant">Elegant</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="specialRequirements">Special Requirements</Label>
                  <Textarea
                    id="specialRequirements"
                    placeholder="Any specific needs, industry requirements, or preferences..."
                    value={customization.specialRequirements}
                    onChange={(e) => setCustomization(prev => ({ ...prev, specialRequirements: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeLogo"
                      checked={customization.includeLogo}
                      onChange={(e) => setCustomization(prev => ({ ...prev, includeLogo: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="includeLogo" className="text-sm">Include logo space</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeTerms"
                      checked={customization.includeTerms}
                      onChange={(e) => setCustomization(prev => ({ ...prev, includeTerms: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="includeTerms" className="text-sm">Include terms & conditions</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'generating' && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-indigo-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Generating Your Template</h3>
            <p className="text-sm text-slate-600">AI is customizing the layout based on your requirements...</p>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isGenerating}>
            Cancel
          </Button>
          
          {step === 'customization' && (
            <>
              <Button variant="outline" onClick={handleUseDefault} disabled={!selectedLayout}>
                Use Default Layout
              </Button>
              <Button onClick={handleCustomGenerate} disabled={!selectedLayout || isGenerating}>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate with AI
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
