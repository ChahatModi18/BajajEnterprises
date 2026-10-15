import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, CartCalculation } from '../types';
import { apiRequest } from '../utils/api';

export interface CartItemState {
  productId: number;
  quantity: number;
  product?: Product;
}

interface CartContextType {
  items: CartItemState[];
  calculation: CartCalculation | null;
  loading: boolean;
  totalCount: number;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  refreshCalculation: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  items: [],
  calculation: null,
  loading: false,
  totalCount: 0,
  addToCart: () => {},
  updateQuantity: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  refreshCalculation: async () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItemState[]>(() => {
    try {
      const saved = localStorage.getItem('bajaj_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [calculation, setCalculation] = useState<CartCalculation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('bajaj_cart', JSON.stringify(items));
    } catch {
      // storage error
    }
    refreshCalculation();
  }, [items]);

  const refreshCalculation = async () => {
    if (items.length === 0) {
      setCalculation(null);
      return;
    }
    setLoading(true);
    try {
      const payload = items.map(i => ({ product_id: i.productId, quantity: i.quantity }));
      const result = await apiRequest<CartCalculation>('/cart/calculate', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setCalculation(result);
    } catch (err) {
      console.error('Failed to recalculate cart', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { productId: product.id, quantity, product }];
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev =>
      prev.map(i => (i.productId === productId ? { ...i, quantity } : i))
    );
  };

  const removeFromCart = (productId: number) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
    setCalculation(null);
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        calculation,
        loading,
        totalCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCalculation,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
