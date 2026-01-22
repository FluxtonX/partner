
import React, { useState, useEffect } from 'react';
import { MarketplaceCatalog, MarketplaceItem, ProductOrService, Training, User, UserBusiness, MarketplacePurchase } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Store, Package, GraduationCap, Star, DollarSign, Eye, Users, Search, Filter, TrendingUp, Crown, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/components/providers/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'; // Removed DialogTrigger as it's not directly used here
import { toast } from 'sonner';
import StripePaymentForm from '../components/payments/StripePaymentForm';
import { format } from 'date-fns';
import SuggestedItems from '../components/ads/SuggestedItems';

export default function MarketplacePage() {
  const { t } = useLanguage();
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Publishing State
  const [isPublishing, setIsPublishing] = useState({ products: false, training: false });
  const [marketplaceCatalog, setMarketplaceCatalog] = useState(null); // This is *MY* business's catalog
  
  const [productCatalogPrice, setProductCatalogPrice] = useState('');
  const [productCatalogDescription, setProductCatalogDescription] = useState('');
  const [trainingCatalogPrice, setTrainingCatalogPrice] = useState('');
  const [trainingCatalogDescription, setTrainingCatalogDescription] = useState('');

  const [allProducts, setAllProducts] = useState([]);
  const [allTrainings, setAllTrainings] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState(new Set());
  const [selectedTrainingIds, setSelectedTrainingIds] = new Set();

  // Browse State
  const [browseCatalogs, setBrowseCatalogs] = useState([]); // All published catalogs for browsing
  const [filteredCatalogs, setFilteredCatalogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [catalogTypeFilter, setCatalogTypeFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [salesFilter, setSalesFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured'); // featured, price_low, price_high, rating, sales
  
  // Promotion State
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [promotionType, setPromotionType] = useState(''); // 'products' or 'training'
  const [promotionDuration, setPromotionDuration] = useState(30); // days

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAndSortCatalogs();
  }, [browseCatalogs, searchTerm, catalogTypeFilter, ratingFilter, salesFilter, sortBy]);

  const loadData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);

      const userBusinessLinks = await UserBusiness.filter({ 
        user_email: user.email, 
        business_id: user.current_business_id 
      });
      
      const userIsAdmin = userBusinessLinks.length > 0 && 
        (userBusinessLinks[0].role === 'admin' || userBusinessLinks[0].role === 'owner');
      setIsAdmin(userIsAdmin);

      // Load all published catalogs for browsing (excluding current user's own business catalog for simplicity in this browse view, though it could be included)
      const allPublishedCatalogs = await MarketplaceCatalog.filter({
        $or: [
          { is_product_catalog_published: true },
          { is_training_catalog_published: true }
        ]
      });
      setBrowseCatalogs(allPublishedCatalogs.filter(c => c.business_id !== user.current_business_id)); // Exclude own catalog from browse

      if (userIsAdmin) {
        const [existingCatalogs, products, trainings] = await Promise.all([
          MarketplaceCatalog.filter({ business_id: user.current_business_id }),
          ProductOrService.filter({ business_id: user.current_business_id }),
          Training.list()
        ]);

        setAllProducts(products);
        setAllTrainings(trainings);

        if (existingCatalogs.length > 0) {
          const catalog = existingCatalogs[0];
          setMarketplaceCatalog(catalog); // Set MY business's catalog
          setProductCatalogPrice(catalog.product_catalog_price || '');
          setProductCatalogDescription(catalog.product_catalog_description || '');
          setTrainingCatalogPrice(catalog.training_catalog_price || '');
          setTrainingCatalogDescription(catalog.training_catalog_description || '');
          
          const publishedItems = await MarketplaceItem.filter({ marketplace_catalog_id: catalog.id });
          const publishedProductIds = new Set(publishedItems.filter(item => item.type !== 'training').map(item => item.original_product_id));
          const publishedTrainingIds = new Set(publishedItems.filter(item => item.type === 'training').map(item => item.original_product_id));
          setSelectedProductIds(publishedProductIds);
          setSelectedTrainingIds(publishedTrainingIds);
        }
      }

    } catch (error) {
      console.error('Error loading marketplace data:', error);
      toast.error('Failed to load marketplace data.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortCatalogs = () => {
    let filtered = [...browseCatalogs];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(catalog =>
        catalog.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        catalog.product_catalog_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        catalog.training_catalog_description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply catalog type filter
    if (catalogTypeFilter !== 'all') {
      if (catalogTypeFilter === 'products') {
        filtered = filtered.filter(catalog => catalog.is_product_catalog_published);
      } else if (catalogTypeFilter === 'training') {
        filtered = filtered.filter(catalog => catalog.is_training_catalog_published);
      }
    }

    // Apply rating filter
    if (ratingFilter !== 'all') {
      const minRating = parseFloat(ratingFilter);
      filtered = filtered.filter(catalog => {
        const avgRating = catalogTypeFilter === 'training' 
          ? catalog.training_average_rating 
          : catalog.product_average_rating; // Default to products if 'all' or specific
        if (catalogTypeFilter === 'all') {
            return (catalog.is_product_catalog_published && (catalog.product_average_rating || 0) >= minRating) ||
                   (catalog.is_training_catalog_published && (catalog.training_average_rating || 0) >= minRating);
        }
        return (avgRating || 0) >= minRating;
      });
    }

    // Apply sales filter
    if (salesFilter !== 'all') {
      const minSales = parseInt(salesFilter);
      filtered = filtered.filter(catalog => {
        const totalSales = catalogTypeFilter === 'training' 
          ? catalog.training_total_sales 
          : catalog.product_total_sales; // Default to products if 'all' or specific
        if (catalogTypeFilter === 'all') {
            return (catalog.is_product_catalog_published && (catalog.product_total_sales || 0) >= minSales) ||
                   (catalog.is_training_catalog_published && (catalog.training_total_sales || 0) >= minSales);
        }
        return (totalSales || 0) >= minSales;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'featured':
          // Promoted items first
          const aPromoted = a.promoted_until && new Date(a.promoted_until) > new Date();
          const bPromoted = b.promoted_until && new Date(b.promoted_until) > new Date();
          if (aPromoted && !bPromoted) return -1;
          if (!aPromoted && bPromoted) return 1;
          // Then by average rating (prefer product rating if available, then training)
          const aRatingFeatured = (a.is_product_catalog_published ? (a.product_average_rating || 0) : 0) || (a.is_training_catalog_published ? (a.training_average_rating || 0) : 0);
          const bRatingFeatured = (b.is_product_catalog_published ? (b.product_average_rating || 0) : 0) || (b.is_training_catalog_published ? (b.training_average_rating || 0) : 0);
          return bRatingFeatured - aRatingFeatured;

        case 'price_low':
          const aPrice = catalogTypeFilter === 'training' ? (a.training_catalog_price || Infinity) : (a.product_catalog_price || Infinity);
          const bPrice = catalogTypeFilter === 'training' ? (b.training_catalog_price || Infinity) : (b.product_catalog_price || Infinity);
          return aPrice - bPrice;

        case 'price_high':
          const aPriceHigh = catalogTypeFilter === 'training' ? (a.training_catalog_price || -Infinity) : (a.product_catalog_price || -Infinity);
          const bPriceHigh = catalogTypeFilter === 'training' ? (b.training_catalog_price || -Infinity) : (b.product_catalog_price || -Infinity);
          return bPriceHigh - aPriceHigh;

        case 'rating':
          const aRatingSort = catalogTypeFilter === 'training' ? (a.training_average_rating || 0) : (a.product_average_rating || 0);
          const bRatingSort = catalogTypeFilter === 'training' ? (b.training_average_rating || 0) : (b.product_average_rating || 0);
          return bRatingSort - aRatingSort;

        case 'sales':
          const aSales = catalogTypeFilter === 'training' ? (a.training_total_sales || 0) : (a.product_total_sales || 0);
          const bSales = catalogTypeFilter === 'training' ? (b.training_total_sales || 0) : (b.product_total_sales || 0);
          return bSales - aSales;

        default:
          return 0;
      }
    });

    setFilteredCatalogs(filtered);
  };

  const handlePublish = async (catalogType) => {
    const isProducts = catalogType === 'products';
    const price = isProducts ? productCatalogPrice : trainingCatalogPrice;
    const description = isProducts ? productCatalogDescription : trainingCatalogDescription;
    const selectedIds = isProducts ? selectedProductIds : selectedTrainingIds;
    
    if (!price) {
      toast.error(t('catalog_price_required') || 'Price is required to publish.');
      return;
    }
    if (selectedIds.size === 0) {
      toast.error(t('no_items_selected_error') || 'Please select at least one item to publish.');
      return;
    }
    
    setIsPublishing(prev => ({ ...prev, [catalogType]: true }));

    try {
      // Find or create the master catalog record
      let catalogRecord = marketplaceCatalog;
      if (!catalogRecord) {
        catalogRecord = await MarketplaceCatalog.create({
          business_id: currentUser.current_business_id,
          business_name: currentUser.display_name || currentUser.full_name || 'Business',
        });
      }

      // Prepare data for the specific catalog being published
      const updateData = {};
      let itemsToCreate = [];
      
      if (isProducts) {
        updateData.product_catalog_price = parseFloat(price);
        updateData.product_catalog_description = description;
        updateData.is_product_catalog_published = true;
        
        const productsToPublish = allProducts.filter(p => selectedIds.has(p.id));
        itemsToCreate = productsToPublish.map(p => ({
            marketplace_catalog_id: catalogRecord.id,
            original_product_id: p.id, name: p.name, description: p.description, type: p.type,
            unit_price: p.unit_price, cost_price: p.cost_price, unit: p.unit, category: p.category,
            required_labor_type_name: p.required_labor_type_name, skill_level: p.skill_level,
        }));
      } else { // Training
        updateData.training_catalog_price = parseFloat(price);
        updateData.training_catalog_description = description;
        updateData.is_training_catalog_published = true;
        
        const trainingsToPublish = allTrainings.filter(t => selectedIds.has(t.id));
        itemsToCreate = trainingsToPublish.map(t => ({
            marketplace_catalog_id: catalogRecord.id,
            original_product_id: t.id, name: t.title, description: t.description, type: 'training',
            unit_price: 0, cost_price: 0, unit: 'course', category: t.category, // Assuming unit_price, cost_price for training might be 0 or derived differently
            required_labor_type_name: '', skill_level: t.difficulty_level,
        }));
      }

      // Update the master catalog record
      const updatedCatalog = await MarketplaceCatalog.update(catalogRecord.id, updateData);

      // Delete old items for this type and bulk create new ones
      const oldItems = await MarketplaceItem.filter({ marketplace_catalog_id: catalogRecord.id });
      const oldItemsToDelete = oldItems.filter(item => isProducts ? item.type !== 'training' : item.type === 'training');
      await Promise.all(oldItemsToDelete.map(item => MarketplaceItem.delete(item.id)));
      
      if (itemsToCreate.length > 0) {
        await MarketplaceItem.bulkCreate(itemsToCreate);
      }

      setMarketplaceCatalog(updatedCatalog);
      toast.success(t('catalog_published_success') || 'Your catalog has been published successfully!');
      loadData(); // Refresh all data including browse catalogs

    } catch (error) {
      console.error(`Error publishing ${catalogType} catalog:`, error);
      toast.error(t('catalog_publish_failed') || 'Failed to publish catalog.');
    } finally {
      setIsPublishing(prev => ({ ...prev, [catalogType]: false }));
    }
  };

  const handleUnpublish = async (catalogType) => {
    if (!marketplaceCatalog) return;
    if (!window.confirm(t('confirm_unpublish_catalog') || `Are you sure you want to unpublish your ${catalogType} catalog?`)) return;
    
    setIsPublishing(prev => ({ ...prev, [catalogType]: true }));
    try {
      const updateData = catalogType === 'products' 
        ? { is_product_catalog_published: false }
        : { is_training_catalog_published: false };

      const updatedCatalog = await MarketplaceCatalog.update(marketplaceCatalog.id, updateData);
      setMarketplaceCatalog(updatedCatalog);
      toast.success(t('catalog_unpublished_success') || 'Your catalog has been unpublished.');
      loadData(); // Refresh all data including browse catalogs
    } catch(e) {
      console.error(`Error unpublishing ${catalogType} catalog:`, e);
      toast.error(t('catalog_unpublish_failed') || 'Failed to unpublish catalog.');
    } finally {
      setIsPublishing(prev => ({ ...prev, [catalogType]: false }));
    }
  };

  const handleItemSelection = (itemId, isTraining = false) => {
    const setter = isTraining ? setSelectedTrainingIds : setSelectedProductIds;
    setter(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(itemId)) {
        newSelection.delete(itemId);
      } else {
        newSelection.add(itemId);
      }
      return newSelection;
    });
  };

  const handleSelectAll = (checked, isTraining = false) => {
    const items = isTraining ? allTrainings : allProducts;
    const setter = isTraining ? setSelectedTrainingIds : setSelectedProductIds;
    
    if (checked) {
      const allIds = new Set(items.map(item => item.id));
      setter(allIds);
    } else {
      setter(new Set());
    }
  };

  const handlePromoteClick = (type) => {
    setPromotionType(type);
    setShowPromotionDialog(true);
  };

  const getPromotionPrice = () => {
    const prices = {
      7: 6.99,
      14: 13.99,
      30: 29.99,
      60: 59.99,
      90: 89.99,
    };
    return (prices[promotionDuration] || 0).toFixed(2);
  };

  const handlePromotionPayment = async (paymentIntent) => {
    try {
      if (!marketplaceCatalog?.id) {
        throw new Error("Marketplace catalog not found for promotion.");
      }

      const promotionEndDate = new Date();
      promotionEndDate.setDate(promotionEndDate.getDate() + promotionDuration);

      await MarketplaceCatalog.update(marketplaceCatalog.id, {
        promoted_until: promotionEndDate.toISOString(),
        promotion_type: promotionType,
        promotion_payment_intent_id: paymentIntent.id,
      });

      toast.success(`Your ${promotionType} catalog has been promoted for ${promotionDuration} days!`);
      setShowPromotionDialog(false);
      loadData(); // Refresh data to show promotion status
    } catch (error) {
      console.error('Error processing promotion:', error);
      toast.error('Failed to process promotion. Please try again.');
    }
  };

  const handlePurchaseCatalog = async (catalog, type) => {
    if (!currentUser?.current_business_id) {
      toast.error('You must be logged in to purchase catalogs.');
      return;
    }
    
    try {
      const price = type === 'training' ? catalog.training_catalog_price : catalog.product_catalog_price;
      
      // Simulate purchase logic (in a real app, this would involve a payment gateway)
      // For now, we'll directly create the purchase record and update sales.
      await MarketplacePurchase.create({
        buyer_business_id: currentUser.current_business_id,
        seller_business_id: catalog.business_id,
        marketplace_catalog_id: catalog.id,
        purchased_catalog_type: type, // 'products' or 'training'
        purchase_price: parseFloat(price),
        purchase_date: new Date().toISOString()
      });

      // Update sales count
      const updateField = type === 'training' ? 'training_total_sales' : 'product_total_sales';
      const currentSales = catalog[updateField] || 0;
      await MarketplaceCatalog.update(catalog.id, {
        [updateField]: currentSales + 1
      });

      // In a real app, you would also import the items into the buyer's account here.
      // For this implementation, we'll just show a success message.
      toast.success('Catalog purchased successfully! Items will be imported to your catalog.');
      loadData(); // Refresh data to show updated sales and potentially removed catalog if owned
    } catch (error) {
      console.error('Error purchasing catalog:', error);
      toast.error('Failed to purchase catalog. Please try again.');
    }
  };

  const renderCatalogCard = (catalog) => {
    const isPromoted = catalog.promoted_until && new Date(catalog.promoted_until) > new Date();
    
    // Determine if either catalog type is published to show the card
    if (!catalog.is_product_catalog_published && !catalog.is_training_catalog_published) {
        return null; // Don't render card if nothing is published
    }

    return (
      <Card key={catalog.id} className={`border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 ${isPromoted ? 'ring-2 ring-yellow-400' : ''}`}>
        {isPromoted && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 text-xs font-bold flex items-center gap-1 rounded-t-lg">
            <Crown className="w-3 h-3" />
            PROMOTED
          </div>
        )}
        
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            <span>{catalog.business_name}</span>
            {isPromoted && <Zap className="w-5 h-5 text-yellow-500" />}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Products Catalog */}
          {catalog.is_product_catalog_published && (
            <div className="p-4 border rounded-lg bg-slate-50/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold flex items-center gap-2 text-base">
                  <Package className="w-4 h-4 text-emerald-600" />
                  Products & Services Catalog
                </h4>
                <span className="text-lg font-bold text-emerald-600">
                  ${(catalog.product_catalog_price || 0).toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-3 line-clamp-2">{catalog.product_catalog_description || 'No description provided.'}</p>
              
              <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  {(catalog.product_average_rating || 0).toFixed(1)} ({catalog.product_total_ratings || 0})
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {catalog.product_total_sales || 0} sales
                </div>
              </div>
              
              <Button 
                onClick={() => handlePurchaseCatalog(catalog, 'products')}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                size="sm"
              >
                Purchase Products Catalog
              </Button>
            </div>
          )}

          {/* Training Catalog */}
          {catalog.is_training_catalog_published && (
            <div className="p-4 border rounded-lg bg-slate-50/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold flex items-center gap-2 text-base">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  Training Programs Catalog
                </h4>
                <span className="text-lg font-bold text-blue-600">
                  ${(catalog.training_catalog_price || 0).toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-3 line-clamp-2">{catalog.training_catalog_description || 'No description provided.'}</p>
              
              <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  {(catalog.training_average_rating || 0).toFixed(1)} ({catalog.training_total_ratings || 0})
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {catalog.training_total_sales || 0} sales
                </div>
              </div>
              
              <Button 
                onClick={() => handlePurchaseCatalog(catalog, 'training')}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                Purchase Training Catalog
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart className="w-8 h-8 text-slate-700" />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Marketplace</h1>
            <p className="text-slate-600">Discover and share product catalogs and training programs.</p>
          </div>
        </div>

        {/* Suggested Items */}
        <SuggestedItems placement="marketplace" maxItems={3} className="mb-8" />

        <Tabs defaultValue={isAdmin ? "publish" : "browse"} className="space-y-6">
          <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <TabsTrigger value="browse">
              <Eye className="w-4 h-4 mr-2" />
              Browse Marketplace
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="publish">
                <Store className="w-4 h-4 mr-2" />
                Publish Your Catalogs
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="browse">
            {/* Search and Filters */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Search className="w-5 h-5" />
                  Search & Filter Catalogs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search businesses, descriptions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-end">
                    <Select value={catalogTypeFilter} onValueChange={setCatalogTypeFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Catalog Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="products">Products & Services</SelectItem>
                        <SelectItem value="training">Training Programs</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={ratingFilter} onValueChange={setRatingFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Rating</SelectItem>
                        <SelectItem value="4">4+ Stars</SelectItem>
                        <SelectItem value="3">3+ Stars</SelectItem>
                        <SelectItem value="2">2+ Stars</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={salesFilter} onValueChange={setSalesFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Sales" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Sales</SelectItem>
                        <SelectItem value="10">10+ Sales</SelectItem>
                        <SelectItem value="25">25+ Sales</SelectItem>
                        <SelectItem value="50">50+ Sales</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="price_low">Price: Low to High</SelectItem>
                        <SelectItem value="price_high">Price: High to Low</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="sales">Most Popular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Catalog Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCatalogs.length > 0 ? (
                filteredCatalogs.map(renderCatalogCard)
              ) : (
                <div className="col-span-full text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-500 mb-2">No catalogs found</h3>
                  <p className="text-slate-400">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="publish" className="space-y-6">
              <p className="text-sm text-center text-slate-600">
                Share your products, services, and training programs on the marketplace. The platform takes a 15% commission on each sale.
              </p>
              
              {/* PRODUCTS & SERVICES CATALOG */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-emerald-700">
                      <Package className="w-6 h-6" />
                      Products & Services Catalog
                    </CardTitle>
                    {marketplaceCatalog?.is_product_catalog_published && (
                      <Button
                        onClick={() => handlePromoteClick('products')}
                        variant="outline"
                        className="border-yellow-400 text-yellow-600 hover:bg-yellow-50"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Promote Catalog
                      </Button>
                    )}
                  </div>
                  <CardDescription>Publish your products and services for other businesses to purchase and use in their estimates.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="product_catalog_price">Catalog Price ($) *</Label>
                      <Input
                        id="product_catalog_price" type="number" step="0.01" min="0"
                        value={productCatalogPrice} onChange={(e) => setProductCatalogPrice(e.target.value)}
                        placeholder="e.g., 299.99"
                      />
                    </div>
                    <div className="space-y-2">
                       <Label htmlFor="product_catalog_description">Catalog Description</Label>
                      <Textarea
                        id="product_catalog_description" value={productCatalogDescription}
                        onChange={(e) => setProductCatalogDescription(e.target.value)}
                        placeholder="e.g., A comprehensive list of our top-selling construction materials..."
                        rows={1}
                      />
                    </div>
                  </div>

                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">Select Items to Publish</h3>
                      <Badge variant="outline">{allProducts.length} Total Items</Badge>
                    </div>
                    <div className="border rounded-lg max-h-60 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                      <div className="flex items-center space-x-2 pb-2 border-b">
                        <Checkbox id="select-all-products"
                          checked={allProducts.length > 0 && selectedProductIds.size === allProducts.length}
                          onCheckedChange={(checked) => handleSelectAll(checked, false)} />
                        <Label htmlFor="select-all-products" className="font-semibold">Select All Products & Services</Label>
                      </div>
                      {allProducts.length > 0 ? (
                        allProducts.map(product => (
                          <div key={product.id} className="flex items-center space-x-2">
                            <Checkbox id={`product-${product.id}`}
                              checked={selectedProductIds.has(product.id)}
                              onCheckedChange={() => handleItemSelection(product.id, false)} />
                            <Label htmlFor={`product-${product.id}`} className="font-normal flex-1">
                              {product.name}
                              <span className="text-xs text-slate-500 ml-2">({product.type})</span>
                            </Label>
                          </div>
                        ))
                      ) : <p className="text-sm text-slate-500">No products or services found.</p>}
                    </div>
                  </div>

                  <Separator />
                  
                  {marketplaceCatalog && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="p-4"><div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-600" /><span className="font-medium">Total Sales</span></div><p className="text-2xl font-bold">{marketplaceCatalog.product_total_sales || 0}</p></Card>
                      <Card className="p-4"><div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500" /><span className="font-medium">Avg Rating</span></div><p className="text-2xl font-bold">{(marketplaceCatalog.product_average_rating || 0).toFixed(1)}</p></Card>
                      <Card className="p-4"><div className="flex items-center gap-2"><Users className="w-4 h-4 text-blue-600" /><span className="font-medium">Total Ratings</span></div><p className="text-2xl font-bold">{marketplaceCatalog.product_total_ratings || 0}</p></Card>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <Button onClick={() => handlePublish('products')} disabled={isPublishing.products} className="bg-emerald-600 hover:bg-emerald-700">
                      {isPublishing.products ? 'Publishing...' : (marketplaceCatalog?.is_product_catalog_published ? 'Update Listing' : 'Publish Catalog')}
                    </Button>
                    {marketplaceCatalog?.is_product_catalog_published && (
                      <Button onClick={() => handleUnpublish('products')} variant="outline" disabled={isPublishing.products}>
                        {isPublishing.products ? 'Working...' : 'Unpublish'}
                      </Button>
                    )}
                  </div>
                  
                  {marketplaceCatalog?.is_product_catalog_published && (
                    <Alert className="border-emerald-200 bg-emerald-50"><AlertDescription className="text-emerald-700">Your products & services catalog is live on the marketplace!</AlertDescription></Alert>
                  )}
                  {marketplaceCatalog?.promoted_until && new Date(marketplaceCatalog.promoted_until) > new Date() && marketplaceCatalog.promotion_type === 'products' && (
                    <Alert className="border-yellow-200 bg-yellow-50">
                      <Crown className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-700">
                        Your products catalog is currently promoted until {format(new Date(marketplaceCatalog.promoted_until), 'PPP')}.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* TRAINING CATALOG */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-blue-700">
                      <GraduationCap className="w-6 h-6" />
                      Training Programs Catalog
                    </CardTitle>
                    {marketplaceCatalog?.is_training_catalog_published && (
                      <Button
                        onClick={() => handlePromoteClick('training')}
                        variant="outline"
                        className="border-yellow-400 text-yellow-600 hover:bg-yellow-50"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Promote Catalog
                      </Button>
                    )}
                  </div>
                  <CardDescription>Sell your expert training programs to other businesses.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="training_catalog_price">Catalog Price ($) *</Label>
                      <Input
                        id="training_catalog_price" type="number" step="0.01" min="0"
                        value={trainingCatalogPrice} onChange={(e) => setTrainingCatalogPrice(e.target.value)}
                        placeholder="e.g., 499.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="training_catalog_description">Catalog Description</Label>
                      <Textarea
                        id="training_catalog_description" value={trainingCatalogDescription}
                        onChange={(e) => setTrainingCatalogDescription(e.target.value)}
                        placeholder="e.g., A complete safety and certification package for construction crews..."
                        rows={1}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">Select Trainings to Publish</h3>
                      <Badge variant="outline">{allTrainings.length} Total Trainings</Badge>
                    </div>
                    <div className="border rounded-lg max-h-60 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                      <div className="flex items-center space-x-2 pb-2 border-b">
                        <Checkbox id="select-all-trainings"
                          checked={allTrainings.length > 0 && selectedTrainingIds.size === allTrainings.length}
                          onCheckedChange={(checked) => handleSelectAll(checked, true)} />
                        <Label htmlFor="select-all-trainings" className="font-semibold">Select All Trainings</Label>
                      </div>
                      {allTrainings.length > 0 ? (
                        allTrainings.map(training => (
                          <div key={training.id} className="flex items-center space-x-2">
                            <Checkbox id={`training-${training.id}`}
                              checked={selectedTrainingIds.has(training.id)}
                              onCheckedChange={() => handleItemSelection(training.id, true)} />
                            <Label htmlFor={`training-${training.id}`} className="font-normal flex-1">
                              {training.title}
                              <span className="text-xs text-slate-500 ml-2">({training.category})</span>
                            </Label>
                          </div>
                        ))
                      ) : <p className="text-sm text-slate-500">No training programs found.</p>}
                    </div>
                  </div>

                  <Separator />

                  {marketplaceCatalog && (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="p-4"><div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-600" /><span className="font-medium">Total Sales</span></div><p className="text-2xl font-bold">{marketplaceCatalog.training_total_sales || 0}</p></Card>
                      <Card className="p-4"><div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500" /><span className="font-medium">Avg Rating</span></div><p className="text-2xl font-bold">{(marketplaceCatalog.training_average_rating || 0).toFixed(1)}</p></Card>
                      <Card className="p-4"><div className="flex items-center gap-2"><Users className="w-4 h-4 text-blue-600" /><span className="font-medium">Total Ratings</span></div><p className="text-2xl font-bold">{marketplaceCatalog.training_total_ratings || 0}</p></Card>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <Button onClick={() => handlePublish('training')} disabled={isPublishing.training} className="bg-blue-600 hover:bg-blue-700">
                      {isPublishing.training ? 'Publishing...' : (marketplaceCatalog?.is_training_catalog_published ? 'Update Listing' : 'Publish Catalog')}
                    </Button>
                    {marketplaceCatalog?.is_training_catalog_published && (
                      <Button onClick={() => handleUnpublish('training')} variant="outline" disabled={isPublishing.training}>
                        {isPublishing.training ? 'Working...' : 'Unpublish'}
                      </Button>
                    )}
                  </div>
                  
                  {marketplaceCatalog?.is_training_catalog_published && (
                    <Alert className="border-blue-200 bg-blue-50"><AlertDescription className="text-blue-700">Your training programs catalog is live on the marketplace!</AlertDescription></Alert>
                  )}
                  {marketplaceCatalog?.promoted_until && new Date(marketplaceCatalog.promoted_until) > new Date() && marketplaceCatalog.promotion_type === 'training' && (
                    <Alert className="border-yellow-200 bg-yellow-50">
                      <Crown className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-700">
                        Your training catalog is currently promoted until {format(new Date(marketplaceCatalog.promoted_until), 'PPP')}.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

            </TabsContent>
          )}
        </Tabs>

        {/* Promotion Payment Dialog */}
        <Dialog open={showPromotionDialog} onOpenChange={setShowPromotionDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-600" />
                Promote Your {promotionType === 'products' ? 'Products & Services' : 'Training'} Catalog
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Promotion Benefits:</h4>
                <ul className="text-sm text-yellow-700 space-y-1 pl-4 list-disc">
                  <li>Featured placement at the top of search results</li>
                  <li>Special "PROMOTED" badge on your listing</li>
                  <li>Increased visibility to potential buyers</li>
                  <li>Priority in marketplace recommendations</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Label htmlFor="promotion_duration">Promotion Duration</Label>
                <Select value={promotionDuration.toString()} onValueChange={(value) => setPromotionDuration(parseInt(value))}>
                  <SelectTrigger id="promotion_duration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days - $6.99</SelectItem>
                    <SelectItem value="14">14 days - $13.99</SelectItem>
                    <SelectItem value="30">30 days - $29.99</SelectItem>
                    <SelectItem value="60">60 days - $59.99</SelectItem>
                    <SelectItem value="90">90 days - $89.99</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Total Cost:</span>
                  <span className="text-xl font-bold text-emerald-600">${getPromotionPrice()}</span>
                </div>
                
                <StripePaymentForm
                  amount={parseFloat(getPromotionPrice())}
                  currency="usd"
                  onSuccess={handlePromotionPayment}
                  onError={(error) => {
                    console.error('Promotion payment error:', error);
                    toast.error('Payment failed. Please try again.');
                  }}
                  metadata={{
                    type: 'marketplace_promotion',
                    catalog_id: marketplaceCatalog?.id,
                    promotion_type: promotionType,
                    duration_days: promotionDuration
                  }}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
