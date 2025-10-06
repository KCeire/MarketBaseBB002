// app/components/Shop.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MarketplaceProduct } from '@/types/shopify';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import { BasePayCheckout } from './BasePayCheckout';
import { toast } from './ui/Toast';
import { QuantitySelector } from './product/QuantitySelector';
import { ShareButton } from './product/ShareButton';
import { CategoryGrid } from './categories/CategoryGrid';
import { getAllStoreProducts } from '@/lib/stores';
import '@/lib/stores/nft-energy'; // Import to register NFT Energy store
import Image from 'next/image';

interface ShopProps {
  setActiveTab: (tab: string) => void;
  showCart?: boolean;
  onBackToShop?: () => void;
  showCategories?: boolean;
}

interface CartItem {
  productId: number;
  variantId: number;
  title: string;
  variant: string;
  price: string;
  image: string;
  quantity: number;
  sku: string;
}

// Custom event to notify cart updates
const dispatchCartUpdate = () => {
  window.dispatchEvent(new CustomEvent('cartUpdated'));
};

// Union type for all products (Shopify + Store products)
type UnifiedProduct = Omit<MarketplaceProduct, 'id'> & {
  id: number | string; // Allow both number and string IDs
  storeInfo?: { name: string; slug: string; url: string; };
  isStoreProduct?: boolean;
  originalId?: string; // Store original string ID for mapping
};

export function Shop({ setActiveTab, showCart = false, onBackToShop, showCategories = false }: ShopProps) {
  const router = useRouter();
  const [products, setProducts] = useState<UnifiedProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<UnifiedProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all-products');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedVariants, setSelectedVariants] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'newest'>('newest');

  // Suppress unused variable warning
  void setActiveTab;

  useEffect(() => {
    const initializeShop = async () => {
      await fetchProducts();
      loadCartFromStorage();
    };
    initializeShop();
  }, []);

  // Apply filters when products, category, search query, or sort changes
  useEffect(() => {
    applyFilters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, selectedCategory, searchQuery, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Fetch Shopify products
      const shopifyProducts: UnifiedProduct[] = [];
      try {
        const response = await fetch('/api/shopify/products');
        if (response.ok) {
          const data = await response.json();
          // Map Shopify products to stores based on vendor or product characteristics
          const mappedProducts = (data.products || []).map((product: MarketplaceProduct) => {
            let storeInfo = undefined;

            // Map products to stores based on vendor or product type
            const vendor = product.vendor.toLowerCase();
            const title = product.title.toLowerCase();
            const productType = product.productType.toLowerCase();

            if (vendor.includes('apex') || title.includes('survival') || title.includes('tactical') || productType.includes('sports')) {
              storeInfo = {
                name: 'Apex Athletics',
                slug: 'apex-athletics',
                url: '/store/apex-athletics'
              };
            } else if (vendor.includes('techwave') || vendor.includes('tech') || productType.includes('electronics')) {
              storeInfo = {
                name: 'TechWave Electronics',
                slug: 'techwave-electronics',
                url: '/store/techwave-electronics'
              };
            } else if (vendor.includes('pawsome') || vendor.includes('pet') || productType.includes('pet')) {
              storeInfo = {
                name: 'Pawsome Pets',
                slug: 'pawsome-pets',
                url: '/store/pawsome-pets'
              };
            } else if (vendor.includes('radiant') || vendor.includes('beauty') || productType.includes('beauty')) {
              storeInfo = {
                name: 'Radiant Beauty',
                slug: 'radiant-beauty',
                url: '/store/radiant-beauty'
              };
            } else if (vendor.includes('green') || vendor.includes('oasis') || vendor.includes('home') || productType.includes('home')) {
              storeInfo = {
                name: 'Green Oasis Home',
                slug: 'green-oasis-home',
                url: '/store/green-oasis-home'
              };
            }

            return {
              ...product,
              storeInfo,
              isStoreProduct: !!storeInfo
            };
          });

          shopifyProducts.push(...mappedProducts);
        }
      } catch (err) {
        console.warn('Failed to fetch Shopify products:', err);
      }

      // Get local store products
      const storeProducts: UnifiedProduct[] = getAllStoreProducts().map((product, productIndex) => {
        // For NFT Energy products, preserve original ID for routing
        const isNFTEnergy = product.storeInfo?.slug === 'nft-energy';
        const productId = isNFTEnergy ? product.id : (typeof product.id === 'string' ? parseInt(`9${productIndex}${Date.now().toString().slice(-6)}`) : product.id);

        return {
          ...product,
          id: productId,
          originalId: product.id, // Store original ID for mapping
          compareAtPrice: product.compareAtPrice || null,
          isStoreProduct: true,
          variants: product.variants.map((variant, variantIndex) => ({
            ...variant,
            id: typeof variant.id === 'string' ? parseInt(`8${productIndex}${variantIndex}${Date.now().toString().slice(-4)}`) : variant.id,
            compareAtPrice: variant.compareAtPrice || null,
            sku: variant.sku || null
          }))
        };
      });

      // Combine all products
      const allProducts = [...shopifyProducts, ...storeProducts];
      setProducts(allProducts);
      setFilteredProducts(allProducts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
      setError(errorMessage);
      toast.error('Failed to Load Products', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters (category + search)
  const applyFilters = () => {
    let filtered = products;

    // Apply category filter
    if (selectedCategory !== 'all-products') {
      filtered = filtered.filter(product => {
        const title = product.title.toLowerCase();
        const tags = product.tags.join(' ').toLowerCase();
        const productType = product.productType.toLowerCase();

        switch (selectedCategory) {
          case 'food-beverage':
            return title.includes('drink') || title.includes('energy') || title.includes('beverage') ||
                   title.includes('food') || title.includes('nft energy') ||
                   tags.includes('drinks') || tags.includes('energy') || tags.includes('beverages') ||
                   productType.includes('food') || productType.includes('beverage') ||
                   productType.toLowerCase().includes('food & beverage');
          case 'apparel':
            return title.includes('shirt') || title.includes('tee') || title.includes('hoodie') ||
                   title.includes('sweatshirt') || title.includes('clothing') || title.includes('apparel') ||
                   tags.includes('apparel') || tags.includes('clothing') || tags.includes('shirt') ||
                   productType.includes('apparel') || productType.includes('clothing');
          case 'accessories':
            return title.includes('hat') || title.includes('cap') || title.includes('case') ||
                   title.includes('accessory') || title.includes('accessories') ||
                   tags.includes('accessories') || tags.includes('hat') || tags.includes('cap') ||
                   productType.includes('accessories') || productType.includes('accessory');
          case 'electronics':
            return title.includes('phone') || title.includes('tablet') || title.includes('computer') ||
                   title.includes('iphone') || title.includes('case') || title.includes('tech') ||
                   tags.includes('electronics') || tags.includes('tech') || tags.includes('phone') ||
                   productType.includes('electronics') || productType.includes('tech');
          case 'home-garden':
            return title.includes('home') || title.includes('garden') || title.includes('furniture') ||
                   tags.includes('home') || tags.includes('garden') || productType.includes('home');
          case 'pet-products':
            return title.includes('pet') || title.includes('dog') || title.includes('cat') ||
                   tags.includes('pets') || productType.includes('pet');
          case 'health-beauty':
            return title.includes('health') || title.includes('beauty') || title.includes('skincare') ||
                   tags.includes('health') || tags.includes('beauty') || productType.includes('beauty');
          case 'sports-outdoors':
            return title.includes('sport') || title.includes('outdoor') || title.includes('fitness') ||
                   tags.includes('sports') || tags.includes('outdoor') || productType.includes('sports');
          default:
            return true;
        }
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => {
        const title = product.title.toLowerCase();
        const description = product.description.toLowerCase();
        const tags = product.tags.join(' ').toLowerCase();
        const vendor = product.vendor.toLowerCase();

        return title.includes(query) || description.includes(query) ||
               tags.includes(query) || vendor.includes(query);
      });
    }

    // Apply sorting
    const sortedFiltered = [...filtered].sort((a, b) => {
      const getPrice = (product: UnifiedProduct) => {
        const selectedVariantIndex = selectedVariants[product.id.toString()] || 0;
        const selectedVariant = product.variants[selectedVariantIndex] || product.variants[0];
        return parseFloat(selectedVariant.price);
      };

      switch (sortBy) {
        case 'price-asc':
          return getPrice(a) - getPrice(b);
        case 'price-desc':
          return getPrice(b) - getPrice(a);
        case 'newest':
        default:
          // For newest, prioritize store products and maintain original order
          return 0;
      }
    });

    setFilteredProducts(sortedFiltered);
  };

  // Filter products by category
  const filterProductsByCategory = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
  };

  const handleCategorySelect = (categorySlug: string) => {
    filterProductsByCategory(categorySlug);
  };

  const loadCartFromStorage = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      toast.error('Cart Loading Error', 'Unable to restore your saved cart items');
    }
  };

  const saveCartToStorage = (cartData: CartItem[]) => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartData));
      // Use setTimeout to defer the event dispatch and avoid state update during render
      setTimeout(() => {
        dispatchCartUpdate();
      }, 0);
    } catch (error) {
      console.error('Error saving cart to storage:', error);
      toast.error('Cart Save Error', 'Unable to save cart items');
    }
  };

  const addToCart = (product: UnifiedProduct, quantity: number = 1) => {
    // Use selected variant or first variant as fallback
    const selectedVariantIndex = selectedVariants[product.id.toString()] || 0;
    const variant = product.variants[selectedVariantIndex] || product.variants[0];
    const cartItem: CartItem = {
      productId: typeof product.id === 'string' ? parseInt(product.id) || Date.now() : product.id,
      variantId: typeof variant.id === 'string' ? parseInt(variant.id) || Date.now() : variant.id,
      title: product.title,
      variant: variant.title,
      price: variant.price,
      image: product.image,
      quantity,
      sku: variant.sku || `${product.id}-${variant.id}`,
    };

    // Check if item exists BEFORE updating state
    const existing = cart.find(item => item.variantId === variant.id);

    setCart(prev => {
      let newCart;
      if (existing) {
        newCart = prev.map(item => 
          item.variantId === variant.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newCart = [...prev, cartItem];
      }
      saveCartToStorage(newCart);
      return newCart;
    });

    // Reset quantity selector to 1 after adding
    setQuantities(prev => ({ ...prev, [product.id.toString()]: 1 }));

    // Show toast after state update
    setTimeout(() => {
      if (existing) {
        toast.success('Updated Cart', `Added ${quantity} more ${product.title}`);
      } else {
        toast.addedToCart(`${quantity}x ${product.title}`);
      }
    }, 0);
  };

  const updateCartQuantity = (variantId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(variantId);
      return;
    }

    setCart(prev => {
      const newCart = prev.map(item =>
        item.variantId === variantId
          ? { ...item, quantity: newQuantity }
          : item
      );
      saveCartToStorage(newCart);
      return newCart;
    });
  };

  const removeFromCart = (variantId: number) => {
    // Find item to remove BEFORE updating state
    const itemToRemove = cart.find(item => item.variantId === variantId);

    setCart(prev => {
      const newCart = prev.filter(item => item.variantId !== variantId);
      saveCartToStorage(newCart);
      return newCart;
    });

    // Show toast after state update
    setTimeout(() => {
      if (itemToRemove) {
        toast.removedFromCart(itemToRemove.title);
      }
    }, 0);
  };

  // Mapping from store product IDs to NFT Energy SKUs
  const getNFTEnergySKU = (productId: string): string => {
    const skuMap: Record<string, string> = {
      'nft-energy-12pack': 'NFT-ENERGY-12PK',
      'nft-energy-tshirt': '685381941D63E',
      'nft-energy-hoodie': '6853806B94625',
      'nft-energy-sweatshirt': '685375E48090B',
      'nft-energy-trucker-hat': '68537385433E6',
      'nft-energy-iphone-case': '68537282C6DB2'
    };
    return skuMap[productId] || productId;
  };

  const navigateToProduct = (productId: number | string, product?: UnifiedProduct) => {
    // Check if this is an NFT Energy product
    if (product?.isStoreProduct && product?.storeInfo?.slug === 'nft-energy') {
      // Use original ID if available, otherwise use current ID
      const idToMap = product.originalId || productId.toString();
      const sku = getNFTEnergySKU(idToMap);
      router.push(`/nft-energy/product/${sku}`);
    } else {
      // Navigate to regular Shopify product page
      router.push(`/product/${productId}`);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      return total + (parseFloat(item.price) * item.quantity);
    }, 0).toFixed(2);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const handleCheckoutSuccess = (orderReference: string) => {
    toast.paymentSuccess(orderReference);
    // Clear cart on successful order
    setCart([]);
    saveCartToStorage([]);
    if (onBackToShop) {
      onBackToShop();
    }
  };

  const handleCheckoutError = (error: string) => {
    toast.paymentFailed(error);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Shop</h2>
        </div>
        <div className="flex justify-center py-8">
          <div className="text-gray-500 dark:text-gray-400">Loading products...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Shop</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchProducts}
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (showCart) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Shopping Cart</h2>
          {onBackToShop && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToShop}
              icon={<Icon name="arrow-left" size="sm" />}
            >
              Back to Shop
            </Button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Demo Warning Banner */}
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded">
              <p className="text-yellow-800 text-sm font-semibold text-center">
                ⚠️ DEMO VERSION - DO NOT PURCHASE ⚠️
              </p>
              <p className="text-yellow-700 text-xs text-center mt-1">
                This is a development version for testing only
              </p>
            </div>

            {cart.map((item) => (
              <div key={item.variantId} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate text-gray-900 dark:text-gray-100">{item.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.variant}</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">${item.price}</p>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCartQuantity(item.variantId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 p-0"
                    >
                      <Icon name="minus" size="sm" />
                    </Button>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCartQuantity(item.variantId, item.quantity + 1)}
                      className="w-8 h-8 p-0"
                    >
                      <Icon name="plus" size="sm" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100 text-right">
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(item.variantId)}
                    icon={<Icon name="trash" size="sm" />}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Total: ${getCartTotal()}</span>
              </div>
              
              <BasePayCheckout 
                cart={cart}
                total={getCartTotal()}
                onSuccess={handleCheckoutSuccess}
                onError={handleCheckoutError}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Categories view - show all products with category filtering
  if (showCategories) {
    const categories = [
      { slug: 'all-products', name: 'All Products', count: products.length },
      { slug: 'food-beverage', name: 'Food & Beverage', count: products.filter(p => {
        const title = p.title.toLowerCase();
        const tags = p.tags.join(' ').toLowerCase();
        const productType = p.productType.toLowerCase();
        return title.includes('drink') || title.includes('energy') || title.includes('beverage') ||
               title.includes('food') || title.includes('nft energy') ||
               tags.includes('drinks') || tags.includes('energy') || tags.includes('beverages') ||
               productType.includes('food') || productType.includes('beverage') ||
               productType.toLowerCase().includes('food & beverage');
      }).length },
      { slug: 'apparel', name: 'Apparel', count: products.filter(p => {
        const title = p.title.toLowerCase();
        const tags = p.tags.join(' ').toLowerCase();
        const productType = p.productType.toLowerCase();
        return title.includes('shirt') || title.includes('tee') || title.includes('hoodie') ||
               title.includes('sweatshirt') || title.includes('clothing') || title.includes('apparel') ||
               tags.includes('apparel') || tags.includes('clothing') || tags.includes('shirt') ||
               productType.includes('apparel') || productType.includes('clothing');
      }).length },
      { slug: 'accessories', name: 'Accessories', count: products.filter(p => {
        const title = p.title.toLowerCase();
        const tags = p.tags.join(' ').toLowerCase();
        const productType = p.productType.toLowerCase();
        return title.includes('hat') || title.includes('cap') || title.includes('case') ||
               title.includes('accessory') || title.includes('accessories') ||
               tags.includes('accessories') || tags.includes('hat') || tags.includes('cap') ||
               productType.includes('accessories') || productType.includes('accessory');
      }).length },
      { slug: 'electronics', name: 'Electronics', count: products.filter(p => {
        const title = p.title.toLowerCase();
        const tags = p.tags.join(' ').toLowerCase();
        const productType = p.productType.toLowerCase();
        return title.includes('phone') || title.includes('tablet') || title.includes('computer') ||
               title.includes('iphone') || title.includes('case') || title.includes('tech') ||
               tags.includes('electronics') || tags.includes('tech') || tags.includes('phone') ||
               productType.includes('electronics') || productType.includes('tech');
      }).length },
      { slug: 'home-garden', name: 'Home & Garden', count: products.filter(p => {
        const title = p.title.toLowerCase();
        const tags = p.tags.join(' ').toLowerCase();
        const productType = p.productType.toLowerCase();
        return title.includes('home') || title.includes('garden') || title.includes('furniture') ||
               tags.includes('home') || tags.includes('garden') || productType.includes('home');
      }).length },
      { slug: 'pet-products', name: 'Pet Products', count: products.filter(p => {
        const title = p.title.toLowerCase();
        const tags = p.tags.join(' ').toLowerCase();
        const productType = p.productType.toLowerCase();
        return title.includes('pet') || title.includes('dog') || title.includes('cat') ||
               tags.includes('pets') || productType.includes('pet');
      }).length },
      { slug: 'health-beauty', name: 'Health & Beauty', count: products.filter(p => {
        const title = p.title.toLowerCase();
        const tags = p.tags.join(' ').toLowerCase();
        const productType = p.productType.toLowerCase();
        return title.includes('health') || title.includes('beauty') || title.includes('skincare') ||
               tags.includes('health') || tags.includes('beauty') || productType.includes('beauty');
      }).length },
      { slug: 'sports-outdoors', name: 'Sports & Outdoors', count: products.filter(p => {
        const title = p.title.toLowerCase();
        const tags = p.tags.join(' ').toLowerCase();
        const productType = p.productType.toLowerCase();
        return title.includes('sport') || title.includes('outdoor') || title.includes('fitness') ||
               tags.includes('sports') || tags.includes('outdoor') || productType.includes('sports');
      }).length }
    ];

    return (
      <div className="space-y-3">
        {/* Condensed Search and Filter Controls */}
        <div className="space-y-2">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 pl-9 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <Icon
              name="search"
              size="sm"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>

          {/* Inline Category and Sort Controls */}
          <div className="grid grid-cols-2 gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategorySelect(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'price-asc' | 'price-desc' | 'newest')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          {/* Active Filters Display */}
          <div className="flex flex-wrap gap-2">
            {selectedCategory !== 'all-products' && (
              <div className="inline-flex items-center space-x-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs">
                <span>Category: {categories.find(c => c.slug === selectedCategory)?.name}</span>
                <button
                  onClick={() => handleCategorySelect('all-products')}
                  className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                >
                  ×
                </button>
              </div>
            )}
            {searchQuery.trim() && (
              <div className="inline-flex items-center space-x-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-xs">
                <span>Search: &quot;{searchQuery}&quot;</span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>


        {/* Products Grid */}
        <div className="space-y-3">
          {cart.length > 0 && (
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {getCartItemCount()} item{getCartItemCount() !== 1 ? 's' : ''} in cart
              </div>
            </div>
          )}

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredProducts.map((product, index) => (
                <div
                  key={`${product.isStoreProduct ? 'store' : 'shopify'}-${product.id}-${index}`}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 cursor-pointer hover:shadow-md dark:hover:shadow-lg hover:shadow-gray-200 dark:hover:shadow-black/20 transition-all duration-200 bg-white dark:bg-gray-800"
                  onClick={() => navigateToProduct(product.id, product)}
                >
                  {/* Demo Warning Banner */}
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-400 p-3 rounded">
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm font-semibold text-center">
                      ⚠️ DEMO VERSION - DO NOT PURCHASE ⚠️
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-300 text-xs text-center mt-1">
                      This is a development version for testing only
                    </p>
                  </div>

                  <Image
                    src={product.image}
                    alt={product.title}
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover rounded"
                    priority={filteredProducts.indexOf(product) === 0}
                  />
                  <div>
                    <h3 className="font-semibold text-sm mb-1 text-gray-900 dark:text-gray-100">{product.title}</h3>
                    {product.isStoreProduct && product.storeInfo && (
                      <div className="mb-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(product.storeInfo!.url);
                          }}
                          className="inline-flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full"
                        >
                          <Icon name="store" size="sm" />
                          <span>Visit {product.storeInfo.name} Store</span>
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                      {product.description.replace(/<[^>]*>/g, '').substring(0, 100)}...
                    </p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          {(() => {
                            const selectedVariantIndex = selectedVariants[product.id.toString()] || 0;
                            const selectedVariant = product.variants[selectedVariantIndex] || product.variants[0];
                            return (
                              <>
                                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">${selectedVariant.price}</span>
                                {selectedVariant.compareAtPrice && (
                                  <span className="text-sm text-gray-400 dark:text-gray-500 line-through ml-2">
                                    ${selectedVariant.compareAtPrice}
                                  </span>
                                )}
                              </>
                            );
                          })()}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // All products should go to their individual product page
                            navigateToProduct(product.id, product);
                          }}
                          icon={<Icon name="eye" size="sm" />}
                        >
                          View
                        </Button>
                      </div>

                      {/* Size/Variant Selector - only show if multiple variants */}
                      {product.variants.length > 1 && (
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            Size/Variant:
                          </label>
                          <select
                            value={selectedVariants[product.id.toString()] || 0}
                            onChange={(e) => setSelectedVariants(prev => ({
                              ...prev,
                              [product.id.toString()]: parseInt(e.target.value)
                            }))}
                            className="w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {product.variants.map((variant, index) => (
                              <option key={`variant-${product.id}-${index}`} value={index}>
                                {variant.title} - ${variant.price}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <QuantitySelector
                          value={quantities[product.id.toString()] || 1}
                          onChange={(qty) => setQuantities(prev => ({ ...prev, [product.id.toString()]: qty }))}
                          min={1}
                          max={(() => {
                            const selectedVariantIndex = selectedVariants[product.id.toString()] || 0;
                            const selectedVariant = product.variants[selectedVariantIndex] || product.variants[0];
                            return selectedVariant.inventory || 99;
                          })()}
                          disabled={(() => {
                            const selectedVariantIndex = selectedVariants[product.id.toString()] || 0;
                            const selectedVariant = product.variants[selectedVariantIndex] || product.variants[0];
                            return !selectedVariant.available;
                          })()}
                          size="sm"
                        />
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product, quantities[product.id.toString()] || 1);
                          }}
                          disabled={(() => {
                            const selectedVariantIndex = selectedVariants[product.id.toString()] || 0;
                            const selectedVariant = product.variants[selectedVariantIndex] || product.variants[0];
                            return !selectedVariant.available;
                          })()}
                          className="flex-1"
                        >
                          {(() => {
                            const selectedVariantIndex = selectedVariants[product.id.toString()] || 0;
                            const selectedVariant = product.variants[selectedVariantIndex] || product.variants[0];
                            return selectedVariant.available ? 'Add to Cart' : 'Out of Stock';
                          })()}
                        </Button>
                      </div>

                      {/* Share Button */}
                      <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                        <ShareButton
                          product={{
                            id: product.id,
                            title: product.title,
                            price: (() => {
                              const selectedVariantIndex = selectedVariants[product.id.toString()] || 0;
                              const selectedVariant = product.variants[selectedVariantIndex] || product.variants[0];
                              return selectedVariant.price;
                            })(),
                            image: product.image,
                            description: product.description
                          }}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No products found in this category</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCategorySelect('all-products')}
                className="mt-2"
              >
                Show All Products
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category Filter Bar */}
      {selectedCategory !== 'all-products' && (
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Icon name="grid" size="sm" className="text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
              {selectedCategory.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400">
              ({filteredProducts.length} products)
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCategorySelect('all-products')}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Clear Filter
          </Button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Shop</h2>
        {cart.length > 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {getCartItemCount()} item{getCartItemCount() !== 1 ? 's' : ''} in cart
          </div>
        )}
      </div>

      {/* Category Grid - Show on main shop view */}
      <CategoryGrid onCategorySelect={handleCategorySelect} className="mb-6" />

      {/* Sort Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sort by:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'price-asc' | 'price-desc' | 'newest')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredProducts.map((product, index) => (
          <div
            key={`main-${product.isStoreProduct ? 'store' : 'shopify'}-${product.id}-${index}`}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 cursor-pointer hover:shadow-md dark:hover:shadow-lg hover:shadow-gray-200 dark:hover:shadow-black/20 transition-all duration-200 bg-white dark:bg-gray-800"
            onClick={() => navigateToProduct(product.id, product)}
          >
            {/* Demo Warning Banner */}
            <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-400 p-3 rounded">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm font-semibold text-center">
                ⚠️ DEMO VERSION - DO NOT PURCHASE ⚠️
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 text-xs text-center mt-1">
                This is a development version for testing only
              </p>
            </div>
            
            <Image 
              src={product.image} 
              alt={product.title}
              width={400}
              height={192}
              className="w-full h-48 object-cover rounded"
              priority={filteredProducts.indexOf(product) === 0} // Only first product gets priority
            />
            <div>
              <h3 className="font-semibold text-sm mb-1 text-gray-900 dark:text-gray-100">{product.title}</h3>
              {product.isStoreProduct && product.storeInfo && (
                <div className="mb-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(product.storeInfo!.url);
                    }}
                    className="inline-flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full"
                  >
                    <Icon name="store" size="sm" />
                    <span>Visit {product.storeInfo.name} Store</span>
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                {product.description.replace(/<[^>]*>/g, '').substring(0, 100)}...
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    {(() => {
                      const selectedVariantIndex = selectedVariants[product.id.toString()] || 0;
                      const selectedVariant = product.variants[selectedVariantIndex] || product.variants[0];
                      return (
                        <>
                          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">${selectedVariant.price}</span>
                          {selectedVariant.compareAtPrice && (
                            <span className="text-sm text-gray-400 dark:text-gray-500 line-through ml-2">
                              ${selectedVariant.compareAtPrice}
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // All products should go to their individual product page
                      navigateToProduct(product.id, product);
                    }}
                    icon={<Icon name="eye" size="sm" />}
                  >
                    View
                  </Button>
                </div>

                {/* Size/Variant Selector - only show if multiple variants */}
                {product.variants.length > 1 && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Size/Variant:
                    </label>
                    <select
                      value={selectedVariants[product.id.toString()] || 0}
                      onChange={(e) => setSelectedVariants(prev => ({
                        ...prev,
                        [product.id.toString()]: parseInt(e.target.value)
                      }))}
                      className="w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {product.variants.map((variant, index) => (
                        <option key={`main-variant-${product.id}-${index}`} value={index}>
                          {variant.title} - ${variant.price}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <QuantitySelector
                    value={quantities[product.id.toString()] || 1}
                    onChange={(qty) => setQuantities(prev => ({ ...prev, [product.id.toString()]: qty }))}
                    min={1}
                    max={(() => {
                      const selectedVariantIndex = selectedVariants[product.id.toString()] || 0;
                      const selectedVariant = product.variants[selectedVariantIndex] || product.variants[0];
                      return selectedVariant.inventory || 99;
                    })()}
                    disabled={(() => {
                      const selectedVariantIndex = selectedVariants[product.id.toString()] || 0;
                      const selectedVariant = product.variants[selectedVariantIndex] || product.variants[0];
                      return !selectedVariant.available;
                    })()}
                    size="sm"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product, quantities[product.id.toString()] || 1);
                    }}
                    disabled={(() => {
                      const selectedVariantIndex = selectedVariants[product.id.toString()] || 0;
                      const selectedVariant = product.variants[selectedVariantIndex] || product.variants[0];
                      return !selectedVariant.available;
                    })()}
                    className="flex-1"
                  >
                    {(() => {
                      const selectedVariantIndex = selectedVariants[product.id.toString()] || 0;
                      const selectedVariant = product.variants[selectedVariantIndex] || product.variants[0];
                      return selectedVariant.available ? 'Add to Cart' : 'Out of Stock';
                    })()}
                  </Button>
                </div>

                {/* Share Button */}
                <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                  <ShareButton
                    product={{
                      id: product.id,
                      title: product.title,
                      price: (() => {
                        const selectedVariantIndex = selectedVariants[product.id.toString()] || 0;
                        const selectedVariant = product.variants[selectedVariantIndex] || product.variants[0];
                        return selectedVariant.price;
                      })(),
                      image: product.image,
                      description: product.description
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && products.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No products found in this category</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCategorySelect('all-products')}
            className="mt-2"
          >
            Show All Products
          </Button>
        </div>
      )}

      {products.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No products available</p>
        </div>
      )}
    </div>
  );
}
