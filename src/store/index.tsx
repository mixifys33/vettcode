import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useState, useEffect } from "react";
import { sendKafkaEvent } from "../actions/track-user"
import axiosInstance from "../utils/axiosInstance";

interface Product {
    id: string;
    slug?: string;
    title: string;
    price: number;
    image: string;   
    quantity?: number;
    shopId: string;
    eventId?: string; // Track if product was added from an event
    eventEndDate?: string; // Track when the event ends
}

interface Store {
    cart: Product[];
    wishlist: Product[];
    wishlistIds: string[];
    cartSynced: boolean;
    wishlistSynced: boolean;
    categories: Array<{ name: string; subs: string[] }>;
    setCategoriesFromApplications: (applications: any[]) => void;
    addToCart: (
        product: Product,
        user: any,
        location: any,
        deviceInfo: any,
    ) => void;
    removeFromCart: (
        id: string,
        user: any,
        location: any,
        deviceInfo: any,
    ) => void;
    updateCartQuantity: (
        id: string,
        quantity: number,
        user?: any,
        location?: any,
        deviceInfo?: any,
    ) => void;
    clearCart: () => void;
    removeExpiredEventItems: () => void;
    addToWishlist: (
        product: Product,
        user: any,
        location: any,
        deviceInfo: any,
    ) => void;
    removeFromWishlist: (
        id: string,
        user: any,
        location: any,
        deviceInfo: any,
    ) => void;
    syncWithServer: (user: any) => Promise<void>;
    setWishlistIds: (ids: string[]) => void;
    isInWishlist: (productId: string) => boolean;
}

// Helper to sync with backend
const syncCartToServer = async (items: { productId: string; quantity: number }[]) => {
    try {
        await axiosInstance.post("/api/cart/sync", { items });
    } catch (error) {
        console.error("Failed to sync cart:", error);
    }
};

const syncWishlistToServer = async (productIds: string[]) => {
    try {
        await axiosInstance.post("/api/wishlist/sync", { productIds });
    } catch (error) {
        console.error("Failed to sync wishlist:", error);
    }
};

const addToCartServer = async (productId: string, quantity: number = 1) => {
    try {
        await axiosInstance.post("/api/cart/add", { productId, quantity });
    } catch (error) {
        console.error("Failed to add to cart on server:", error);
    }
};

// Notify chat service about cart access (allows sellers to message users with items in cart)
const notifyChatServiceCartAccess = async (userId: string, sellerId: string, shopId: string, productId: string) => {
    try {
        const CHAT_SERVICE_URL = process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || 'http://localhost:4002';
        await fetch(`${CHAT_SERVICE_URL}/api/chat/cart-access`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                sellerId,
                shopId,
                productIds: [productId],
            }),
        });
    } catch (error) {
        // Silent fail - this is a non-critical feature
        console.debug("Failed to notify chat service about cart access:", error);
    }
};

const removeFromCartServer = async (productId: string) => {
    try {
        await axiosInstance.post("/api/cart/remove", { productId });
    } catch (error) {
        console.error("Failed to remove from cart on server:", error);
    }
};

const updateCartQuantityServer = async (productId: string, quantity: number) => {
    try {
        await axiosInstance.post("/api/cart/update-quantity", { productId, quantity });
    } catch (error) {
        console.error("Failed to update cart quantity on server:", error);
    }
};

const addToWishlistServer = async (productId: string) => {
    try {
        await axiosInstance.post("/api/wishlist/add", { productId });
    } catch (error) {
        console.error("Failed to add to wishlist on server:", error);
    }
};

const removeFromWishlistServer = async (productId: string) => {
    try {
        await axiosInstance.post("/api/wishlist/remove", { productId });
    } catch (error) {
        console.error("Failed to remove from wishlist on server:", error);
    }
};

const useStoreBase = create<Store>()(
    persist(
        (set, get) => ({
            cart: [],
            wishlist: [],
            wishlistIds: [],
            cartSynced: false,
            wishlistSynced: false,
            categories: [],
            
            // Extract and cache categories from applications data
            setCategoriesFromApplications: (applications: any[]) => {
                if (!applications || applications.length === 0) return;
                
                // Extract unique categories and their subcategories
                const categoryMap = new Map<string, Set<string>>();
                
                applications.forEach(app => {
                    if (app.appCategory) {
                        if (!categoryMap.has(app.appCategory)) {
                            categoryMap.set(app.appCategory, new Set());
                        }
                        if (app.subCategory) {
                            categoryMap.get(app.appCategory)?.add(app.subCategory);
                        }
                    }
                });
                
                // Convert to array format
                const categories = Array.from(categoryMap.entries()).map(([name, subsSet]) => ({
                    name,
                    subs: Array.from(subsSet)
                }));
                
                set({ categories });
            },
            
            // Check if product is in wishlist
            isInWishlist: (productId: string) => {
                const state = get();
                return state.wishlistIds.includes(productId) || 
                       state.wishlist.some(item => item.id === productId);
            },
            
            // Set wishlist IDs from server
            setWishlistIds: (ids: string[]) => {
                set({ wishlistIds: ids });
            },
            
            // Sync local state with server
            syncWithServer: async (user: any) => {
                if (!user?.id) return;
                
                try {
                    // Get server wishlist
                    const wishlistRes = await axiosInstance.get("/api/wishlist");
                    const serverWishlistIds: string[] = wishlistRes.data.wishlist || [];
                    
                    // Get server cart
                    const cartRes = await axiosInstance.get("/api/cart");
                    const serverCart = cartRes.data.cart || [];
                    
                    // Merge local wishlist with server
                    const localWishlistIds = get().wishlist.map(item => item.id);
                    const mergedWishlistIds = [...new Set([...serverWishlistIds, ...localWishlistIds])];
                    
                    // Sync merged wishlist back to server
                    if (localWishlistIds.length > 0) {
                        await syncWishlistToServer(mergedWishlistIds);
                    }
                    
                    // Merge local cart with server
                    const localCart = get().cart;
                    if (localCart.length > 0) {
                        const cartItems = localCart
                            .map(item => ({
                                productId: typeof item.id === 'string' ? item.id : (item.id as any)?._id || (item.id as any)?.id || String(item.id),
                                quantity: item.quantity || 1
                            }))
                            .filter(item => item.productId && item.productId !== 'undefined' && item.productId !== 'null');
                        if (cartItems.length > 0) await syncCartToServer(cartItems);
                    }
                    
                    // Update local state with merged data
                    set({ 
                        wishlistIds: mergedWishlistIds,
                        cartSynced: true,
                        wishlistSynced: true
                    });
                } catch (error) {
                    console.error("Failed to sync with server:", error);
                }
            },
            
            // Add to Cart
            addToCart: (product, user, location, deviceInfo) => {
                set((state) => {
                    const existingItem = state.cart.find((item) => item.id === product.id);
                    if (existingItem) {
                        return {
                            cart: state.cart.map((item) =>
                                item.id === product.id
                                    ? { ...item, quantity: (item.quantity || 1) + 1 }
                                    : item
                            )
                        };
                    }
                    return { cart: [...state.cart, { ...product, quantity: 1 }] };
                });
                
                // Sync to server if user is logged in
                if (user?.id) {
                    addToCartServer(product.id, 1);
                    
                    // Notify chat service about cart access (allows seller to message this user)
                    if (product.shopId) {
                        notifyChatServiceCartAccess(user.id, product.shopId, product.shopId, product.id);
                    }
                }
                
                // Send kafka event
                if(user?.id && location && deviceInfo){
                    sendKafkaEvent({
                        userId: user?.id,
                        productId: product?.id,
                        shopId: product?.shopId,
                        action: "add_to_cart",
                        country: location?.country || "Unknown",
                        city: location?.city || "Unknown",
                        device: deviceInfo || "Unknown Device"
                    })
                }
            },
            
            // Remove from Cart
            removeFromCart: (id, user, location, deviceInfo) => {
                const removedProduct = get().cart.find((item) => item.id === id);
                set((state) => ({
                    cart: state.cart.filter((item) => item.id !== id)
                }));
                
                // Sync to server if user is logged in
                if (user?.id) {
                    removeFromCartServer(id);
                }
                
                // Send kafka event
                if(user?.id && location && deviceInfo && removedProduct){
                    sendKafkaEvent({
                        userId: user?.id,
                        productId: removedProduct?.id,
                        shopId: removedProduct?.shopId,
                        action: "remove_from_cart",
                        country: location?.country || "Unknown",
                        city: location?.city || "Unknown",
                        device: deviceInfo || "Unknown Device"
                    })
                }
            },
            
            // Update Cart Quantity
            updateCartQuantity: (id, quantity, user, location, deviceInfo) => {
                const product = get().cart.find((item) => item.id === id);
                set((state) => ({
                    cart: state.cart.map((item) =>
                        item.id === id
                            ? { ...item, quantity }
                            : item
                    )
                }));
                
                // Sync to server if user is logged in
                if (user?.id) {
                    updateCartQuantityServer(id, quantity);
                }
                
                // Send kafka event
                if(user?.id && location && deviceInfo && product){
                    sendKafkaEvent({
                        userId: user?.id,
                        productId: product?.id,
                        shopId: product?.shopId,
                        action: "update_cart_quantity",
                        country: location?.country || "Unknown",
                        city: location?.city || "Unknown",
                        device: deviceInfo || "Unknown Device"
                    })
                }
            },

            // Clear entire cart (used after successful checkout)
            clearCart: () => {
                set({ cart: [] });
                // Also clear on server
                syncCartToServer([]);
            },

            // Remove items from expired events (called periodically or on page load)
            removeExpiredEventItems: () => {
                const now = new Date().getTime();
                set((state) => {
                    // Filter out cart items from expired events
                    const validCartItems = state.cart.filter((item) => {
                        if (!item.eventEndDate) return true; // Keep non-event items
                        const eventEnd = new Date(item.eventEndDate).getTime();
                        return eventEnd > now; // Keep if event hasn't ended
                    });
                    
                    // Filter out wishlist items from expired events
                    const validWishlistItems = state.wishlist.filter((item) => {
                        if (!item.eventEndDate) return true;
                        const eventEnd = new Date(item.eventEndDate).getTime();
                        return eventEnd > now;
                    });
                    
                    const validWishlistIds = validWishlistItems.map(item => item.id);
                    
                    // Only update if something changed
                    if (validCartItems.length !== state.cart.length || 
                        validWishlistItems.length !== state.wishlist.length) {
                        console.log(`Removed ${state.cart.length - validCartItems.length} expired cart items and ${state.wishlist.length - validWishlistItems.length} expired wishlist items`);
                        return {
                            cart: validCartItems,
                            wishlist: validWishlistItems,
                            wishlistIds: validWishlistIds
                        };
                    }
                    return state;
                });
            },
            
            // Add to Wishlist
            addToWishlist: (product, user, location, deviceInfo) => {
                set((state) => {
                    if (state.wishlist.find((item) => item.id === product.id) || 
                        state.wishlistIds.includes(product.id)) {
                        return state;
                    }
                    return { 
                        ...state, 
                        wishlist: [...state.wishlist, product],
                        wishlistIds: [...state.wishlistIds, product.id]
                    };
                });
                
                // Sync to server if user is logged in
                if (user?.id) {
                    addToWishlistServer(product.id);
                }
                
                // Send kafka event
                if(user?.id && location && deviceInfo){
                    sendKafkaEvent({
                        userId: user?.id,
                        productId: product?.id,
                        shopId: product?.shopId,
                        action: "add_to_wishlist",
                        country: location?.country || "Unknown",
                        city: location?.city || "Unknown",
                        device: deviceInfo || "Unknown Device"
                    })
                }
            },
            
            // Remove from Wishlist
            removeFromWishlist: (id, user, location, deviceInfo) => {
                const removedProduct = get().wishlist.find((item) => item.id === id);
                set((state) => ({
                    ...state,
                    wishlist: state.wishlist.filter((item) => item.id !== id),
                    wishlistIds: state.wishlistIds.filter((pid) => pid !== id)
                }));
                
                // Sync to server if user is logged in
                if (user?.id) {
                    removeFromWishlistServer(id);
                }
                
                // Send kafka event
                if(user?.id && location && deviceInfo && removedProduct){
                    sendKafkaEvent({
                        userId: user?.id,
                        productId: removedProduct?.id,
                        shopId: removedProduct?.shopId,
                        action: "remove_from_wishlist",
                        country: location?.country || "Unknown",
                        city: location?.city || "Unknown",
                        device: deviceInfo || "Unknown Device"
                    })
                }
            }
        }),
        {
            name: "store-storage"
        }
    )
);

// Hydration-safe hook for Next.js SSR
export const useStore = <T,>(selector: (state: Store) => T): T => {
    const [hydrated, setHydrated] = useState(false);
    const storeValue = useStoreBase(selector);
    
    useEffect(() => {
        setHydrated(true);
    }, []);
    
    // Return empty defaults during SSR/hydration
    if (!hydrated) {
        const defaultState: Store = {
            cart: [],
            wishlist: [],
            wishlistIds: [],
            cartSynced: false,
            wishlistSynced: false,
            categories: [],
            setCategoriesFromApplications: () => {},
            addToCart: () => {},
            removeFromCart: () => {},
            updateCartQuantity: () => {},
            clearCart: () => {},
            removeExpiredEventItems: () => {},
            addToWishlist: () => {},
            removeFromWishlist: () => {},
            syncWithServer: async () => {},
            setWishlistIds: () => {},
            isInWishlist: () => false,
        };
        return selector(defaultState);
    }
    
    return storeValue;
};

// Export the base store for cases where you need direct access
export { useStoreBase };
