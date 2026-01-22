
import React, { useState, useEffect, useRef } from 'react';
import { ProductOrService, User, BusinessSettings } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Package, Edit, Trash2, Clock, Wrench, Boxes, Upload, CheckCircle, X, Calculator, Loader2, DollarSign, ExternalLink, Search } from 'lucide-react';
import { InvokeLLM } from '@/api/integrations';
import ProductServiceForm from '../components/products/ProductServiceForm';
import ProductImporter from '../components/products/ProductImporter';
import BarcodeDisplay from '../components/products/BarcodeDisplay';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { verifyUrl } from "@/api/functions";

export default function ProductsServicesPage() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [businessSettings, setBusinessSettings] = useState(null);
  const [recalculatingId, setRecalculatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // New state for quick edit functionality
  const [quickEditItem, setQuickEditItem] = useState(null);
  const [quickEditField, setQuickEditField] = useState('');
  const [quickEditValue, setQuickEditValue] = useState('');

  // New state for delete confirmation dialog
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); // For single item delete loading state

  // New state for bulk selection
  const [selectedItems, setSelectedItems] = useState([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false); // For bulk delete loading state

  // New state for fetching pricing functionality (remains here as logic is here, form handles its own loading state for its button)
  const [fetchingPricingId, setFetchingPricingId] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      const [data, settingsData] = await Promise.all([
      ProductOrService.filter({ business_id: user.current_business_id }, '-created_date'),
      BusinessSettings.filter({ business_id: user.current_business_id })]
      );

      setItems(data);
      if (settingsData.length > 0) {
        setBusinessSettings(settingsData[0]);
      } else {
        setBusinessSettings({ labor_markup: 0, materials_markup: 0 }); // Default or empty settings
      }

    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load initial data.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadItems = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const data = await ProductOrService.filter({ business_id: currentUser.current_business_id }, '-created_date');
      setItems(data);
    } catch (error) {
      console.error('Error reloading products/services:', error);
      toast.error('Failed to reload products/services.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (item) => { // Changed to pass item object
    setDeletingItem(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;

    setIsDeleting(true); // Start loading for single delete
    try {
      await ProductOrService.delete(deletingItem.id);
      toast.success(`${deletingItem.name} deleted successfully!`); // Use item name in toast
      loadItems();
      // Remove from selected items if it was selected
      setSelectedItems(prev => prev.filter(id => id !== deletingItem.id));
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error("Failed to delete item. Please try again.");
    } finally {
      setIsDeleting(false); // End loading
      setShowDeleteConfirm(false);
      setDeletingItem(null);
    }
  };

  // Bulk selection functions
  const handleSelectItem = (itemId, checked) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(filteredItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) {
      toast.error("Please select items to delete");
      return;
    }
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    setIsBulkDeleting(true); // Start loading for bulk delete
    setShowBulkDeleteConfirm(false); // Close dialog immediately

    toast.info(`Deleting ${selectedItems.length} items. This may take a few minutes...`);

    try {
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < selectedItems.length; i++) {
        const itemId = selectedItems[i];
        try {
          await ProductOrService.delete(itemId);
          successCount++;
          if ((i + 1) % 5 === 0 && i + 1 < selectedItems.length) {
            toast.info(`Deleted ${successCount} of ${selectedItems.length} items...`);
          }
        } catch (error) {
          console.error(`Error deleting item ${itemId}:`, error);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully deleted ${successCount} item${successCount > 1 ? 's' : ''}!`);
      }
      if (failCount > 0) {
        toast.error(`Failed to delete ${failCount} item${failCount > 1 ? 's' : ''}. Please refresh and try again.`);
      }

      setSelectedItems([]);
      loadItems();
    } catch (error) {
      console.error('Error in bulk delete:', error);
      toast.error("Failed to delete items. Please try again.");
    } finally {
      setIsBulkDeleting(false); // End loading
    }
  };

  const handleSubmit = async (itemData) => {
    if (!currentUser) return;
    try {
      if (editingItem) {
        await ProductOrService.update(editingItem.id, itemData);
        toast.success("Item updated successfully!");
      } else {
        const newItemData = { ...itemData, business_id: currentUser.current_business_id };
        const newItem = await ProductOrService.create(newItemData);
        // Ensure barcode is generated and updated for new items if not provided
        if (!newItemData.barcode) {
          const barcode = `PROD-${newItem.id.slice(-6).toUpperCase()}`;
          await ProductOrService.update(newItem.id, { barcode });
        }
        toast.success("New item created successfully!");
      }
      setShowForm(false);
      setEditingItem(null);
      loadItems();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error("Failed to save item. Please try again.");
    }
  };

  const handleRecalculatePrice = async (item) => {
    if (!businessSettings) {
      toast.error("Business settings not loaded. Cannot recalculate.");
      return;
    }

    setRecalculatingId(item.id);

    try {
      const laborCost = parseFloat(item.labor_cost) || 0;
      const materialCost = parseFloat(item.material_cost) || 0;
      const hours = parseFloat(item.hours) || 0;

      const laborMarkup = businessSettings.labor_markup != null ? parseFloat(businessSettings.labor_markup) : 0;
      const materialsMarkup = businessSettings.materials_markup != null ? parseFloat(businessSettings.materials_markup) : 0;

      // Updated formula: ((Labor cost × (1 + Labor Markup)) × Labor Hours Required) + (Material Cost × (1 + Materials Markup))
      // Note: Waste percentage is NOT applied here, only when added to estimates
      const laborComponent = (laborCost * (1 + laborMarkup)) * hours;
      const materialComponent = materialCost * (1 + materialsMarkup);

      const newUnitPrice = laborComponent + materialComponent;

      await ProductOrService.update(item.id, { unit_price: newUnitPrice });
      toast.success("Price recalculated successfully!");
      loadItems();
    } catch (error) {
      console.error('Error recalculating price:', error);
      toast.error('Failed to recalculate price.');
    } finally {
      setRecalculatingId(null);
    }
  };

  const handleGetLocalPricing = async (item) => {
    if (!businessSettings) {
      toast.error("Business settings not loaded. Cannot fetch pricing.");
      return;
    }

    setFetchingPricingId(item.id);

    try {
      const businessLocation = `${businessSettings.business_address || ''}, ${businessSettings.business_state || ''}`.trim();
      const currency = businessSettings.currency || 'USD';

      toast.info(`Fetching current ${currency} pricing for ${item.name}...`);

      const pricingData = await InvokeLLM({
        prompt: `Get current market pricing for this construction material/product in ${businessLocation} area in ${currency} currency:

Product: ${item.name}
Description: ${item.description || 'No description provided'}
Unit: ${item.unit}
Category: ${item.category}

Please provide:
1. The current cost per ${item.unit} that a contractor would pay (wholesale/trade price, not retail)
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
          required: ["item_name", "current_cost_per_unit", "currency"]
        }
      });

      if (pricingData?.current_cost_per_unit) {
        let verifiedLink = null;
        let verifiedSupplier = null;

        toast.info("Verifying supplier links...");

        // Verify the best purchasing link first
        if (pricingData.best_purchasing_link) {
          try {
            const { data: verificationResult } = await verifyUrl({ url: pricingData.best_purchasing_link });
            if (verificationResult?.active) {
              verifiedLink = verificationResult.url; // Use the final URL after redirects
            }
          } catch (error) {
            console.error("Error verifying best purchasing link:", error);
            // Continue even if verification fails for this link
          }
        }

        // Verify supplier websites if no direct link was found or verified
        if (!verifiedLink && Array.isArray(pricingData.suppliers)) {
          for (const supplier of pricingData.suppliers) {
            if (supplier.website) {
              try {
                const { data: verificationResult } = await verifyUrl({ url: supplier.website });
                if (verificationResult?.active) {
                  verifiedSupplier = supplier;
                  verifiedLink = verificationResult.url;
                  break; // Stop after finding the first active one
                }
              } catch (error) {
                console.error("Error verifying supplier website:", error);
                // Continue
              }
            }
          }
        }

        const updatedData = {
          material_cost: pricingData.current_cost_per_unit,
          supplier: verifiedSupplier?.name || pricingData.suppliers?.[0]?.name || businessSettings.business_name || 'Local Supplier',
          description: `${item.description || ''}\n\nPricing updated ${new Date().toLocaleDateString()}: ${pricingData.pricing_notes || 'Current market rate'}\nSuppliers: ${pricingData.suppliers?.map(s => s.name).join(', ') || 'Various'}`.trim()
        };

        if (verifiedLink) {
          updatedData.supplier_part_number = verifiedLink;
          toast.success(`Updated material cost and verified supplier link for "${item.name}"`);
        } else {
          updatedData.supplier_part_number = item.supplier_part_number || ''; // Clear old link if not verified
          toast.warning(`Updated material cost for "${item.name}". Could not verify an active purchasing link.`);
        }

        await ProductOrService.update(item.id, updatedData);

        loadItems();
      } else {
        toast.error('Failed to get pricing data. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching local pricing:', error);
      toast.error('Failed to fetch pricing. Please try again.');
    } finally {
      setFetchingPricingId(null);
    }
  };

  // Quick edit handlers
  const handleQuickEdit = (item, field) => {
    setQuickEditItem({ ...item }); // Store a copy of the item
    setQuickEditField(field);
    setQuickEditValue(item[field] != null ? String(item[field]) : '');
  };

  const saveQuickEdit = async () => {
    if (!quickEditItem || !quickEditField) return;

    try {
      let value = quickEditValue;

      // Parse numeric fields
      if (['unit_price', 'cost_price', 'hours', 'current_stock', 'minimum_stock', 'labor_cost', 'material_cost', 'waste_overage'].includes(quickEditField)) {
        value = parseFloat(quickEditValue);
        if (isNaN(value)) {
          value = 0; // Default to 0 if parsing fails
        }
      }

      await ProductOrService.update(quickEditItem.id, { [quickEditField]: value });
      toast.success("Item updated successfully!");
      setQuickEditItem(null);
      setQuickEditField(''); // Set to null after save
      setQuickEditValue('');
      loadItems(); // Reload items to reflect the update
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error("Failed to update item. Please try again.");
    }
  };

  const cancelQuickEdit = () => {
    setQuickEditItem(null);
    setQuickEditField(''); // Set to null after cancel
    setQuickEditValue('');
  };

  // Helper component for quick editable table cells
  const QuickEditCell = ({ item, field, displayValue, type = 'text' }) => {
    const isEditing = quickEditItem?.id === item.id && quickEditField === field;

    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <Input
            type={type}
            value={quickEditValue}
            onChange={(e) => setQuickEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveQuickEdit();
              if (e.key === 'Escape') cancelQuickEdit();
            }}
            className="h-8 text-sm"
            autoFocus />

          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={saveQuickEdit} title="Save">
            <CheckCircle className="w-3 h-3 text-green-600" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelQuickEdit} title="Cancel">
            <X className="w-3 h-3 text-gray-400" />
          </Button>
        </div>);

    }

    return (
      <div
        className="cursor-pointer hover:bg-gray-100 px-1 py-1 rounded group flex items-center justify-between"
        onClick={() => handleQuickEdit(item, field)}>

        <span>{displayValue}</span>
        <Edit className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100" />
      </div>);

  };

  const filteredItems = items.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      item.name?.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term) ||
      item.barcode?.toLowerCase().includes(term) ||
      item.category?.toLowerCase().includes(term) ||
      item.type?.toLowerCase().replace(/_/g, ' ').includes(term) // Replace underscores for type search
    );
  });

  const typeColors = {
    labor: 'bg-blue-100 text-blue-800 border-blue-200',
    inventory_materials: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    job_supplies: 'bg-orange-100 text-orange-800 border-orange-200',
    non_inventory_materials: 'bg-purple-100 text-purple-800 border-purple-200'
  };

  const typeIcons = {
    labor: <Clock className="w-4 h-4" />,
    inventory_materials: <Package className="w-4 h-4" />,
    job_supplies: <Wrench className="w-4 h-4" />,
    non_inventory_materials: <Boxes className="w-4 h-4" />
  };

  const allSelected = filteredItems.length > 0 && selectedItems.length === filteredItems.length;
  const someSelected = selectedItems.length > 0 && selectedItems.length < filteredItems.length;

  // Helper function to extract purchasing link from description or supplier_part_number
  const getPurchasingLink = (item) => {
    if (item.supplier_part_number && item.supplier_part_number.startsWith('http')) {
      return item.supplier_part_number;
    }

    const linkMatch = item.description?.match(/Purchasing link: (https?:\/\/[^\s]+)/);
    return linkMatch ? linkMatch[1] : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Products & Services</h1>
            <p className="text-slate-600">Manage your catalog of labor, materials, and supplies for estimates and invoices.</p>
          </div>
          <div className="flex gap-2">
            {selectedItems.length > 0 && (
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={isBulkDeleting || selectedItems.length === 0}
              >
                {isBulkDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected ({selectedItems.length})
                  </>
                )}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowImporter(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button
              onClick={() => {setEditingItem(null);setShowForm(true);}}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Item
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              placeholder="Search catalog by name, description, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Item List */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Your Item Catalog
              {selectedItems.length > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {selectedItems.length} selected
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead width="50">
                      <Checkbox
                        checked={allSelected}
                        ref={(ref) => {
                          if (ref) ref.indeterminate = someSelected;
                        }}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all items"
                      />
                    </TableHead>
                    <TableHead width="120">Actions</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Labor Cost</TableHead>
                    <TableHead>Material Cost</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Pricing</TableHead> {/* This column holds recalculate and external link buttons */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : filteredItems.length > 0 ? (
                    filteredItems.map((item) => {
                      const purchasingLink = getPurchasingLink(item);

                      return (
                        <TableRow key={item.id} className={selectedItems.includes(item.id) ? 'bg-blue-50' : ''}>
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.includes(item.id)}
                              onCheckedChange={(checked) => handleSelectItem(item.id, checked)}
                              aria-label={`Select ${item.name}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} title="Edit Item">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(item)} title="Delete Item">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <QuickEditCell
                              item={item}
                              field="name"
                              displayValue={item.name}
                            />
                          </TableCell>
                          <TableCell>
                            <Badge className={`${typeColors[item.type]} border flex items-center gap-1 w-fit`}>
                              {typeIcons[item.type]}
                              {item.type.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <QuickEditCell
                              item={item}
                              field="labor_cost"
                              displayValue={`$${(parseFloat(item.labor_cost) || 0).toFixed(2)}`}
                              type="number"
                            />
                          </TableCell>
                          <TableCell>
                            <QuickEditCell
                              item={item}
                              field="material_cost"
                              displayValue={`$${(parseFloat(item.material_cost) || 0).toFixed(2)}`}
                              type="number"
                            />
                          </TableCell>
                          <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                            <div className="font-semibold text-emerald-600">
                              ${(parseFloat(item.unit_price) || 0).toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <QuickEditCell
                              item={item}
                              field="hours"
                              displayValue={`${item.hours || 0} hrs`}
                              type="number"
                            />
                          </TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>
                            {item.barcode ? (
                              <div className="flex items-center gap-2">
                                <BarcodeDisplay barcode={item.barcode} size="small" />
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.inventory_tracked ? (
                              <div className="flex flex-col">
                                <QuickEditCell
                                  item={item}
                                  field="current_stock"
                                  displayValue={
                                    <span className={`text-sm ${
                                      (parseFloat(item.current_stock) || 0) <= (parseFloat(item.minimum_stock) || 0) ? 'text-red-600 font-medium' : ''
                                    }`}>
                                      {item.current_stock || 0}
                                    </span>
                                  }
                                  type="number"
                                />
                                {(parseFloat(item.current_stock) || 0) <= (parseFloat(item.minimum_stock) || 0) && (
                                  <span className="text-xs text-red-500">Low stock</span>
                                )}
                              </div>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRecalculatePrice(item)}
                                disabled={recalculatingId === item.id}
                                title="Recalculate Price"
                              >
                                {recalculatingId === item.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Calculator className="w-4 h-4 text-blue-600" />
                                )}
                              </Button>
                              {purchasingLink && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => window.open(purchasingLink, '_blank')}
                                  title="View Purchasing Link"
                                >
                                  <ExternalLink className="w-4 h-4 text-purple-600" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-8">
                        {searchTerm ? `No items found matching "${searchTerm}".` : "No items found. Add one to get started."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {showForm && (
          <ProductServiceForm
            item={editingItem}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            onGetLocalPricing={handleGetLocalPricing}
            businessSettings={businessSettings}
            currentUser={currentUser}
            isFetchingPricing={fetchingPricingId}
            onItemsUpdated={loadItems}
          />
        )}

        {showImporter && (
          <ProductImporter
            onClose={() => setShowImporter(false)}
            onImportSuccess={loadItems}
            currentUser={currentUser}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Are you sure you want to delete <strong>{deletingItem?.name}</strong>?</p>
              <p className="text-sm text-slate-600 mt-2">This action cannot be undone.</p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    Delete
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Delete Confirmation Dialog */}
        <Dialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Bulk Deletion</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Are you sure you want to delete <strong>{selectedItems.length}</strong> selected item{selectedItems.length > 1 ? 's' : ''}?</p>
              <p className="text-sm text-slate-600 mt-2">This action cannot be undone and <strong>may take a few minutes</strong> to complete.</p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowBulkDeleteConfirm(false)}
                disabled={isBulkDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmBulkDelete}
                disabled={isBulkDeleting}
              >
                Delete All Selected
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
