// lib/cart-utils.ts
import { MarketplaceProduct } from '@/types/producthub';
import { toast } from '@/app/components/ui/Toast';

interface CartItem {
  productId: number;
  variantId: number;
  title: string;
  variant: string;
  price: string;
  image: string;
  quantity: number;
  sku: string;
  storeId?: string; // NEW: Store context for Shopify products
}

// Custom event to notify cart updates
const dispatchCartUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }
};

// Get cart from localStorage
export const getCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') return [];

  try {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error('Error loading cart from storage:', error);
    return [];
  }
};

// Save cart to localStorage
export const saveCartToStorage = (cartData: CartItem[]) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('cart', JSON.stringify(cartData));
    // Use setTimeout to defer the event dispatch
    setTimeout(() => {
      dispatchCartUpdate();
    }, 0);
  } catch (error) {
    console.error('Error saving cart to storage:', error);
    toast.error('Cart Save Error', 'Unable to save cart items');
  }
};

// Add product to cart
export const addProductToCart = (product: MarketplaceProduct, quantity: number = 1, storeId?: string) => {
  // Use first variant as default (storefronts don't have variant selection yet)
  const variant = product.variants[0];

  if (!variant) {
    toast.error('Product Error', 'This product has no available variants');
    return;
  }

  const cartItem: CartItem = {
    productId: typeof product.id === 'string' ? parseInt(product.id) || Date.now() : product.id,
    variantId: typeof variant.id === 'string' ? parseInt(variant.id) || Date.now() : variant.id,
    title: product.title,
    variant: variant.title,
    price: variant.price,
    image: product.image,
    quantity,
    sku: variant.sku || `${product.id}-${variant.id}`,
    storeId, // NEW: Store context
  };

  // Get current cart
  const currentCart = getCartFromStorage();

  // Check if item already exists
  const existingItemIndex = currentCart.findIndex(item => item.variantId === cartItem.variantId);

  let newCart: CartItem[];
  if (existingItemIndex >= 0) {
    // Update existing item quantity
    newCart = [...currentCart];
    newCart[existingItemIndex] = {
      ...newCart[existingItemIndex],
      quantity: newCart[existingItemIndex].quantity + quantity
    };
    toast.success('Updated Cart', `Added ${quantity} more ${product.title}`);
  } else {
    // Add new item
    newCart = [...currentCart, cartItem];
    toast.addedToCart(`${quantity}x ${product.title}`);
  }

  // Save updated cart
  saveCartToStorage(newCart);
};