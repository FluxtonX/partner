
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Plus, Library, Calculator, Loader2, FileText, DollarSign, ExternalLink, CheckCircle2 } from 'lucide-react';
import { ProductOrService, User, BusinessSettings, Project, Client } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const ResponsiveNumberCell = ({ value, className = "", prefix = "", suffix = "" }) => {
    const cellRef = React.useRef(null);
    const [fontSize, setFontSize] = React.useState('text-sm');
    
    React.useEffect(() => {
        if (cellRef.current && (value !== null && value !== undefined)) {
            const text = `${prefix}${typeof value === 'number' ? value.toLocaleString() : value}${suffix}`;
            const textLength = text.length;
            
            // Adjust font size based on content length
            if (textLength > 12) {
                setFontSize('text-xs');
            } else if (textLength > 8) {
                setFontSize('text-sm');
            } else {
                setFontSize('text-sm');
            }
        }
    }, [value, prefix, suffix]);
    
    const displayValue = value !== null && value !== undefined 
        ? (typeof value === 'number' ? value.toLocaleString() : value) 
        : '—';
    
    return (
        <div ref={cellRef} className={`${fontSize} font-medium truncate ${className}`} title={`${prefix}${displayValue}${suffix}`}>
            {prefix}{displayValue}{suffix}
        </div>
    );
};

export default function MaterialListTable({ materials }) {
    const [addedToCatalog, setAddedToCatalog] = useState([]); // Renamed from addedItems
    const [currentUser, setCurrentUser] = useState(null);
    const [businessSettings, setBusinessSettings] = useState(null);
    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [isCreatingEstimate, setIsCreatingEstimate] = useState(false); // Controls the "Create Estimate" button loading state
    const navigate = useNavigate();
    const [isPricing, setIsPricing] = useState(false); // Controls the pricing dialog visibility
    const [pricingProgress, setPricingProgress] = useState(0);
    const [pricingStatusText, setPricingStatusText] = useState('');

    // New states for the new table functionality
    const [selectedItems, setSelectedItems] = useState([]); // Stores indices of selected materials
    const [pricingData, setPricingData] = useState({}); // Stores pricing results by index { index: { unit_price, link, supplier, notes } }
    const [loadingPricing, setLoadingPricing] = useState(null); // Index of material being priced
    const [addedToEstimate, setAddedToEstimate] = useState([]); // Stores indices of items successfully added to the estimate

    React.useEffect(() => {
        const loadUserAndSettings = async () => {
            try {
                const user = await User.me();
                setCurrentUser(user);
                
                const [settings, clientsData] = await Promise.all([
                    BusinessSettings.filter({ business_id: user.current_business_id }),
                    Client.list() // Fetch all clients for the business
                ]);
                
                setBusinessSettings(settings.length > 0 ? settings[0] : null);
                setClients(clientsData);
            } catch (error) {
                console.error('Error loading user data:', error);
                toast.error('Failed to load user data or business settings.');
            }
        };
        
        loadUserAndSettings();
    }, []);

    const handleSelectAll = () => {
        if (selectedItems.length === materials.length) {
            setSelectedItems([]); // Deselect all
        } else {
            setSelectedItems(materials.map((_, index) => index)); // Select all
        }
    };

    const handleItemSelect = (index) => {
        setSelectedItems(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const handleGetPricing = async (index) => {
        setLoadingPricing(index);
        const material = materials[index];
        try {
            const result = await getSingleItemPricing(material);
            setPricingData(prev => ({
                ...prev,
                [index]: result
            }));
            toast.success(`Pricing obtained for "${material.item_name}".`);
        } catch (error) {
            console.error('Error getting pricing:', error);
            toast.error(`Failed to get pricing for "${material.item_name}".`);
            // Ensure pricingData still gets a default even on error
            setPricingData(prev => ({
                ...prev,
                [index]: { unit_price: 0, best_purchasing_link: '', supplier_suggestions: '', notes: 'Error getting price.' }
            }));
        } finally {
            setLoadingPricing(null);
        }
    };

    const handleAddToCatalog = async (index) => { // Changed signature
        if (!currentUser?.current_business_id) {
            toast.error("Could not identify your business. Please ensure you are logged in correctly.");
            return;
        }

        const material = materials[index]; // Get material by index

        try {
            const newProduct = {
                business_id: currentUser.current_business_id,
                name: material.item_name,
                description: `Generated from blueprint. Specifications: ${material.specifications || 'N/A'}`,
                type: 'non_inventory_materials',
                unit_price: 0, // Default price, user should update
                labor_cost: 0,
                material_cost: 0,
                unit: material.unit,
                category: material.category || 'uncategorized',
            };
            
            await ProductOrService.create(newProduct);
            
            toast.success(`"${material.item_name}" added to your product catalog.`);
            setAddedToCatalog(prev => [...prev, index]); // Update addedToCatalog

        } catch (error) {
            console.error("Failed to add to catalog:", error);
            toast.error(`Failed to add "${material.item_name}" to catalog.`, {
                description: error.message
            });
        }
    };
    
    const handleAddAllToCatalog = async () => {
        if (!currentUser?.current_business_id) {
            toast.error("Could not identify your business. Please ensure you are logged in correctly.");
            return;
        }

        // Only add items that are not already in catalog
        const itemsToProcess = materials.map((material, index) => ({ material, originalIndex: index }))
                                     .filter(({ originalIndex }) => !addedToCatalog.includes(originalIndex));

        if (itemsToProcess.length === 0) {
            toast.info("All items from this list have already been added to your catalog.");
            return;
        }
        
        toast.info(`Adding ${itemsToProcess.length} items to your catalog...`);
        
        let successCount = 0;
        const newAddedIndices = [];

        for (const { material, originalIndex } of itemsToProcess) {
            try {
                await ProductOrService.create({
                    business_id: currentUser.current_business_id,
                    name: material.item_name,
                    description: `Generated from blueprint. Specifications: ${material.specifications || 'N/A'}`,
                    type: 'non_inventory_materials',
                    unit_price: 0,
                    unit: material.unit,
                    category: material.category || 'uncategorized',
                });
                successCount++;
                newAddedIndices.push(originalIndex);
            } catch (error) {
                console.error(`Failed to add item ${material.item_name}:`, error);
                toast.error(`Failed to add "${material.item_name}".`);
            }
        }

        setAddedToCatalog(prev => [...prev, ...newAddedIndices]);
        toast.success(`Successfully added ${successCount} out of ${itemsToProcess.length} items to your catalog.`);
    }

    const getSingleItemPricing = async (material) => {
        if (!businessSettings) {
            toast.error("Business settings not loaded. Cannot get pricing data.");
            return { unit_price: 10, best_purchasing_link: '', supplier_suggestions: 'Local Supplier', notes: 'Default price used.' };
        }

        const businessLocation = `${businessSettings.business_address || ''}, ${businessSettings.business_state || ''}`.trim();
        const currency = businessSettings.currency || 'USD';
        
        try {
            const materialDescription = `${material.item_name} (${material.quantity} ${material.unit}${material.specifications ? `, ${material.specifications}` : ''})`;

            const prompt = `You are a procurement assistant. Your task is to find the contractor cost for a specific construction material.

Material: ${materialDescription}
Location: ${businessLocation}
Currency: ${currency}

CRITICAL INSTRUCTIONS:
1. Find the typical market **cost per unit** that a contractor would pay (not the retail/selling price).
2. If you find a price, you MUST return it in the \`unit_price\` field.
3. If you CANNOT find a price, you MUST return a \`unit_price\` of 0 and explain why in the \`notes\` field. DO NOT return an error or an empty response.
4. If possible, also provide a purchasing link, supplier suggestions, and any other notes.

Your response MUST be a JSON object matching the requested schema.`;

            const pricingData = await InvokeLLM({
                prompt: prompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        item_name: { type: "string" },
                        unit_price: { type: "number", description: "The cost per unit for the contractor. MUST be 0 if no price is found." },
                        best_purchasing_link: { type: "string", description: "Direct URL to purchase the item." },
                        supplier_suggestions: { type: "string" },
                        notes: { type: "string", description: "Notes on pricing, alternatives, or reason if price not found." }
                    },
                    required: ["item_name", "unit_price"]
                }
            });

            if (pricingData?.unit_price === 0) {
                toast.warning(`Could not find a price for "${material.item_name}". Using default.`, {
                    description: pricingData.notes || "No reason provided."
                });
                return { unit_price: 10, best_purchasing_link: '', supplier_suggestions: 'Local Supplier', notes: 'AI could not find a price. Default used.' };
            }

            return pricingData || { unit_price: 10, best_purchasing_link: '', supplier_suggestions: 'Local Supplier', notes: 'Default price used.' };
        } catch (error) {
            console.error(`Error getting pricing for ${material.item_name}:`, error);
            // Don't show toast for every error, it can be too many. Just return default.
            return { unit_price: 10, best_purchasing_link: '', supplier_suggestions: 'Local Supplier', notes: 'Default price used after error.' };
        }
    };

    const handleCreateEstimate = async () => {
        if (!currentUser?.current_business_id) {
            toast.error("Could not identify your business. Please ensure you are logged in correctly.");
            return;
        }

        if (!selectedClientId) {
            toast.error("Please select a client for this estimate.");
            return;
        }

        if (selectedItems.length === 0) {
            toast.error("Please select at least one material to create an estimate.");
            return;
        }

        setIsCreatingEstimate(true); // Disable the button immediately
        setIsPricing(true); // Show the pricing dialog
        setPricingProgress(0);
        setPricingStatusText('Initializing pricing process...');
        
        const existingProducts = await ProductOrService.filter({ business_id: currentUser.current_business_id });
        let allProducts = [...existingProducts]; // Keep track of products including newly created ones
        const finalLineItems = [];
        const newAddedToEstimateIndices = [];

        try {
            for (let i = 0; i < selectedItems.length; i++) {
                const originalIndex = selectedItems[i]; // Get the original index from the selected items
                const material = materials[originalIndex]; // Get the material from the original list
                
                const progress = ((i + 1) / selectedItems.length) * 100;
                
                setPricingProgress(progress);
                setPricingStatusText(`Pricing item ${i + 1} of ${selectedItems.length}: ${material.item_name}`);
                
                // Get pricing for the single material. Prioritize existing pricingData.
                const itemPricingData = pricingData[originalIndex] || await getSingleItemPricing(material);

                const materialCost = itemPricingData.unit_price || 10; // This is the COST from the LLM.
                const markup = businessSettings?.materials_markup || 0;
                const unitPrice = materialCost * (1 + markup); // This is the SELLING PRICE.
                
                let matchedProduct = allProducts.find(p => 
                    p.name.toLowerCase().includes(material.item_name.toLowerCase()) ||
                    material.item_name.toLowerCase().includes(p.name.toLowerCase())
                );

                if (matchedProduct) {
                    // If product exists, update its pricing, supplier, and link
                    const updatedProduct = await ProductOrService.update(matchedProduct.id, {
                        material_cost: materialCost,
                        unit_price: unitPrice,
                        supplier: itemPricingData.supplier_suggestions,
                        supplier_part_number: itemPricingData.best_purchasing_link,
                        description: `Auto-generated from blueprint. ${material.specifications || ''}${itemPricingData.notes ? ` ${itemPricingData.notes}` : ''}`.trim(),
                    });
                    // Update the product in our local allProducts array
                    allProducts = allProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p);
                    matchedProduct = updatedProduct; // Use the updated object for line item
                } else {
                    // If product does not exist, create a new one
                    const newProduct = {
                        business_id: currentUser.current_business_id,
                        name: material.item_name,
                        description: `Auto-generated from blueprint. ${material.specifications || ''}${itemPricingData.notes ? ` ${itemPricingData.notes}` : ''}`.trim(),
                        type: 'non_inventory_materials',
                        unit_price: unitPrice,
                        material_cost: materialCost,
                        labor_cost: 0,
                        hours: 0,
                        unit: material.unit,
                        category: material.category || 'project', // Default category
                        required_labor_type_name: 'Office', // Assign 'Office' as requested
                        supplier: itemPricingData.supplier_suggestions || businessSettings?.business_name || 'Local Supplier',
                        supplier_part_number: itemPricingData.best_purchasing_link || '', // Store the link
                    };
                    matchedProduct = await ProductOrService.create(newProduct);
                    allProducts.push(matchedProduct); // Add new product to our local array
                }
                
                const quantity = material.quantity || 1;
                finalLineItems.push({
                    id: `takeoff_${originalIndex}`, // Use original index for unique ID
                    product_service_id: matchedProduct.id,
                    description: matchedProduct.name,
                    base_quantity: quantity,
                    quantity: quantity,
                    unit_price: matchedProduct.unit_price, // Selling price
                    cost_price: matchedProduct.material_cost, // Contractor's cost
                    total: matchedProduct.unit_price * quantity,
                    taxable: true,
                    type: matchedProduct.type,
                    category: matchedProduct.category,
                });
                newAddedToEstimateIndices.push(originalIndex); // Mark this item as added to estimate
            }

            setPricingStatusText('Finalizing estimate...');
            const subtotal = finalLineItems.reduce((sum, item) => sum + item.total, 0);
            const totalMaterialCost = finalLineItems.reduce((sum, item) => sum + (item.cost_price * item.quantity), 0); // Sum of actual material costs
            
            const taxRate = businessSettings?.tax_rate || 0;
            const taxAmount = subtotal * taxRate;
            const totalAfterAdjustments = subtotal + taxAmount;

            // Create the estimate project with the selected client
            const newEstimateData = {
                title: `Material Takeoff Estimate - ${new Date().toLocaleDateString()}`,
                description: `Auto-generated estimate from blueprint analysis. Contains ${selectedItems.length} materials.`,
                status: 'estimate',
                business_id: currentUser.current_business_id, 
                client_id: selectedClientId, 
                line_items: finalLineItems,
                subtotal: subtotal,
                tax_amount: taxAmount,
                total_after_adjustments: totalAfterAdjustments,
                estimated_cost: totalAfterAdjustments,
                estimated_materials_cost: totalMaterialCost, // Use the calculated actual material cost
                estimated_labor_cost: 0,
                project_type: 'construction'
            };

            const newEstimate = await Project.create(newEstimateData);
            
            // Generate barcode
            const barcode = `EST-${newEstimate.id.slice(-6).toUpperCase()}`;
            await Project.update(newEstimate.id, { barcode });

            toast.success(`Estimate created successfully with ${selectedItems.length} priced materials!`);
            setAddedToEstimate(prev => [...prev, ...newAddedToEstimateIndices]); // Update state
            setSelectedItems([]); // Clear selection after creating estimate
            
            // Navigate to estimates page with a refresh parameter to ensure data reload
            navigate(createPageUrl(`Estimates?refresh=${Date.now()}`));

        } catch (error) {
            console.error('Error creating estimate:', error);
            toast.error('Failed to create estimate during pricing process.', {
                description: error.message
            });
        } finally {
            setIsPricing(false); // Hide pricing dialog
            setIsCreatingEstimate(false); // Enable the button again
        }
    };

    if (!materials || materials.length === 0) return null;

    return (
        <>
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button 
                        onClick={handleCreateEstimate} 
                        disabled={!selectedClientId || isCreatingEstimate || selectedItems.length === 0} // Disable if no client or no items selected
                    >
                        {isCreatingEstimate ? (
                           <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Creating...</>
                        ) : (
                           <><Calculator className="mr-2 h-4 w-4" /> Create Estimate ({selectedItems.length})</>
                        )}
                    </Button>
                    <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                        <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder="Select a client to create estimate..." />
                        </SelectTrigger>
                        <SelectContent>
                            {clients.length === 0 ? (
                                <SelectItem value={null} disabled>No clients found.</SelectItem>
                            ) : (
                                clients.map(client => (
                                    <SelectItem key={client.id} value={client.id}>
                                        {client.contact_person || client.company_name || client.email || `Client ID: ${client.id.slice(0, 6)}`}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col items-end">
                    <CardTitle>Generated Material List</CardTitle>
                    <CardDescription>Review the items below. You can add them to your catalog or create an estimate directly.</CardDescription>
                    <Button onClick={handleAddAllToCatalog} variant="outline" className="mt-2">
                        <Library className="mr-2 h-4 w-4" /> Add All to Catalog
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-8">
                                    <Checkbox
                                    checked={selectedItems.length === materials.length && materials.length > 0}
                                    onCheckedChange={handleSelectAll}
                                    />
                                </TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead className="w-20">Qty</TableHead>
                                <TableHead className="w-20">Unit</TableHead>
                                <TableHead className="w-32">Unit Price</TableHead>
                                <TableHead className="w-32">Total</TableHead>
                                <TableHead className="w-24">Status</TableHead>
                                <TableHead className="w-20">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {materials.map((material, index) => (
                                <TableRow key={index} className="hover:bg-slate-50/50">
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedItems.includes(index)}
                                            onCheckedChange={() => handleItemSelect(index)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-slate-900 text-sm">{material.item_name}</p>
                                            {material.specifications && (
                                                <p className="text-xs text-slate-600 mt-1">{material.specifications}</p>
                                            )}
                                            {material.page_reference && (
                                                <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                                                    <FileText className="w-3 h-3" />
                                                    {material.page_reference}
                                                </div>
                                            )}
                                            {material.category && (
                                                <p className="text-xs text-slate-500 mt-1 capitalize">Category: {material.category?.replace(/_/g, ' ')}</p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <ResponsiveNumberCell value={material.quantity} />
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-slate-600">{material.unit}</span>
                                    </TableCell>
                                    <TableCell>
                                        {pricingData[index] && pricingData[index].unit_price !== undefined ? (
                                            <ResponsiveNumberCell 
                                                value={pricingData[index].unit_price} 
                                                prefix="$" 
                                                className="text-green-700"
                                            />
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleGetPricing(index)}
                                                disabled={loadingPricing === index}
                                                className="h-8 text-xs"
                                            >
                                                {loadingPricing === index ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <>
                                                        <DollarSign className="w-3 h-3 mr-1" />
                                                        Get Price
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {pricingData[index] && pricingData[index].unit_price !== undefined ? (
                                            <ResponsiveNumberCell 
                                                value={(material.quantity * pricingData[index].unit_price)} 
                                                prefix="$" 
                                                className="text-emerald-700 font-semibold"
                                            />
                                        ) : (
                                            <span className="text-slate-400 text-sm">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {addedToEstimate.includes(index) ? (
                                            <Badge className="bg-green-100 text-green-800 text-xs">
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                Added
                                            </Badge>
                                        ) : addedToCatalog.includes(index) ? (
                                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                                                <Library className="w-3 h-3 mr-1" />
                                                In Catalog
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-xs">
                                                Pending
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            {!addedToCatalog.includes(index) && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleAddToCatalog(index)}
                                                    className="h-8 w-8 p-0"
                                                    title="Add to catalog"
                                                >
                                                    <Library className="w-3 h-3" />
                                                </Button>
                                            )}
                                            {pricingData[index]?.best_purchasing_link && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => window.open(pricingData[index].best_purchasing_link, '_blank')}
                                                    className="h-8 w-8 p-0"
                                                    title="Visit supplier"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
        {/* Pricing Progress Dialog */}
        <Dialog open={isPricing}>
            <DialogContent onInteractOutside={(e) => e.preventDefault()} hideCloseButton>
                <DialogHeader>
                    <DialogTitle>Getting Local Pricing & Building Estimate</DialogTitle>
                    <DialogDescription>
                        This process may take a few minutes. Please don't close this window.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <Progress value={pricingProgress} className="w-full" />
                    <p className="text-center text-sm text-slate-600 mt-2 h-4">{pricingStatusText}</p>
                </div>
            </DialogContent>
        </Dialog>
        </>
    );
}
