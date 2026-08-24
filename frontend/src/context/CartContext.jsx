/* Cart context — manages items, quantities, totals, and persistence */
import React, { createContext, useContext, useCallback, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../utils/constants';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};

export const CartProvider = ({ children }) => {
    const [items, setItems] = useLocalStorage(STORAGE_KEYS.CART, []);

    const addItem = useCallback((product) => {
        setItems(prev => {
            const variantId = product.variantId || product.shopifyVariantIds?.[0] || product.id;
            const existing = prev.find(item => item.id === product.id && item.variantId === variantId);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id && item.variantId === variantId
                        ? { ...item, quantity: Math.min(item.quantity + 1, 99) }
                        : item
                );
            }
            const cartProduct = {
                id: product.id,
                name: product.name,
                image: product.image,
                price: Number(product.price),
                variantId,
                source: product.source || 'local',
                quantity: 1,
            };
            return [...prev, cartProduct];
        });
    }, [setItems]);

    const removeItem = useCallback((productId) => {
        setItems(prev => prev.filter(item => item.id !== productId));
    }, [setItems]);

    const updateQuantity = useCallback((productId, quantity) => {
        if (quantity <= 0) {
            removeItem(productId);
            return;
        }
        setItems(prev => prev.map(item =>
            item.id === productId ? { ...item, quantity: Math.min(Number(quantity), 99) } : item
        ));
    }, [setItems, removeItem]);

    const clearCart = useCallback(() => {
        setItems([]);
    }, [setItems]);

    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const value = useMemo(() => ({
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalCount,
        totalPrice
    }), [items, addItem, removeItem, updateQuantity, clearCart, totalCount, totalPrice]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
