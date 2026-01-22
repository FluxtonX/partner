
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, Search, X } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"; // Added table components

export default function CatalogSelector({ isOpen, onClose, products, onAddItems }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState({}); // { productId: { product, quantity } }

  useEffect(() => {
    setFilteredProducts(
      products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );
  }, [searchTerm, products]);
  
  // Reset state when modal is opened/closed
  useEffect(() => {
    if (!isOpen) {
        setSearchTerm('');
        setSelectedItems({});
    }
  }, [isOpen]);

  const handleSelect = (product, checked) => {
    const newSelectedItems = { ...selectedItems };
    if (checked) {
      newSelectedItems[product.id] = { product, quantity: 1 };
    } else {
      delete newSelectedItems[product.id];
    }
    setSelectedItems(newSelectedItems);
  };

  const handleQuantityChange = (productId, quantity) => {
    const newSelectedItems = { ...selectedItems };
    if (newSelectedItems[productId]) {
      newSelectedItems[productId].quantity = parseInt(quantity, 10) || 1;
      setSelectedItems(newSelectedItems);
    }
  };

  const handleAddClick = () => {
    const itemsToAdd = Object.values(selectedItems).map(item => {
      // Ensure hours field is included, defaulting to 0 if not present
      return {
        product: {
          ...item.product,
          hours: item.product.hours || 0
        },
        quantity: item.quantity
      };
    });
    
    onAddItems(itemsToAdd);
    onClose();
  };

  const selectedCount = Object.keys(selectedItems).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Items from Catalog</DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="mt-4">
          <div className="border rounded-lg overflow-auto max-h-[50vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] min-w-[50px]">Select</TableHead>
                  <TableHead className="w-[150px] min-w-[150px]">Name</TableHead>
                  <TableHead className="w-[250px] min-w-[250px]">Description</TableHead>
                  <TableHead className="w-[120px] min-w-[120px]">Price</TableHead>
                  <TableHead className="w-[100px] min-w-[100px] text-right">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => {
                    const isSelected = !!selectedItems[product.id];
                    return (
                      <TableRow key={product.id} className={`${isSelected ? 'bg-blue-50' : ''}`}>
                        <TableCell className="py-2">
                          <Checkbox
                            id={`product-${product.id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelect(product, checked)}
                          />
                        </TableCell>
                        <TableCell className="font-medium py-2">
                          <Label htmlFor={`product-${product.id}`} className="cursor-pointer">
                            {product.name}
                          </Label>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 py-2">
                          {product.description || '-'}
                        </TableCell>
                        <TableCell className="py-2">
                          ${(product.unit_price || 0).toFixed(2)} / {product.unit}
                        </TableCell>
                        <TableCell className="text-right py-2">
                          {isSelected && (
                            <Input
                              type="number"
                              min="1"
                              value={selectedItems[product.id]?.quantity || 1}
                              onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                              className="w-24 h-9 text-center"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                      No products found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleAddClick} disabled={selectedCount === 0}>
            <Plus className="w-4 h-4 mr-2" />
            Add {selectedCount > 0 ? `${selectedCount} Item(s)` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
