import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Star, 
  ExternalLink, 
  Package, 
  DollarSign, 
  Truck, 
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  Info
} from 'lucide-react';
import { searchVendorProducts } from '@/api/functions';
import { toast } from 'sonner';

export default function VendorProductSearch({ 
  onProductSelect, 
  searchKeywords = '', 
  category = '',
  className = ''
}) {
  const [searchTerm, setSearchTerm] = useState(searchKeywords);
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (searchKeywords && searchKeywords.length > 2) {
      handleSearch(searchKeywords);
    }
  }, [searchKeywords]);

  const handleSearch = async (keywords = searchTerm) => {
    if (!keywords || keywords.trim().length < 2) {
      toast.error('Please enter at least 2 characters to search');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const response = await searchVendorProducts({
        keywords: keywords.trim(),
        category,
        maxResults: 20
      });

      if (response.data?.success) {
        setResults(response.data.results || []);
        if (response.data.results?.length === 0) {
          toast.info('No vendor products found for your search');
        }
      } else {
        throw new Error(response.data?.error || 'Search failed');
      }
    } catch (error) {
      console.error('Vendor search error:', error);
      toast.error('Failed to search vendor products');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleProductSelect = (product) => {
    const productData = {
      name: product.name,
      description: product.description,
      unit_price: product.vendor_price,
      material_cost: product.vendor_price,
      unit: product.unit || 'Each',
      supplier: product.vendorName,
      supplier_part_number: product.sku,
      supplier_url: product.vendor_url,
      image_urls: product.image_url ? [product.image_url] : [],
      vendor_data: {
        vendor_id: product.vendorId,
        vendor_product_id: product.vendor_product_id,
        brand: product.brand,
        model_number: product.model_number,
        stock_quantity: product.stock_quantity,
        in_stock: product.in_stock
      }
    };

    onProductSelect(productData);
    toast.success(`Added "${product.name}" from ${product.vendorName}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price || 0);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-emerald-800 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Vendor Product Search
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Input
              placeholder="Search vendor catalogs (e.g., 'PVC pipe', 'copper fittings')"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="bg-white"
            />
            <Button 
              onClick={() => handleSearch()}
              disabled={isSearching || searchTerm.length < 2}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          {hasSearched && !isSearching && (
            <div className="mt-3">
              {results.length > 0 ? (
                <p className="text-xs text-emerald-700">
                  Found {results.length} products from vendor catalogs
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  No vendor products found. You can still create products manually.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-slate-700 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Vendor Products ({results.length})
          </h4>
          
          <div className="grid gap-3 max-h-96 overflow-y-auto">
            {results.map((product, index) => (
              <Card key={`${product.vendorId}-${product.vendor_product_id}-${index}`} className="border-slate-200 hover:border-emerald-300 transition-colors">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400" style={{ display: product.image_url ? 'none' : 'flex' }}>
                        <Package className="w-6 h-6" />
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-slate-800 truncate">{product.name}</h5>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {product.vendorName}
                            </Badge>
                            {product.isPremium && (
                              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs">
                                <Star className="w-2 h-2 mr-1" />
                                Premium
                              </Badge>
                            )}
                            <Badge variant={product.in_stock ? "default" : "destructive"} className="text-xs">
                              {product.in_stock ? (
                                <><CheckCircle className="w-2 h-2 mr-1" />In Stock</>
                              ) : (
                                <><XCircle className="w-2 h-2 mr-1" />Out of Stock</>
                              )}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-emerald-600">
                            {formatPrice(product.vendor_price)}
                          </div>
                          <div className="text-xs text-slate-500">
                            per {product.unit || 'each'}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          {product.sku && (
                            <span>SKU: {product.sku}</span>
                          )}
                          {product.brand && (
                            <span>Brand: {product.brand}</span>
                          )}
                          {product.stock_quantity && (
                            <span>{product.stock_quantity} available</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {product.vendor_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(product.vendor_url, '_blank')}
                              className="text-xs h-7 px-2"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => handleProductSelect(product)}
                            className="text-xs h-7 px-3 bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Use This
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs">
          Search vendor catalogs to automatically populate product details and pricing. 
          You can use these as a starting point and adjust costs as needed for your business.
        </AlertDescription>
      </Alert>
    </div>
  );
}