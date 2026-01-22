
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ProductOrService, User, BusinessSettings, Contract, Project } from '@/api/entities';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { format, parseISO } from "date-fns";
import {
  Calendar as CalendarIcon, Plus, Trash2, Save, X, Calculator, AlertTriangle, Lock, Barcode, AlertCircle, Package,
  CheckSquare, Clock, Repeat, DollarSign, Info
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CatalogSelector from './CatalogSelector';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LogisticsPlanner from './LogisticsPlanner';
import { generateEstimatePdf } from "@/api/functions";
import { toast } from "sonner";

// Simple UUID generator function to replace uuid library
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
};

// Define subscription fee rates
const PARTNER_FEE_RATES = {
  'Trial': 0.09,
  'Starter': 0.09,
  'Partner': 0.07,
  'Enterprise': 0,
  'Enterprise Annual': 0,
  'Inactive': 0.09,
};

const productCategories = [
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
  { value: "gutters", label: "Gutters" },
  { value: "handyman", label: "Handyman" },
  { value: "hvac", label: "HVAC" },
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
  { value: "uncategorized", label: "Uncategorized" }
];


export default function EstimateBuilder({ estimate, clients, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(() => {
    const baseEstimate = estimate || {
      title: '',
      description: '',
      client_id: '',
      assigned_to: '',
      estimated_cost: 0,
      estimated_labor_cost: 0,
      estimated_materials_cost: 0,
      estimated_hours: 0,
      estimated_completion: '',
      priority: 'medium',
      project_type: 'other',
      line_items: [],
      subtotal: 0,
      tax_amount: 0,
      overall_adjustment: 0,
      overall_adjustment_reason: '',
      total_after_adjustments: 0,
      contract_id: '',
      payment_terms: '',
      deposit_percentage: 0,
      warranty_period_days: 0,
      optimized_route: null,
      is_repeating: false,
      repeating_interval: 'monthly',
      next_invoice_date: '',
      repeating_end_date: ''
    };

    return {
      ...baseEstimate,
      site_address: estimate?.site_address || '',
      is_repeating: estimate?.is_repeating ?? false,
      repeating_interval: estimate?.repeating_interval ?? 'monthly',
      next_invoice_date: estimate?.next_invoice_date || '',
      repeating_end_date: estimate?.repeating_end_date || '',
      line_items: baseEstimate.line_items.map((item) => ({
        ...item,
        base_quantity: item.base_quantity ?? item.quantity ?? 1,
        waste_percentage: item.waste_percentage ?? 0,
        quantity: item.quantity ?? (item.base_quantity ?? 1) * (1 + (item.waste_percentage ?? 0)),
        type: item.type || 'material',
        category: item.category || 'uncategorized',
        id: item.id || generateUUID(),
        route_order: item.route_order ?? null,
        hours: item.hours ?? 0
      }))
    };
  });

  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [businessSettings, setBusinessSettings] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientTypeFilter, setClientTypeFilter] = useState('all');
  const [filteredClients, setFilteredClients] = useState([]);
  const [profitability, setProfitability] = useState({
    totalCost: 0,
    profit: 0,
    margin: 0,
    indirectCostApplied: 0,
    salesFeeApplied: 0
  });
  const [grossProfitMargin, setGrossProfitMargin] = useState(0);
  const [partnerFee, setPartnerFee] = useState(0);
  const [netProfitMargin, setNetProfitMargin] = useState(0);

  const [isMarginError, setIsMarginError] = useState(false);
  const [error, setError] = useState(null);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [logisticsPlan, setLogisticsPlan] = useState({});

  const isLocked = estimate?.estimate_locked || false;

  const loadData = useCallback(async () => {
    try {
      const user = await User.me();
      const [productsData, usersData, settingsData, contractsData] = await Promise.all([
        ProductOrService.filter({ business_id: user.current_business_id }),
        User.list(),
        BusinessSettings.filter({ business_id: user.current_business_id }),
        Contract.filter({ active: true })
      ]);
      setProducts(productsData);
      setUsers(usersData);
      setContracts(contractsData);
      setBusinessSettings(settingsData.length > 0 ? settingsData[0] : {
        tax_rate: 0.08,
        minimum_profit_margin: 0,
        include_indirect_expense_in_estimates: false,
        last_calculated_indirect_rate: 0
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  const getCurrentUser = useCallback(async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);

      if (!estimate && !formData.assigned_to) {
        setFormData((prev) => ({ ...prev, assigned_to: user.email }));
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  }, [estimate, formData.assigned_to]);

  useEffect(() => {
    loadData();
    getCurrentUser();
  }, [loadData, getCurrentUser]);

  useEffect(() => {
    if (clientTypeFilter === 'all') {
      setFilteredClients(clients);
    } else {
      setFilteredClients(clients.filter((client) => client.client_type === clientTypeFilter));
    }
  }, [clients, clientTypeFilter]);

  const calculateTotals = useCallback(() => {
    const items = formData.line_items || [];
    const indirectRate = businessSettings?.include_indirect_expense_in_estimates && businessSettings?.last_calculated_indirect_rate ? businessSettings.last_calculated_indirect_rate : 0;

    if (!businessSettings) {
      setProfitability({ totalCost: 0, profit: 0, margin: 0, indirectCostApplied: 0, salesFeeApplied: 0 });
      setGrossProfitMargin(0);
      setPartnerFee(0);
      setNetProfitMargin(0);
      setIsMarginError(false);
      setFormData((prev) => ({
        ...prev,
        subtotal: 0,
        tax_amount: 0,
        total_after_adjustments: 0,
        estimated_cost: 0,
        estimated_labor_cost: 0,
        estimated_materials_cost: 0,
        estimated_hours: 0
      }));
      return;
    }

    let subtotal = 0;
    let totalDirectCostAdjusted = 0;
    let estimatedLaborCost = 0;
    let estimatedMaterialsCost = 0;
    let totalIndirectCostApplied = 0;
    let totalEstimatedHours = 0;

    for (const item of items) {
      const itemSellingPrice = (item.quantity || 0) * (item.unit_price || 0);
      subtotal += itemSellingPrice + (item.adjustment_amount || 0);

      let itemCost = item.cost_price || 0;
      let currentItemAdjustedCostPerUnit = itemCost;

      const itemTotalAdjustedCost = (item.quantity || 0) * currentItemAdjustedCostPerUnit;
      totalDirectCostAdjusted += itemTotalAdjustedCost;

      if (item.hours && item.hours > 0) {
        totalEstimatedHours += (item.base_quantity || 0) * (item.hours || 0);
      }

      if (item.type === 'labor') {
        estimatedLaborCost += itemTotalAdjustedCost;
        if (indirectRate > 0) {
          totalIndirectCostApplied += (item.quantity || 0) * indirectRate;
        }
      } else {
        estimatedMaterialsCost += itemTotalAdjustedCost;
      }
    }

    const taxRate = businessSettings?.tax_rate || 0.08;
    const taxableAmount = items.reduce((sum, item) => {
      if (item.taxable !== false) {
        const itemTotal = (item.quantity || 0) * (item.unit_price || 0) + (item.adjustment_amount || 0);
        return sum + itemTotal;
      }
      return sum;
    }, 0);
    const taxAmount = taxableAmount * taxRate;

    const totalAfterAdjustments = subtotal + taxAmount + (formData.overall_adjustment || 0);

    const totalSellingPriceForProfit = subtotal + (formData.overall_adjustment || 0);

    // Calculate Gross Profit and Margin (before indirect costs and sales fee)
    const grossProfitValue = totalSellingPriceForProfit - totalDirectCostAdjusted;
    const calculatedGrossProfitMargin = totalSellingPriceForProfit > 0 ? (grossProfitValue / totalSellingPriceForProfit) : 0;
    setGrossProfitMargin(calculatedGrossProfitMargin * 100);

    // Calculate Partner Fee (Sales Fee)
    let salesFeeRate = 0;
    if (businessSettings?.subscription_type) {
      salesFeeRate = PARTNER_FEE_RATES[businessSettings.subscription_type] || 0;
    }
    const salesFeeApplied = totalSellingPriceForProfit * salesFeeRate;
    setPartnerFee(salesFeeApplied);

    // Calculate Net Profit and Margin (after all costs including indirect and sales fee)
    const totalCostForProfitability = totalDirectCostAdjusted + totalIndirectCostApplied + salesFeeApplied;
    const netProfitValue = totalSellingPriceForProfit - totalCostForProfitability;
    const calculatedNetMargin = totalSellingPriceForProfit > 0 ? netProfitValue / totalSellingPriceForProfit : 0;
    setNetProfitMargin(calculatedNetMargin * 100);

    setProfitability({
      totalCost: totalCostForProfitability,
      profit: netProfitValue,
      margin: calculatedNetMargin,
      indirectCostApplied: totalIndirectCostApplied,
      salesFeeApplied: salesFeeApplied
    });

    if (businessSettings && businessSettings.minimum_profit_margin > 0) {
      setIsMarginError(calculatedNetMargin < businessSettings.minimum_profit_margin);
    } else {
      setIsMarginError(false);
    }

    setFormData((prev) => ({
      ...prev,
      subtotal: subtotal,
      tax_amount: taxAmount,
      total_after_adjustments: totalAfterAdjustments,
      estimated_cost: totalAfterAdjustments,
      estimated_labor_cost: estimatedLaborCost,
      estimated_materials_cost: estimatedMaterialsCost,
      estimated_hours: totalEstimatedHours
    }));
  }, [formData.line_items, formData.overall_adjustment, businessSettings]);

  useEffect(() => {
    calculateTotals();
  }, [formData.line_items, formData.overall_adjustment, businessSettings, calculateTotals]);

  // Group line items by category for better organization
  const groupedLineItems = useMemo(() => {
    if (!formData.line_items) return {};

    return formData.line_items.reduce((groups, item) => {
      const category = item.category || 'uncategorized';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
      return groups;
    }, {});
  }, [formData.line_items]);

  // Calculate category totals and progress
  const categoryMilestones = useMemo(() => {
    const milestones = {};

    Object.entries(groupedLineItems).forEach(([category, items]) => {
      const categoryTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
      const categoryHours = items.reduce((sum, item) => sum + ((item.base_quantity || 0) * (item.hours || 0)), 0);

      milestones[category] = {
        name: productCategories.find(cat => cat.value === category)?.label || category.replace(/_/g, ' '),
        items: items.length,
        total_value: categoryTotal,
        total_hours: categoryHours,
        completed: false
      };
    });

    return milestones;
  }, [groupedLineItems]);


  const handleClientChange = (clientId) => {
    const selectedClient = clients.find((c) => c.id === clientId);
    if (selectedClient) {
      const addressParts = [
        selectedClient.address,
        selectedClient.city,
        selectedClient.state,
        selectedClient.zip_code,
      ].filter(Boolean);
      const newAddress = addressParts.join(', ');

      setFormData((prev) => ({
        ...prev,
        client_id: clientId,
        site_address: newAddress,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        client_id: clientId,
        site_address: '',
      }));
    }
  };

  const handleDateSelect = (field, date) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date ? format(date, 'yyyy-MM-dd') : ''
    }));
  };

  const handleTBDCompletion = () => {
    setFormData((prev) => ({
      ...prev,
      estimated_completion: 'TBD'
    }));
  };

  const addLineItem = () => {
    const newItem = {
      id: generateUUID(),
      product_service_id: null,
      description: '',
      base_quantity: 1,
      waste_percentage: 0,
      quantity: 1,
      unit_price: 0,
      total: 0,
      taxable: true,
      adjustment_amount: 0,
      adjustment_reason: '',
      cost_price: 0,
      type: 'labor',
      category: 'project',
      supplier_address: '',
      supplier_location: null,
      hours: 0,
      route_order: (formData.line_items?.length || 0) + 1
    };
    newItem.total = newItem.quantity * newItem.unit_price + (newItem.adjustment_amount || 0);
    setFormData((prev) => ({
      ...prev,
      line_items: [...(prev.line_items || []), newItem]
    }));
  };

  const updateLineItem = (index, field, value) => {
    const updatedItems = [...(formData.line_items || [])];
    const item = { ...updatedItems[index] };

    if (['base_quantity', 'waste_percentage', 'unit_price', 'cost_price', 'adjustment_amount'].includes(field)) {
      item[field] = value === '' ? '' : parseFloat(value);
    } else if (field === 'hours' && !item.product_service_id) {
      item[field] = value === '' ? '' : parseFloat(value);
    } else {
      item[field] = value;
    }

    const baseQty = parseFloat(item.base_quantity) || 0;
    const wastePerc = parseFloat(item.waste_percentage) || 0;
    const unitPrice = parseFloat(item.unit_price) || 0;
    const adjustmentAmount = parseFloat(item.adjustment_amount) || 0;

    item.quantity = baseQty * (1 + wastePerc);
    item.total = item.quantity * unitPrice + adjustmentAmount;

    updatedItems[index] = item;
    setFormData((prev) => ({ ...prev, line_items: updatedItems }));
  };

  const removeLineItem = (index) => {
    const newItems = formData.line_items.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, line_items: newItems }));
  };

  const handleAddFromCatalog = (selectedItems) => {
    setFormData((prev) => {
      const newItems = selectedItems.map(({ product, quantity: selectedQty }) => {
        const base_quantity = selectedQty || 1;
        const waste_percentage_from_product = product.waste_percentage ?? 0;
        const final_quantity = base_quantity * (1 + waste_percentage_from_product);
        const item_unit_price = product.unit_price || 0;
        const item_cost_price = (product.labor_cost || 0) + (product.material_cost || 0) || product.cost_price || 0;
        const item_total = final_quantity * item_unit_price;

        return {
          id: generateUUID(),
          product_service_id: product.id,
          description: product.name,
          base_quantity: base_quantity,
          waste_percentage: waste_percentage_from_product,
          quantity: final_quantity,
          unit_price: item_unit_price,
          cost_price: item_cost_price,
          type: product.type || 'material',
          category: product.category || 'uncategorized',
          total: item_total,
          taxable: true,
          adjustment_amount: 0,
          adjustment_reason: '',
          supplier_address: product.supplier_address || '',
          supplier_location: product.supplier_location || null,
          hours: product.hours || 0,
          route_order: (prev.line_items?.length || 0) + 1
        };
      });

      return {
        ...prev,
        line_items: [...(prev.line_items || []), ...newItems]
      };
    });
  };

  const handleContractChange = (contractId) => {
    const selectedContract = contracts.find((c) => c.id === contractId);
    if (!selectedContract) {
      setFormData((prev) => ({
        ...prev,
        contract_id: '',
        payment_terms: '',
        deposit_percentage: 0,
        warranty_period_days: 0
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      contract_id: contractId,
      payment_terms: selectedContract.payment_terms,
      deposit_percentage: selectedContract.deposit_percentage || 0,
      warranty_period_days: selectedContract.warranty_period_days || 0
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.client_id) {
      setError('Please fill in all required fields (Project Title and Client)');
      return;
    }
    if (isMarginError) {
      setError("Profit margin is below the required minimum. Please adjust pricing or discounts.");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const salesFeeRate = businessSettings ? (PARTNER_FEE_RATES[businessSettings.subscription_type] || 0) : 0;

      const dataToSubmit = {
        ...formData,
        client_id: formData.client_id,
        estimated_completion: formData.estimated_completion === 'TBD' ?
          'TBD' :
          formData.estimated_completion ?
            format(parseISO(formData.estimated_completion), 'yyyy-MM-dd') :
            null,
        next_invoice_date: formData.is_repeating && formData.next_invoice_date ?
            format(parseISO(formData.next_invoice_date), 'yyyy-MM-dd') : null,
        repeating_end_date: formData.is_repeating && formData.repeating_end_date ?
            format(parseISO(formData.repeating_end_date), 'yyyy-MM-dd') : null,
        line_items: formData.line_items?.map((item) => ({
          ...item,
          total: (item.quantity || 0) * (item.unit_price || 0) + (item.adjustment_amount || 0)
        })) || [],
        partner_fee_percentage: salesFeeRate,
        partner_fee_amount: profitability.salesFeeApplied,
        net_profit_margin: profitability.margin,
      };

      let savedEstimate;
      if (estimate) {
        if (estimate.estimate_locked) {
          toast.error('This estimate is locked and cannot be modified. Create a change order instead.');
          return;
        }
        savedEstimate = await Project.update(estimate.id, dataToSubmit);
        toast.success("Estimate updated successfully!");
      } else {
        dataToSubmit.status = 'estimate';
        savedEstimate = await Project.create(dataToSubmit);
        const barcode = `EST-${savedEstimate.id}`;
        savedEstimate = await Project.update(savedEstimate.id, { barcode });
        
        try {
          const pdfResponse = await generateEstimatePdf({ estimateId: savedEstimate.id });
          const pdfBlob = new Blob([pdfResponse.data], { type: 'application/pdf' });
          
          const pdfFileName = `Estimate-${barcode}.pdf`;
          const pdfUrl = window.URL.createObjectURL(pdfBlob);
          
          await Project.update(savedEstimate.id, {
            estimate_pdf_url: pdfUrl,
            estimate_pdf_filename: pdfFileName,
            estimate_pdf_generated_date: new Date().toISOString()
          });
          
          toast.success("Estimate created successfully with PDF generated!");
          
        } catch (pdfError) {
          console.error('Error generating PDF:', pdfError);
          toast.warning("Estimate created successfully, but PDF generation failed. You can generate it manually later.");
        }
      }
      
      await onSubmit(savedEstimate);
    } catch (err) {
      console.error('Error saving estimate:', err);
      setError('Failed to save estimate. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasDiscounts = formData.line_items?.some((item) => (item.adjustment_amount || 0) < 0) ||
    (formData.overall_adjustment || 0) < 0;

  const categorySubtotals = (formData.line_items || []).reduce((acc, item) => {
    const category = item.category || 'uncategorized';
    const itemTotal = (item.quantity || 0) * (item.unit_price || 0) + (item.adjustment_amount || 0);
    acc[category] = (acc[category] || 0) + itemTotal;
    return acc;
  }, {});

  return (
    <TooltipProvider>
      <Dialog open={true} onOpenChange={onCancel}>
        <DialogContent className="sm:max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isLocked && <Lock className="w-5 h-5 text-amber-600" />}
              <Save className="w-5 h-5" />
              {estimate ? 'Edit Estimate' : 'Create New Estimate'}
              {isLocked &&
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  Locked
                </Badge>
              }
            </DialogTitle>
            {estimate?.barcode &&
              <div className="text-sm text-slate-500 font-mono flex items-center gap-2 pt-1">
                <Barcode className="w-4 h-4" />
                <span>{estimate.barcode}</span>
              </div>
            }
          </DialogHeader>

          {error &&
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Submission Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          }

          {isLocked &&
            <Alert className="border-amber-200 bg-amber-50">
              <Lock className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Estimate Locked</AlertTitle>
              <AlertDescription className="text-amber-700">
                This estimate is locked and cannot be modified directly. Please close this window and create a change order if you need to make adjustments.
              </AlertDescription>
            </Alert>
          }

          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="basic" disabled={isLocked}>Basic Info</TabsTrigger>
                <TabsTrigger value="items" disabled={isLocked && formData.line_items.length === 0}>Line Items</TabsTrigger>
                <TabsTrigger value="repeating" disabled={isLocked}>Repeating</TabsTrigger>
                <TabsTrigger value="logistics" disabled={!formData.line_items || formData.line_items.length === 0}>Logistics</TabsTrigger>
                <TabsTrigger value="milestones" disabled={Object.keys(categoryMilestones).length === 0}>Milestones</TabsTrigger>
                <TabsTrigger value="adjustments" disabled={isLocked}>Adjustments</TabsTrigger>
                <TabsTrigger value="totals" disabled={isLocked && (!formData.line_items || formData.line_items.length === 0)}>Review & Total</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter project title"
                      required
                      disabled={isLocked} />

                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client_type_filter">Client Type</Label>
                    <Select
                      value={clientTypeFilter}
                      onValueChange={(value) => setClientTypeFilter(value)}
                      disabled={isLocked}>

                      <SelectTrigger>
                        <SelectValue placeholder="Filter by client type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Clients</SelectItem>
                        <SelectItem value="residential">Residential Only</SelectItem>
                        <SelectItem value="commercial">Commercial Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_id">Client *</Label>
                  <Select
                    value={formData.client_id}
                    onValueChange={handleClientChange}
                    required
                    disabled={isLocked}>

                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {filteredClients.map((client) => {
                        let displayName = client.contact_person || 'Unnamed Client';
                        if (client.client_type === 'commercial' && client.company_name) {
                          if (client.contact_person && client.contact_person !== client.company_name) {
                            displayName = `${client.company_name} (${client.contact_person})`;
                          } else {
                            displayName = client.company_name;
                          }
                        }

                        const clientTypeLabel = client.client_type === 'commercial' ? 'Commercial' : 'Residential';

                        return (
                          <SelectItem key={client.id} value={client.id}>
                            <div className="flex justify-between items-center w-full">
                              <span>{displayName}</span>
                              <span className="text-xs text-slate-500 ml-2">{clientTypeLabel}</span>
                            </div>
                          </SelectItem>);

                      })}
                      {filteredClients.length === 0 &&
                        <SelectItem value={'none'} disabled>
                          No {clientTypeFilter === 'all' ? '' : clientTypeFilter} clients found
                        </SelectItem>
                      }
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assigned_to">Assigned To</Label>
                    <Select
                      value={formData.assigned_to}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, assigned_to: value }))}
                      disabled={isLocked}>

                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {users.map((user) =>
                          <SelectItem key={user.id} value={user.email}>
                            <div className="flex justify-between items-center w-full">
                              <span>{user.full_name}</span>
                              {user.user_type === 'subcontractor' && user.next_available_date &&
                                <Badge variant="outline" className="ml-2 font-normal">
                                  Avail: {format(parseISO(user.next_available_date), 'MMM d')}
                                </Badge>
                              }
                            </div>
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="site_address">Site Address</Label>
                    <Input
                      id="site_address"
                      value={formData.site_address}
                      onChange={(e) => setFormData((prev) => ({ ...prev, site_address: e.target.value }))}
                      placeholder="Project site address"
                      disabled={isLocked} />

                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Project description..."
                    rows={3}
                    disabled={isLocked} />

                </div>

                <div className="space-y-2">
                  <Label htmlFor="contract_id">Contract Template</Label>
                  <Select
                    value={formData.contract_id}
                    onValueChange={handleContractChange}
                    disabled={isLocked}>

                    <SelectTrigger>
                      <SelectValue placeholder="Select a contract template (optional)" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value={null}>No Contract Template</SelectItem>
                      {contracts.map((contract) =>
                        <SelectItem key={contract.id} value={contract.id}>
                          {contract.name} - {contract.payment_terms}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {formData.contract_id &&
                    <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                      <p><strong>Payment Terms:</strong> {formData.payment_terms}</p>
                      {formData.deposit_percentage > 0 &&
                        <p><strong>Deposit Required:</strong> {formData.deposit_percentage}%</p>
                      }
                      {formData.warranty_period_days > 0 &&
                        <p><strong>Warranty:</strong> {formData.warranty_period_days} days</p>
                      }
                    </div>
                  }
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
                      disabled={isLocked}>

                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project_type">Type</Label>
                    <Select
                      value={formData.project_type}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, project_type: value }))}
                      disabled={isLocked}>

                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consulting">Consulting</SelectItem>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="construction">Construction</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Estimated Completion</Label>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex-1 justify-start"
                            disabled={isLocked || formData.estimated_completion === 'TBD'}>

                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.estimated_completion === 'TBD' ?
                              'TBD' :
                              formData.estimated_completion ?
                                format(new Date(formData.estimated_completion), 'PPP') :
                                'Select date'
                            }
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.estimated_completion && formData.estimated_completion !== 'TBD' ? new Date(formData.estimated_completion) : undefined}
                            onSelect={(date) => handleDateSelect('estimated_completion', date)} />

                        </PopoverContent>
                      </Popover>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleTBDCompletion}
                        disabled={isLocked}
                        className="px-3">

                        TBD
                      </Button>
                    </div>
                    {formData.estimated_completion === 'TBD' &&
                      <p className="text-xs text-slate-500">
                        Completion date to be determined during project planning
                      </p>
                    }
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="items" className="space-y-4 pt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Line Items</h3>
                  {!isLocked &&
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsCatalogOpen(true)} disabled={isLocked}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add from Catalog
                      </Button>
                      <Button type="button" variant="outline" onClick={addLineItem} disabled={isLocked}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Custom Item
                      </Button>
                    </div>
                  }
                </div>

                <div className="space-y-6">
                  {Object.entries(groupedLineItems).map(([category, items]) => {
                    const categoryInfo = productCategories.find(cat => cat.value === category);
                    const categoryName = categoryInfo?.label || category.replace(/_/g, ' ');
                    const categoryTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
                    const categoryHours = items.reduce((sum, item) => sum + ((item.base_quantity || 0) * (item.hours || 0)), 0);

                    return (
                      <Card key={category} className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <CardTitle className="text-lg capitalize">{categoryName}</CardTitle>
                              <p className="text-sm text-slate-600 mt-1">
                                {items.length} item{items.length !== 1 ? 's' : ''} •
                                ${categoryTotal.toFixed(2)} •
                                {categoryHours.toFixed(1)} hours
                              </p>
                            </div>
                            <Badge variant="outline" className="bg-blue-50">
                              Milestone
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="border rounded-lg overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-12">#</TableHead>
                                  <TableHead>Description</TableHead>
                                  <TableHead>Type</TableHead>
                                  <TableHead className="w-24">Base Qty</TableHead>
                                  <TableHead className="w-28">Waste (%)</TableHead>
                                  <TableHead className="w-24">Final Qty</TableHead>
                                  <TableHead>Hours</TableHead>
                                  <TableHead>Unit Price</TableHead>
                                  <TableHead>Total</TableHead>
                                  <TableHead>Tax</TableHead>
                                  <TableHead>Adjustment</TableHead>
                                  {!isLocked && <TableHead className="w-12"></TableHead>}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {items.map((item) => {
                                  const globalIndex = formData.line_items.findIndex(li => li.id === item.id);
                                  return (
                                    <TableRow key={item.id} className={item.type === 'labor' ? 'bg-blue-50/50' : ''}>
                                      <TableCell className="text-center text-slate-400">
                                        {globalIndex + 1}
                                      </TableCell>
                                      <TableCell>
                                        <Textarea
                                          value={item.description || ''}
                                          onChange={(e) => updateLineItem(globalIndex, 'description', e.target.value)}
                                          placeholder="Item description"
                                          disabled={isLocked}
                                          className="w-full"
                                          rows={1}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Select
                                          value={item.type || 'material'}
                                          onValueChange={(value) => updateLineItem(globalIndex, 'type', value)}
                                          disabled={isLocked}
                                        >
                                          <SelectTrigger className="w-40">
                                            <SelectValue placeholder="Select type" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="labor">Labor</SelectItem>
                                            <SelectItem value="material">Material (Generic)</SelectItem>
                                            <SelectItem value="inventory_materials">Inventory Materials</SelectItem>
                                            <SelectItem value="job_supplies">Job Supplies</SelectItem>
                                            <SelectItem value="non_inventory_materials">Non-Inventory Materials</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </TableCell>
                                      <TableCell>
                                        <Input
                                          type="number"
                                          min="0"
                                          step="any"
                                          value={item.base_quantity === '' ? '' : item.base_quantity}
                                          onChange={(e) => updateLineItem(globalIndex, 'base_quantity', e.target.value)}
                                          className="w-20"
                                          disabled={isLocked}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <div className="relative">
                                              <Input
                                                type="number"
                                                min="0"
                                                step="any"
                                                value={item.waste_percentage === '' ? '' : (item.waste_percentage * 100).toFixed(2)}
                                                onChange={(e) => updateLineItem(globalIndex, 'waste_percentage', e.target.value === '' ? '' : parseFloat(e.target.value) / 100)}
                                                placeholder="0"
                                                className="w-20"
                                                disabled={isLocked}
                                              />
                                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Enter waste as a percentage, e.g., 15 for 15%.</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TableCell>
                                      <TableCell>
                                        <Input
                                          type="number"
                                          value={(item.quantity || 0).toFixed(2)}
                                          readOnly
                                          className="w-20 bg-slate-100"
                                          disabled={isLocked}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <div className="w-20">
                                          <Input
                                            type="number"
                                            value={
                                              item.product_service_id ?
                                                (item.hours || 0).toFixed(2) :
                                                item.hours === '' ? '' : item.hours
                                            }
                                            onChange={
                                              item.product_service_id ?
                                                undefined :
                                                (e) => updateLineItem(globalIndex, 'hours', e.target.value)
                                            }
                                            className={`w-20 ${item.product_service_id ? 'bg-slate-100 text-slate-600' : ''}`}
                                            disabled={item.product_service_id || isLocked}
                                            readOnly={!!item.product_service_id}
                                            title={item.product_service_id ? "Hours per unit from product/service definition" : undefined}
                                            placeholder="0"
                                          />
                                          <div className="text-xs text-slate-500 mt-1 font-medium">
                                            Total: {((item.base_quantity || 0) * (item.hours || 0)).toFixed(2)} hrs
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <Input
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          value={item.unit_price === '' ? '' : item.unit_price}
                                          onChange={(e) => updateLineItem(globalIndex, 'unit_price', e.target.value)}
                                          className="w-24"
                                          disabled={isLocked}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <div className="font-medium">
                                          ${(item.total || 0).toFixed(2)}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center justify-center">
                                          <Switch
                                            checked={item.taxable !== false}
                                            onCheckedChange={(checked) => updateLineItem(globalIndex, 'taxable', checked)}
                                            disabled={isLocked}
                                          />
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          value={item.adjustment_amount === '' ? '' : item.adjustment_amount}
                                          onChange={(e) => updateLineItem(globalIndex, 'adjustment_amount', e.target.value)}
                                          className="w-20"
                                          placeholder="0.00"
                                          disabled={isLocked}
                                        />
                                      </TableCell>
                                      {!isLocked && (
                                        <TableCell>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeLineItem(globalIndex)}
                                            disabled={isLocked}
                                          >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                          </Button>
                                        </TableCell>
                                      )}
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {(!formData.line_items || formData.line_items.length === 0) && (
                    <div className="text-center text-gray-500 py-8">
                      <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No items added yet</p>
                      <p className="text-sm">Click "Add Custom Item" or select from catalog to get started.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="repeating" className="space-y-4 pt-4">
                  <Card>
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                              <Repeat className="w-5 h-5"/>
                              Repeating Project Settings
                          </CardTitle>
                          <p className="text-sm text-slate-600">
                              Set up this project to automatically generate and send invoices on a recurring basis.
                          </p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                          <div className="flex items-center space-x-2">
                              <Switch
                                  id="is_repeating"
                                  checked={formData.is_repeating}
                                  onCheckedChange={(checked) => setFormData(prev => ({...prev, is_repeating: checked}))}
                                  disabled={isLocked}
                              />
                              <Label htmlFor="is_repeating" className="text-base">Enable Repeating Invoices</Label>
                          </div>

                          {formData.is_repeating && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
                                  <div className="space-y-2">
                                      <Label htmlFor="repeating_interval">Interval</Label>
                                      <Select
                                          value={formData.repeating_interval}
                                          onValueChange={(value) => setFormData(prev => ({ ...prev, repeating_interval: value }))}
                                          disabled={isLocked}
                                      >
                                          <SelectTrigger><SelectValue/></SelectTrigger>
                                          <SelectContent>
                                              <SelectItem value="monthly">Monthly</SelectItem>
                                              <SelectItem value="quarterly">Quarterly</SelectItem>
                                              <SelectItem value="yearly">Yearly</SelectItem>
                                          </SelectContent>
                                      </Select>
                                  </div>
                                  <div className="space-y-2">
                                      <Label>Next Invoice Date</Label>
                                      <Popover>
                                          <PopoverTrigger asChild>
                                              <Button variant="outline" className="w-full justify-start" disabled={isLocked}>
                                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                                  {formData.next_invoice_date ? format(new Date(formData.next_invoice_date), 'PPP') : 'Select date'}
                                              </Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-auto p-0">
                                              <Calendar
                                                  mode="single"
                                                  selected={formData.next_invoice_date ? new Date(formData.next_invoice_date) : undefined}
                                                  onSelect={(date) => handleDateSelect('next_invoice_date', date)}
                                              />
                                          </PopoverContent>
                                      </Popover>
                                  </div>
                                  <div className="space-y-2">
                                      <Label>End Date (Optional)</Label>
                                      <Popover>
                                          <PopoverTrigger asChild>
                                              <Button variant="outline" className="w-full justify-start" disabled={isLocked}>
                                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                                  {formData.repeating_end_date ? format(new Date(formData.repeating_end_date), 'PPP') : 'Never'}
                                              </Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-auto p-0">
                                              <Calendar
                                                  mode="single"
                                                  selected={formData.repeating_end_date ? new Date(formData.repeating_end_date) : undefined}
                                                  onSelect={(date) => handleDateSelect('repeating_end_date', date)}
                                              />
                                          </PopoverContent>
                                      </Popover>
                                  </div>
                              </div>
                          )}
                      </CardContent>
                  </Card>
              </TabsContent>

              <TabsContent value="logistics" className="space-y-4 pt-4">
                <LogisticsPlanner
                  project={formData}
                  lineItems={formData.line_items || []}
                  onLogisticsPlanChange={setLogisticsPlan}
                />
              </TabsContent>

              <TabsContent value="milestones" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckSquare className="w-5 h-5" />
                      Project Milestones by Category
                    </CardTitle>
                    <p className="text-sm text-slate-600">
                      Each category represents a milestone. Value and hours are estimated based on line items.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {Object.entries(categoryMilestones).map(([category, milestone]) => (
                        <Card key={category} className="border-l-4 border-l-emerald-500">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{milestone.name}</CardTitle>
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                                Milestone
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div>
                                <p className="text-slate-500">Items</p>
                                <p className="font-semibold">{milestone.items}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Value</p>
                                <p className="font-semibold">${milestone.total_value.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Hours</p>
                                <p className="font-semibold">{milestone.total_hours.toFixed(1)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Clock className="w-4 h-4" />
                              <span>Completion tracked in project management</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {Object.keys(categoryMilestones).length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        <CheckSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                        <p>No milestones defined yet</p>
                        <p className="text-sm">Add line items to create category-based milestones</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="adjustments" className="space-y-4 pt-4">
                <div className="bg-slate-50 rounded-lg p-4 space-y-4">
                  <h4 className="font-semibold text-slate-900">Overall Adjustment</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="overall_adjustment">Adjustment Amount ($)</Label>
                      <Input
                        id="overall_adjustment"
                        type="number"
                        step="0.01"
                        value={formData.overall_adjustment || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, overall_adjustment: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                        disabled={isLocked} />

                      <p className="text-xs text-slate-500">
                        Enter negative amount for discount, positive for additional charges
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="overall_adjustment_reason" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Reason for Adjustment</Label>
                      <Input
                        id="overall_adjustment_reason"
                        value={formData.overall_adjustment_reason || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, overall_adjustment_reason: e.target.value }))}
                        placeholder="e.g., Early payment discount, Rush charge"
                        disabled={isLocked} />

                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="totals" className="space-y-4 pt-4">
                <div className="bg-slate-50 rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-slate-500" />
                    Financial Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-slate-500 font-medium">Subtotal</p>
                      <p className="text-xl font-bold text-slate-800">
                        ${(formData.subtotal || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-slate-500 font-medium">Tax ({((businessSettings?.tax_rate || 0.08) * 100).toFixed(1)}%)</p>
                      <p className="text-xl font-bold text-slate-800">
                        ${(formData.tax_amount || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-slate-500 font-medium">Overall Adjustment</p>
                      <p className={`text-xl font-bold ${(formData.overall_adjustment || 0) < 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                        ${(formData.overall_adjustment || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-slate-500 font-medium">Total Estimate</p>
                      <p className="text-xl font-bold text-slate-800">
                        ${(formData.total_after_adjustments || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4 mt-4">
                    <h4 className="text-md font-semibold text-slate-700 flex items-center mb-3">
                      <Calculator className="w-4 h-4 mr-2 text-slate-500" />
                      Profitability Metrics
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-slate-500 font-medium">Total Direct Costs</p>
                        <p className="text-xl font-bold text-slate-800">
                          ${(profitability.totalCost - profitability.indirectCostApplied - profitability.salesFeeApplied).toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-slate-500 font-medium">Total Cost (incl. Indirect)</p>
                        <p className="text-xl font-bold text-slate-800">
                          ${profitability.totalCost.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-slate-500 font-medium">Gross Profit Margin</p>
                        <p className={`text-xl font-bold ${grossProfitMargin < (businessSettings?.minimum_profit_margin * 100 || 0) ? 'text-red-600' : 'text-slate-800'}`}>
                          {grossProfitMargin.toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-slate-500 font-medium">Net Profit</p>
                        <p className={`text-xl font-bold ${profitability.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          ${profitability.profit.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4 mt-4">
                    <h4 className="text-md font-semibold text-slate-700 flex items-center mb-3">
                      <Info className="w-4 h-4 mr-2 text-slate-500" />
                      Internal Budgeting (Not shown to client)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-slate-500 font-medium">Partner Fee ({PARTNER_FEE_RATES[businessSettings?.subscription_type] * 100 || 0}%)</p>
                        <p className="text-xl font-bold text-slate-800">
                          ${partnerFee.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-slate-500 font-medium">Net Profit Margin</p>
                        <p className={`text-xl font-bold ${netProfitMargin < (businessSettings?.minimum_profit_margin * 100 || 0) ? 'text-red-600' : 'text-emerald-600'}`}>
                          {netProfitMargin.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {isMarginError &&
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Profit Margin Too Low</AlertTitle>
                    <AlertDescription>
                      The current NET profit margin of {netProfitMargin.toFixed(1)}% is below the required minimum of {(businessSettings?.minimum_profit_margin * 100).toFixed(1)}%. Please adjust pricing or discounts to meet profitability goals. Note: This calculation includes the {
                        (PARTNER_FEE_RATES[businessSettings?.subscription_type] * 100 || 0).toFixed(0)
                      }% subscription sales fee as a cost.
                    </AlertDescription>
                  </Alert>
                }
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}>

                <X className="w-4 h-4 mr-2" />
                {isLocked ? 'Close' : 'Cancel'}
              </Button>
              {!isLocked &&
                <Button
                  type="submit"
                  disabled={isSubmitting || isMarginError}
                  className="bg-emerald-600 hover:bg-emerald-700">

                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Saving...' : estimate ? 'Update Estimate' : 'Create Estimate'}
                </Button>
              }
            </div>
          </form>

          {isCatalogOpen &&
            <CatalogSelector
              isOpen={isCatalogOpen}
              onClose={() => setIsCatalogOpen(false)}
              products={products}
              onAddItems={handleAddFromCatalog} />

          }
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
