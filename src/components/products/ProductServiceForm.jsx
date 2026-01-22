
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox"; // New import for stacking logic
import { Alert, AlertDescription } from "@/components/ui/alert"; // New import for Pallet unit
import { Save, X, Package, Clock, Wrench, Boxes, Barcode, MapPin, Loader2, Upload, Trash2, ImagePlus, Link as LinkIcon, Plus, Truck, Ruler, Weight, DollarSign, ExternalLink } from "lucide-react"; // Added Ruler, Weight, DollarSign, ExternalLink icons
import { BusinessSettings, User } from '@/api/entities';
import { UploadFile, InvokeLLM } from '@/api/integrations'; // Added InvokeLLM
import { verifyUrl } from "@/api/functions"; // New import for URL verification
import BarcodeDisplay from './BarcodeDisplay';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Constants for categories and actions, extracted from original SelectItems
const productCategories = [
  { value: "appliances", label: "Appliances" },
  { value: "cabinetry", label: "Cabinetry" },
  { value: "carpentry", label: "Carpentry" },
  { value: "cleaning", label: "Cleaning" },
  { value: "concrete", label: "Concrete" },
  { value: "countertop", label: "Countertop" },
  { value: "decking", label: "Decking" },
  { value: "demolition", label: "Demolition" },
  { value: "drywall", label: "Drywall" },
  { value: "electrical", label: "Electrical" },
  { value: "excavation", label: "Excavation" },
  { value: "fencing", label: "Fencing" },
  { value: "flooring", label: "Flooring" },
  { value: "foundation", label: "Foundation" },
  { value: "framing", label: "Framing" },
  { value: "furnishings", label: "Furnishings" },
  { value: "gutters", label: "Gutters" },
  { value: "handyman", label: "Handyman" },
  { value: "hvac", label: "HVAC (Heating, Ventilation, Air Conditioning)" },
  { value: "insulation", label: "Insulation" },
  { value: "landscaping", label: "Landscaping" },
  { value: "lighting_installation", label: "Lighting Installation" },
  { value: "masonry", label: "Masonry" },
  { value: "painting", label: "Painting" },
  { value: "paving", label: "Paving" },
  { value: "plans_permits", label: "Plans & Permits" },
  { value: "plumbing", label: "Plumbing" },
  { value: "project", label: "Project" },
  { value: "repair", label: "Repair" },
  { value: "roofing", label: "Roofing" },
  { value: "siding", label: "Siding" },
  { value: "tile", label: "Tile" },
  { value: "trim_molding", label: "Trim & Molding" },
  { value: "ventilation", label: "Ventilation" },
  { value: "waterproofing", label: "Waterproofing" },
  { value: "windows_doors", label: "Windows & Doors" },
];

const actions = [
  { value: "allocate", label: "Allocate" },
  { value: "purchase", label: "Purchase" },
  { value: "remove", label: "Remove" },
  { value: "install", label: "Install" },
  { value: "repair", label: "Repair" },
  { value: "design", label: "Design" },
  { value: "consult", label: "Consult" },
  { value: "pickup", label: "Pickup" },
  { value: "deliver", label: "Deliver" },
  { value: "manufacture", label: "Manufacture" },
  { value: "build", label: "Build" },
  { value: "troubleshoot", label: "Troubleshoot" },
];

export default function ProductServiceForm({ item, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(() => {
    const defaultLogistics = {
      delivery_required: false,
      pickup_required: false,
      lead_time_days: 0,
      delivery_window_start: '08:00',
      delivery_window_end: '17:00',
      special_handling: '',
      weight: 0,
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
        unit: 'inches'
      },
      required_vehicle_type: 'car',
      requires_appointment: false,
      stackable: false // ADDED: Stacking Logic - default
    };

    const initialState = item ? { ...item } : {
      name: '',
      description: '',
      image_urls: [],
      type: 'labor',
      labor_cost: '',
      material_cost: '',
      unit_price: '',
      hours: '',
      waste_percentage: '',
      unit: '',
      category: 'project',
      action: '',
      is_special_order: false,
      variations: [],
      required_labor_type_name: '',
      skill_level: 'intermediate',
      inventory_tracked: false,
      current_stock: '',
      minimum_stock: '',
      supplier: '',
      supplier_part_number: '',
      supplier_address: '',
      supplier_city: '',
      supplier_state: '',
      supplier_zip: '',
      supplier_location: null,
      original_labor_cost: null,
      original_material_cost: null,
    };

    if (item) {
      if (item.cost_price != null && item.labor_cost == null && item.material_cost == null) {
        if (item.type === 'labor') {
          initialState.labor_cost = String(item.cost_price || '');
          initialState.material_cost = '';
        } else {
          initialState.material_cost = String(item.cost_price || '');
          initialState.labor_cost = '';
        }
      } else {
        initialState.labor_cost = String(item.labor_cost || '');
        initialState.material_cost = String(item.material_cost || '');
      }

      initialState.hours = String(item.hours || '');
      initialState.waste_percentage = item.waste_percentage != null ? String(item.waste_percentage) : '';
      initialState.current_stock = String(item.current_stock || '');
      initialState.minimum_stock = String(item.minimum_stock || '');
      initialState.original_labor_cost = item.original_labor_cost != null ? String(item.original_labor_cost) : null;
      initialState.original_material_cost = item.original_material_cost != null ? String(item.original_material_cost) : null;

      initialState.variations = item.variations ? item.variations.map(v => ({
        ...v,
        cost_adjustment: v.cost_adjustment != null ? v.cost_adjustment : 0,
        price_adjustment: v.price_adjustment != null ? v.price_adjustment : 0,
      })) : [];

    } else {
      initialState.original_labor_cost = null;
      initialState.original_material_cost = null;
    }

    // Initialize or merge logistics
    initialState.logistics = { ...defaultLogistics, ...(item?.logistics || {}) };

    return initialState;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [businessSettings, setBusinessSettings] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isFetchingPricing, setIsFetchingPricing] = useState(false); // New state for pricing fetch
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('general'); // State to control active tab

  useEffect(() => {
    loadBusinessSettings();
  }, []);

  const loadBusinessSettings = async () => {
    try {
      const user = await User.me();
      const settings = await BusinessSettings.filter({ business_id: user.current_business_id });
      if (settings.length > 0) {
        setBusinessSettings(settings[0]);
      } else {
        setBusinessSettings({ labor_markup: 0, materials_markup: 0 });
      }
    } catch (error) {
      console.error('Error loading business settings:', error);
    }
  };

  // Auto-calculate selling price based on costs, hours, and markups (waste is handled in estimates)
  useEffect(() => {
    if (!businessSettings) return;

    const laborCost = parseFloat(formData.labor_cost) || 0;
    const materialCost = parseFloat(formData.material_cost) || 0;
    const hours = parseFloat(formData.hours) || 0;

    // If all cost-related values are 0, clear the price
    if (laborCost === 0 && materialCost === 0 && hours === 0) {
      if (formData.unit_price !== '') {
        setFormData((p) => ({ ...p, unit_price: '' }));
      }
      return;
    }

    // Ensure markup values exist, default to 0 if undefined/null
    const laborMarkup = businessSettings.labor_markup != null ? businessSettings.labor_markup : 0;
    const materialsMarkup = businessSettings.materials_markup != null ? businessSettings.materials_markup : 0;

    // Calculate using the new formula: waste is no longer included in the base unit price
    // Price = ((Labor Cost * (1 + Labor Markup)) * Hours) + (Material Cost * (1 + Materials Markup))
    const laborComponent = (laborCost * (1 + laborMarkup)) * hours;
    const materialComponent = materialCost * (1 + materialsMarkup);

    const finalPrice = laborComponent + materialComponent;
    const formattedPrice = finalPrice.toFixed(2);

    if (formData.unit_price !== formattedPrice) {
      setFormData((p) => ({ ...p, unit_price: formattedPrice }));
    }
  }, [formData.labor_cost, formData.material_cost, formData.hours, businessSettings, formData.unit_price]);

  const handleImageUpload = async (e, variationIndex = null) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      if (variationIndex !== null) {
        const newVariations = [...formData.variations];
        newVariations[variationIndex].image_url = file_url;
        setFormData((p) => ({ ...p, variations: newVariations }));
      } else {
        setFormData((p) => ({ ...p, image_urls: [...(p.image_urls || []), file_url] }));
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGetLocalPricing = async () => {
    if (!businessSettings) {
      toast.error("Business settings not loaded. Cannot fetch pricing.");
      return;
    }
    if (!formData.name) {
      toast.error("Please enter a name for the item before fetching pricing.");
      return;
    }

    setIsFetchingPricing(true);

    try {
      const businessLocation = `${businessSettings.business_address || ''}, ${businessSettings.business_state || ''}`.trim();
      const currency = businessSettings.currency || 'USD';

      toast.info(`Fetching current ${currency} pricing for ${formData.name}...`);

      const pricingData = await InvokeLLM({
        prompt: `Get current market pricing for this construction material/product in ${businessLocation} area in ${currency} currency:

Product: ${formData.name}
Description: ${formData.description || 'No description provided'}
Unit: ${formData.unit || 'Each'}
Category: ${formData.category}

Please provide:
1. The current cost per unit that a contractor would pay (wholesale/trade price, not retail)
2. The best 2-3 suppliers or vendors for this item (include specific store names, websites, or local suppliers)
3. A direct purchasing link if available (Home Depot, Lowe's, supplier websites, etc.)
4. Any notes about pricing variations, bulk discounts, or seasonal considerations

Focus on realistic, current trade/contractor pricing. Prioritize providing valid, active, and direct purchasing URLs.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            item_name: { type: "string" },
            current_cost_per_unit: { 
              type: "number",
              description: "Current cost per unit for contractors/trade customers"
            },
            currency: { type: "string" },
            suppliers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  price_per_unit: { type: "number" },
                  website: { type: "string" },
                  notes: { type: "string" }
                }
              }
            },
            best_purchasing_link: { 
              type: "string",
              description: "Direct link to purchase this item online"
            },
            pricing_notes: { type: "string" },
            last_updated: { type: "string" }
          },
          required: ["item_name", "current_cost_per_cost_per_unit", "currency"]
        }
      });

      if (pricingData?.current_cost_per_unit) {
        let verifiedLink = null;
        let verifiedSupplier = null;

        toast.info("Verifying supplier links...");

        // Verify the best purchasing link first
        if (pricingData.best_purchasing_link) {
          const { data: verificationResult } = await verifyUrl({ url: pricingData.best_purchasing_link });
          if (verificationResult?.active) {
            verifiedLink = verificationResult.url; // Use the final URL after redirects
          }
        }

        // Verify supplier websites if no direct link was found or verified
        if (!verifiedLink && Array.isArray(pricingData.suppliers)) {
          for (const supplier of pricingData.suppliers) {
            if (supplier.website) {
              const { data: verificationResult } = await verifyUrl({ url: supplier.website });
              if (verificationResult?.active) {
                verifiedSupplier = supplier;
                verifiedLink = verificationResult.url;
                break; // Stop after finding the first active one
              }
            }
          }
        }
        
        setFormData(prev => {
          const newFormData = { ...prev };
          newFormData.material_cost = String(pricingData.current_cost_per_unit);
          newFormData.supplier = verifiedSupplier?.name || pricingData.suppliers?.[0]?.name || prev.supplier || 'Local Supplier';
          newFormData.description = `${prev.description || ''}\n\nPricing updated ${new Date().toLocaleDateString()}: ${pricingData.pricing_notes || 'Current market rate'}`.trim();
          
          if (verifiedLink) {
            newFormData.supplier_part_number = verifiedLink;
            toast.success(`Updated material cost and verified supplier link for "${formData.name}"`);
          } else {
            toast.warning(`Updated material cost for "${formData.name}". Could not verify an active purchasing link.`);
            newFormData.supplier_part_number = pricingData.best_purchasing_link || prev.supplier_part_number || ''; // Fallback to original or unverified link
          }
          
          return newFormData;
        });

      } else {
        toast.error('Failed to get pricing data. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching local pricing:', error);
      toast.error('Failed to fetch pricing. Please try again.');
    } finally {
      setIsFetchingPricing(false);
    }
  };

  const removeImage = (index, variationIndex = null) => {
    if (variationIndex !== null) {
      const newVariations = [...formData.variations];
      newVariations[variationIndex].image_url = '';
      setFormData((p) => ({ ...p, variations: newVariations }));
    } else {
      setFormData((p) => ({ ...p, image_urls: p.image_urls.filter((_, i) => i !== index) }));
    }
  };

  const addVariation = () => {
    if ((formData.variations || []).length >= 15) {
      toast.error("You can add a maximum of 15 variations.");
      return;
    }
    const newVariations = [...(formData.variations || []), { name: '', price_adjustment: 0, cost_adjustment: 0, supplier_link: '', image_url: '' }];
    setFormData((p) => ({ ...p, variations: newVariations }));
  };

  const updateVariation = (index, field, value) => {
    const newVariations = [...formData.variations];
    newVariations[index][field] = value;
    setFormData((p) => ({ ...p, variations: newVariations }));
  };

  const removeVariation = (index) => {
    const newVariations = formData.variations.filter((_, i) => i !== index);
    setFormData((p) => ({ ...p, variations: newVariations }));
  };

  const handlePercentageBlur = (e) => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      setFormData(p => ({ ...p, [name]: numericValue.toFixed(2) }));
    } else {
      setFormData(p => ({ ...p, [name]: '0.00' }));
    }
  };

  const handleLogisticsChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      logistics: {
        ...prev.logistics,
        [field]: value
      }
    }));
  };

  const handleDimensionChange = (dimension, value) => {
    setFormData(prev => ({
      ...prev,
      logistics: {
        ...prev.logistics.dimensions,
        [dimension]: parseFloat(value) || 0
      }
    }));
  };

  // Handle unit change with automatic pallet dimension setting
  const handleUnitChange = (newUnit) => {
    let updatedFormData = { ...formData, unit: newUnit };
    
    // If changing to Pallet, set standard pallet dimensions (48" x 40")
    if (newUnit === 'Pallet') {
      updatedFormData = {
        ...updatedFormData,
        logistics: {
          ...updatedFormData.logistics,
          dimensions: {
            ...updatedFormData.logistics.dimensions,
            length: 48, // Standard pallet length
            width: 40,  // Standard pallet width
            unit: 'inches'
            // Height remains unchanged for manual input
          }
        }
      };
    }
    
    setFormData(updatedFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitData = {
      ...formData,
      unit_price: parseFloat(formData.unit_price) || 0,
      labor_cost: parseFloat(formData.labor_cost) || 0,
      material_cost: parseFloat(formData.material_cost) || 0,
      hours: parseFloat(formData.hours) || 0,
      waste_percentage: parseFloat(formData.waste_percentage) ? parseFloat(formData.waste_percentage) / 100 : 0,
      current_stock: formData.current_stock ? parseFloat(formData.current_stock) : undefined,
      minimum_stock: formData.minimum_stock ? parseFloat(formData.minimum_stock) : undefined,
      variations: formData.is_special_order ? (formData.variations || []).map((v) => ({
        ...v,
        price_adjustment: parseFloat(v.price_adjustment) || 0,
        cost_adjustment: parseFloat(v.cost_adjustment) || 0,
      })) : [],
      image_urls: formData.image_urls || [],
      logistics: {
        delivery_required: formData.logistics.delivery_required,
        pickup_required: formData.logistics.pickup_required,
        lead_time_days: parseFloat(formData.logistics.lead_time_days) || 0,
        delivery_window_start: formData.logistics.delivery_window_start,
        delivery_window_end: formData.logistics.delivery_window_end,
        special_handling: formData.logistics.special_handling,
        weight: parseFloat(formData.logistics.weight) || 0,
        dimensions: {
          length: parseFloat(formData.logistics.dimensions.length) || 0,
          width: parseFloat(formData.logistics.dimensions.width) || 0,
          height: parseFloat(formData.logistics.dimensions.height) || 0,
          unit: formData.logistics.dimensions.unit,
        },
        required_vehicle_type: formData.logistics.required_vehicle_type,
        requires_appointment: formData.logistics.requires_appointment,
        stackable: formData.logistics.stackable, // ADDED: Stacking Logic - submit
      },
    };

    // For new items, set the original costs from the initial entry
    if (!item) {
      submitData.original_labor_cost = submitData.labor_cost;
      submitData.original_material_cost = submitData.material_cost;
    }

    await onSubmit(submitData);
    setIsSubmitting(false);
  };

  const typeInfo = {
    labor: {
      icon: <Clock className="w-4 h-4" />,
      label: "Labor/Service",
      description: "Time-based services requiring skill and labor hours",
    },
    inventory_materials: {
      icon: <Package className="w-4 h-4" />,
      label: "Inventory Materials",
      description: "Tracked materials with stock levels",
    },
    job_supplies: {
      icon: <Wrench className="w-4 h-4" />,
      label: "Consumable Supplies",
      description: "Consumable supplies used on jobs",
    },
    non_inventory_materials: {
      icon: <Boxes className="w-4 h-4" />,
      label: "Non-Inventory Materials",
      description: "Materials not tracked in inventory",
    },
  };

  const getDefaultUnit = (type) => {
    switch (type) {
      case 'labor': return 'Hour';
      case 'inventory_materials': return 'Each';
      case 'job_supplies': return 'Each';
      case 'non_inventory_materials': return 'Each';
      default: return 'Each';
    }
  };

  const handleTypeChange = (newType) => {
    setFormData((prev) => ({
      ...prev,
      type: newType,
      unit: prev.unit || getDefaultUnit(newType),
    }));
  };

  const handleLaborTypeSelect = (typeName) => {
    if (!businessSettings || !businessSettings.labor_types) return;

    const selectedTier = businessSettings.labor_types.find((t) => t.name === typeName);

    setFormData((prev) => ({
      ...prev,
      required_labor_type_name: typeName,
      labor_cost: selectedTier ? String(selectedTier.rate) : prev.labor_cost,
    }));
  };

  const handleGeocodeSupplier = async () => {
    if (!formData.supplier_address) return;

    setIsGeocoding(true);
    try {
      const fullAddress = `${formData.supplier_address}, ${formData.supplier_city ? formData.supplier_city + ', ' : ''}${formData.supplier_state ? formData.supplier_state + ' ' : ''}${formData.supplier_zip || ''}`;
      const geocodedResult = await BusinessSettings.geocodeAddress(fullAddress);

      if (geocodedResult && geocodedResult.latitude && geocodedResult.longitude) {
        setFormData((p) => ({
          ...p,
          supplier_location: {
            latitude: geocodedResult.latitude,
            longitude: geocodedResult.longitude,
          },
          supplier_address: geocodedResult.address || p.supplier_address,
          supplier_city: geocodedResult.city || p.supplier_city,
          supplier_state: geocodedResult.state || p.supplier_state,
          supplier_zip: geocodedResult.zip || p.supplier_zip,
        }));
        toast.success("Supplier address geocoded successfully!");
      } else {
        console.warn('Geocoding failed for supplier address or no coordinates found.');
        setFormData((p) => ({ ...p, supplier_location: null }));
        toast.error("Could not geocode address. Please check the address.");
      }
    } catch (error) {
      console.error('Error geocoding supplier address:', error);
      setFormData((p) => ({ ...p, supplier_location: null }));
      toast.error("Error geocoding address.");
    } finally {
      setIsGeocoding(false);
    }
  };

  const typeIconForTitle = typeInfo[formData.type]?.icon;

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {typeIconForTitle}
            {item ? 'Edit' : 'Add'} Product or Service
          </DialogTitle>
          {item?.barcode && (
            <div className="mt-4">
              <BarcodeDisplay barcode={item.barcode} size="medium" />
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-2">
          <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">Basic Info</TabsTrigger>
              <TabsTrigger value="pricing">Pricing & Labor</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="logistics">Logistics</TabsTrigger>
              <TabsTrigger value="variations">Variations</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab (renamed to General) */}
            <TabsContent value="general" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Images</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {(formData.image_urls || []).map((url, index) => (
                    <div key={index} className="relative group">
                      <img src={url} alt={`Product image ${index + 1}`} className="w-full h-24 object-cover rounded-md border" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-24 flex flex-col items-center justify-oncel text-slate-500"
                    onClick={() => fileInputRef.current.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
                    <span className="text-xs mt-1">Add Image</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="type">Type *</Label>
                <Select value={formData.type} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeInfo).map(([key, info]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          {info.icon}
                          <div>
                            <div className="font-medium">{info.label}</div>
                            <div className="text-xs text-slate-500">{info.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select value={formData.unit} onValueChange={handleUnitChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Each">Each</SelectItem>
                    <SelectItem value="Linear Foot">Linear Foot</SelectItem>
                    <SelectItem value="Square Foot">Square Foot</SelectItem>
                    <SelectItem value="Cubic Yard">Cubic Yard</SelectItem>
                    <SelectItem value="Mile">Mile</SelectItem>
                    <SelectItem value="Yard">Yard</SelectItem>
                    <SelectItem value="Hour">Hour</SelectItem>
                    <SelectItem value="Pallet">Pallet (48" x 40")</SelectItem>
                  </SelectContent>
                </Select>
                {formData.unit === 'Pallet' && (
                  <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    Standard pallet dimensions (48" x 40") have been automatically set. You can adjust the height in the Logistics tab.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="action">Action</Label>
                <Select value={formData.action || ''} onValueChange={(val) => setFormData((p) => ({ ...p, action: val }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an action" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {actions.map((action) => (
                      <SelectItem key={action.value} value={action.value}>{action.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData((p) => ({ ...p, category: val }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {productCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4 pt-4">
              <div className="bg-slate-50 p-4 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-slate-700">Cost Breakdown</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGetLocalPricing}
                    disabled={isFetchingPricing}
                  >
                    {isFetchingPricing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <DollarSign className="w-4 h-4 mr-2" />}
                    Get Local Pricing
                  </Button>
                </div>

                {item && (
                  <div className="text-xs text-slate-500 space-y-1 bg-slate-100 p-2 rounded">
                    <p><strong>Created:</strong> {format(new Date(item.created_date), 'PPP')}</p>
                    {item.last_inflation_adjustment_date && <p><strong>Last Adjusted:</strong> {format(new Date(item.last_inflation_adjustment_date), 'PPP')}</p>}
                    <p><strong>Original Material Cost:</strong> ${item.original_material_cost != null ? item.original_material_cost.toFixed(2) : 'N/A'}</p>
                    <p><strong>Original Labor Cost:</strong> ${item.original_labor_cost != null ? item.original_labor_cost.toFixed(2) : 'N/A'}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="labor_cost">Current Labor Cost (per hour)</Label>
                    <Input
                      id="labor_cost"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.labor_cost}
                      onChange={(e) => setFormData((p) => ({ ...p, labor_cost: e.target.value }))}
                      placeholder="e.g., 25.00"
                    />
                    <p className="text-xs text-slate-500">Base cost of labor per hour</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="material_cost">Current Material Cost (per unit)</Label>
                    <Input
                      id="material_cost"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.material_cost}
                      onChange={(e) => setFormData((p) => ({ ...p, material_cost: e.target.value }))}
                      placeholder="e.g., 15.00"
                    />
                    <p className="text-xs text-slate-500">Base cost of materials per unit</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hours">Labor Hours Required</Label>
                    <Input
                      id="hours"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.hours}
                      onChange={(e) => setFormData((p) => ({ ...p, hours: e.target.value }))}
                      placeholder="e.g., 2.5"
                    />
                    <p className="text-xs text-slate-500">Total hours of labor required per unit</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="waste_percentage">Default Waste Overage (%)</Label>
                    <Input
                      id="waste_percentage"
                      name="waste_percentage"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.waste_percentage}
                      onChange={(e) => setFormData((p) => ({ ...p, waste_percentage: e.target.value }))}
                      onBlur={handlePercentageBlur}
                      placeholder="e.g., 15.00"
                    />
                    <p className="text-xs text-slate-500">Applied to quantity in estimates. Leave blank or 0 for no waste.</p>
                  </div>
                </div>

                {businessSettings && (
                  <div className="bg-blue-50 p-3 rounded text-sm">
                    <p><strong>Applied Markups:</strong></p>
                    <p>{`Labor: ${((businessSettings.labor_markup || 0) * 100).toFixed(1)}% • Materials: ${((businessSettings.materials_markup || 0) * 100).toFixed(1)}%`}</p>

                    <div className="mt-2 pt-2 border-t border-blue-200">
                      <p className="font-semibold text-blue-800">Final Price Calculation (per Unit):</p>
                      <p className="text-xs">
                        {`Labor: ($${(parseFloat(formData.labor_cost) || 0).toFixed(2)} × (1 + ${(businessSettings.labor_markup || 0).toFixed(2)})) × ${(parseFloat(formData.hours) || 0).toFixed(2)} hrs = $${((parseFloat(formData.labor_cost) || 0) * (1 + (businessSettings.labor_markup || 0)) * (parseFloat(formData.hours) || 0)).toFixed(2)}`}
                      </p>
                      <p className="text-xs">
                        {`Materials: $${(parseFloat(formData.material_cost) || 0).toFixed(2)} × (1 + ${(businessSettings.materials_markup || 0).toFixed(2)}) = $${((parseFloat(formData.material_cost) || 0) * (1 + (businessSettings.materials_markup || 0))).toFixed(2)}`}
                      </p>
                      <div className="mt-1 pt-1 border-t border-blue-300">
                        <p className="text-xs font-semibold text-emerald-700">
                          {`Total: $${(((parseFloat(formData.labor_cost) || 0) * (1 + (businessSettings.labor_markup || 0)) * (parseFloat(formData.hours) || 0)) + ((parseFloat(formData.material_cost) || 0) * (1 + (businessSettings.materials_markup || 0)))).toFixed(2)}`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_price">Final Price (per Unit) *</Label>
                <Input
                  id="unit_price"
                  type="number"
                  value={formData.unit_price}
                  readOnly
                  className="bg-slate-100 focus:ring-0 text-lg font-semibold text-emerald-600"
                  required
                />
                <p className="text-xs text-slate-500">Auto-calculated price per unit, before waste. Waste % is applied to quantity in estimates.</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Labor Details
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="required_labor_type">Labor Tier</Label>
                    <Select
                      value={formData.required_labor_type_name}
                      onValueChange={handleLaborTypeSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a labor tier..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {(businessSettings?.labor_types || []).map((tier) => (
                          <SelectItem key={tier.name} value={tier.name}>
                            {tier.name} (${tier.rate}/hr)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skill_level">Skill Level Required</Label>
                    <Select value={formData.skill_level} onValueChange={(val) => setFormData((p) => ({ ...p, skill_level: val }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="skilled">Skilled</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-4 pt-4">
              {formData.type === 'inventory_materials' || formData.type === 'job_supplies' ? (
                <div className="bg-green-50 p-4 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-green-900 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Inventory Tracking
                    </h4>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.inventory_tracked}
                        onCheckedChange={(checked) => setFormData((p) => ({ ...p, inventory_tracked: checked }))}
                      />
                      <Label className="text-sm">Track Inventory</Label>
                    </div>
                  </div>

                  {formData.inventory_tracked && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="current_stock">Current Stock</Label>
                        <Input
                          id="current_stock"
                          type="number"
                          value={formData.current_stock}
                          onChange={(e) => setFormData((p) => ({ ...p, current_stock: e.target.value }))}
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="minimum_stock">Minimum Stock Level</Label>
                        <Input
                          id="minimum_stock"
                          type="number"
                          value={formData.minimum_stock}
                          onChange={(e) => setFormData((p) => ({ ...p, minimum_stock: e.target.value }))}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Inventory tracking is only available for 'Inventory Materials' or 'Job Supplies' type items.</p>
              )}
            </TabsContent>

            {/* Logistics Tab - COMBINED SUPPLIER AND LOGISTICS */}
            <TabsContent value="logistics" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Supplier Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="supplier">Supplier/Service Provider</Label>
                      <Input
                        id="supplier"
                        value={formData.supplier}
                        onChange={(e) => setFormData((p) => ({ ...p, supplier: e.target.value }))}
                        placeholder="Company name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="supplier_part_number">Part Number / Purchasing Link</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="supplier_part_number"
                          value={formData.supplier_part_number}
                          onChange={(e) => setFormData((p) => ({ ...p, supplier_part_number: e.target.value }))}
                          placeholder="SKU, service code, or https://..."
                        />
                        {formData.supplier_part_number && (formData.supplier_part_number.startsWith('http') || formData.supplier_part_number.startsWith('www')) && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => window.open(formData.supplier_part_number.startsWith('http') ? formData.supplier_part_number : `https://${formData.supplier_part_number}`, '_blank')}
                            title="Open Link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supplier_address">Supplier Address</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="supplier_address"
                        value={formData.supplier_address}
                        onChange={(e) => setFormData((p) => ({ ...p, supplier_address: e.target.value }))}
                        placeholder="123 Main St, City, State"
                      />
                      <Button type="button" variant="outline" onClick={handleGeocodeSupplier} disabled={isGeocoding || !formData.supplier_address}>
                        {isGeocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                      </Button>
                    </div>
                    {formData.supplier_location && (
                      <p className="text-sm text-green-600">Location found: {formData.supplier_location.latitude.toFixed(4)}, {formData.supplier_location.longitude.toFixed(4)}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="supplier_city">City</Label>
                      <Input
                        id="supplier_city"
                        value={formData.supplier_city}
                        onChange={(e) => setFormData((p) => ({ ...p, supplier_city: e.target.value }))}
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supplier_state">State</Label>
                      <Input
                        id="supplier_state"
                        value={formData.supplier_state}
                        onChange={(e) => setFormData((p) => ({ ...p, supplier_state: e.target.value }))}
                        placeholder="State"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supplier_zip">ZIP Code</Label>
                      <Input
                        id="supplier_zip"
                        value={formData.supplier_zip}
                        onChange={(e) => setFormData((p) => ({ ...p, supplier_zip: e.target.value }))}
                        placeholder="ZIP"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Logistics & Delivery
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="delivery_required">Delivery Required</Label>
                        <Switch
                          id="delivery_required"
                          checked={formData.logistics?.delivery_required || false}
                          onCheckedChange={(checked) => handleLogisticsChange('delivery_required', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="pickup_required">Pickup Required</Label>
                        <Switch
                          id="pickup_required"
                          checked={formData.logistics?.pickup_required || false}
                          onCheckedChange={(checked) => handleLogisticsChange('pickup_required', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="requires_appointment">Requires Appointment</Label>
                        <Switch
                          id="requires_appointment"
                          checked={formData.logistics?.requires_appointment || false}
                          onCheckedChange={(checked) => handleLogisticsChange('requires_appointment', checked)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="lead_time_days">Lead Time (Days)</Label>
                        <Input
                          id="lead_time_days"
                          type="number"
                          min="0"
                          value={formData.logistics?.lead_time_days || 0}
                          onChange={(e) => handleLogisticsChange('lead_time_days', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (lbs)</Label>
                        <Input
                          id="weight"
                          type="number"
                          min="0"
                          step="0.1"
                          value={formData.logistics?.weight || 0}
                          onChange={(e) => handleLogisticsChange('weight', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Delivery Window</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="delivery_window_start">Start Time</Label>
                        <Input
                          id="delivery_window_start"
                          type="time"
                          value={formData.logistics?.delivery_window_start || '08:00'}
                          onChange={(e) => handleLogisticsChange('delivery_window_start', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="delivery_window_end">End Time</Label>
                        <Input
                          id="delivery_window_end"
                          type="time"
                          value={formData.logistics?.delivery_window_end || '17:00'}
                          onChange={(e) => handleLogisticsChange('delivery_window_end', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2"><Ruler className="w-4 h-4"/>Dimensions</h4>
                    {formData.unit === 'Pallet' && (
                      <Alert>
                        <AlertDescription>
                          Standard pallet dimensions are pre-filled. Length and width are locked to industry standards (48" x 40"). Adjust height as needed.
                        </AlertDescription>
                      </Alert>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dim_length">Length</Label>
                        <Input
                          id="dim_length"
                          type="number"
                          min="0"
                          step="0.1"
                          value={formData.logistics?.dimensions?.length || 0}
                          onChange={(e) => handleDimensionChange('length', e.target.value)}
                          disabled={formData.unit === 'Pallet'}
                          className={formData.unit === 'Pallet' ? 'bg-slate-100' : ''}
                        />
                        {formData.unit === 'Pallet' && (
                          <p className="text-xs text-slate-500">Standard: 48"</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dim_width">Width</Label>
                        <Input
                          id="dim_width"
                          type="number"
                          min="0"
                          step="0.1"
                          value={formData.logistics?.dimensions?.width || 0}
                          onChange={(e) => handleDimensionChange('width', e.target.value)}
                          disabled={formData.unit === 'Pallet'}
                          className={formData.unit === 'Pallet' ? 'bg-slate-100' : ''}
                        />
                        {formData.unit === 'Pallet' && (
                          <p className="text-xs text-slate-500">Standard: 40"</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dim_height">Height</Label>
                        <Input
                          id="dim_height"
                          type="number"
                          min="0"
                          step="0.1"
                          value={formData.logistics?.dimensions?.height || 0}
                          onChange={(e) => handleDimensionChange('height', e.target.value)}
                        />
                        <p className="text-xs text-slate-500">Manual input required</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dim_unit">Unit</Label>
                        <Select
                          id="dim_unit"
                          value={formData.logistics?.dimensions?.unit || 'inches'}
                          onValueChange={(value) => handleDimensionChange('unit', value)}
                          disabled={formData.unit === 'Pallet'}
                        >
                          <SelectTrigger className={formData.unit === 'Pallet' ? 'bg-slate-100' : ''}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inches">Inches</SelectItem>
                            <SelectItem value="feet">Feet</SelectItem>
                            <SelectItem value="cm">Centimeters</SelectItem>
                            <SelectItem value="meters">Meters</SelectItem>
                          </SelectContent>
                        </Select>
                        {formData.unit === 'Pallet' && (
                          <p className="text-xs text-slate-500">Locked to inches</p>
                        )}
                      </div>
                    </div>

                    {/* Stacking Logic checkbox */}
                    {(formData.type === 'inventory_materials' || formData.type === 'job_supplies') && (
                      <div className="flex items-center space-x-2 mt-4">
                        <Checkbox
                          id="stackable"
                          checked={formData.logistics?.stackable || false}
                          onCheckedChange={(checked) => handleLogisticsChange('stackable', checked)}
                        />
                        <Label htmlFor="stackable" className="text-sm font-medium leading-none">
                          Is Stackable? (Allows multiple units to occupy the same vertical space for capacity calculations)
                        </Label>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="required_vehicle_type">Required Vehicle Type</Label>
                      <Select
                        id="required_vehicle_type"
                        value={formData.logistics?.required_vehicle_type || 'car'}
                        onValueChange={(value) => handleLogisticsChange('required_vehicle_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="car">Car</SelectItem>
                          <SelectItem value="van">Van</SelectItem>
                          <SelectItem value="pickup_truck">Pickup Truck</SelectItem>
                          <SelectItem value="box_truck">Box Truck</SelectItem>
                          <SelectItem value="flatbed">Flatbed</SelectItem>
                          <SelectItem value="crane_truck">Crane Truck</SelectItem>
                          <SelectItem value="refrigerated">Refrigerated Vehicle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="special_handling">Special Handling Instructions</Label>
                      <Textarea
                        id="special_handling"
                        value={formData.logistics?.special_handling || ''}
                        onChange={(e) => handleLogisticsChange('special_handling', e.target.value)}
                        placeholder="Fragile, hazardous materials, requires crane, etc."
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Variations Tab - NEW */}
            <TabsContent value="variations" className="space-y-4 pt-4">
              <div className="bg-amber-50 p-4 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-amber-900">Special Order Item</h4>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.is_special_order}
                      onCheckedChange={(checked) => setFormData((p) => ({ ...p, is_special_order: checked }))}
                    />
                    <Label className="text-sm">{formData.is_special_order ? 'Enabled' : 'Disabled'}</Label>
                  </div>
                </div>

                {formData.is_special_order && (
                  <div className="space-y-4">
                    <p className="text-sm text-amber-800">
                      Define variations for this product. Customers will be able to choose one when you send a selection request.
                    </p>

                    <div className="space-y-3">
                      {(formData.variations || []).map((variation, index) => (
                        <div key={index} className="flex flex-col md:flex-row gap-3 bg-white p-3 rounded-md border">
                          <div className="flex-1 space-y-2">
                            <Input
                              placeholder="Variation Name (e.g., Color: Red)"
                              value={variation.name}
                              onChange={(e) => updateVariation(index, 'name', e.target.value)}
                            />
                            <div className="flex items-center flex-wrap gap-2">
                              <div className="space-y-1">
                                <Label htmlFor={`price_adj_${index}`} className="text-xs font-medium text-slate-600">Price Adj. (+/-)</Label>
                                <Input
                                  id={`price_adj_${index}`}
                                  type="number"
                                  step="0.01"
                                  placeholder="$0.00"
                                  title="Amount to add/subtract from the final selling price."
                                  value={variation.price_adjustment}
                                  onChange={(e) => updateVariation(index, 'price_adjustment', parseFloat(e.target.value) || 0)}
                                  className="w-28"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor={`cost_adj_${index}`} className="text-xs font-medium text-slate-600">Cost Adj. (+)</Label>
                                <Input
                                  id={`cost_adj_${index}`}
                                  type="number"
                                  step="0.01"
                                  placeholder="$0.00"
                                  title="Amount to add to the base material/labor cost."
                                  value={variation.cost_adjustment}
                                  onChange={(e) => updateVariation(index, 'cost_adjustment', parseFloat(e.target.value) || 0)}
                                  className="w-28"
                                />
                              </div>
                              <div className="relative flex-1 min-w-[150px]">
                                <Label className="text-xs font-medium text-slate-600">Supplier Link</Label>
                                <div className="relative mt-1">
                                  <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                                  <Input
                                    placeholder="Supplier Link"
                                    value={variation.supplier_link}
                                    onChange={(e) => updateVariation(index, 'supplier_link', e.target.value)}
                                    className="pl-8"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="relative group">
                              <input type="file" onChange={(e) => handleImageUpload(e, index)} accept="image/*" className="hidden" id={`var-img-${index}`} />
                              <label htmlFor={`var-img-${index}`} className="cursor-pointer">
                                {variation.image_url ? (
                                  <img src={variation.image_url} className="w-16 h-16 object-cover rounded-md border" />
                                ) : (
                                  <div className="w-16 h-16 border-2 border-dashed rounded-md flex items-center justify-center text-slate-400">
                                    <ImagePlus className="w-6 h-6" />
                                  </div>
                                )}
                              </label>
                              {variation.image_url && (
                                <Button type="button" variant="destructive" size="icon" className="absolute -top-1 -right-1 h-5 w-5 opacity-0 group-hover:opacity-100" onClick={() => removeImage(null, index)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>

                            <Button type="button" variant="ghost" size="icon" onClick={() => removeVariation(index)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={addVariation}
                      disabled={(formData.variations || []).length >= 15}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Variation
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

          </Tabs>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="w-4 h-4 mr-2" /> {isSubmitting ? 'Saving...' : 'Save Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
