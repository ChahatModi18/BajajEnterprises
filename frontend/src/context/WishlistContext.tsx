import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product } from '../types';

interface WishlistContextType {
  wishlist: Product[];
  totalCount: number;
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlist: [],
  totalCount: 0,
  isInWishlist: () => false,
  toggleWishlist: () => {},
  removeFromWishlist: () => {},
});

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('bajaj_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bajaj_wishlist', JSON.stringify(wishlist));
    } catch {
      // storage error
    }
  }, [wishlist]);

  const isInWishlist = (productId: number) => {
    return wishlist.some(p => p.id === productId);
  };

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      if (prev.some(p => p.id === product.id)) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: number) => {
    setWishlist(prev => prev.filter(p => p.id !== productId));
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        totalCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
