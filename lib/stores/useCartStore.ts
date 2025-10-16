import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  title: string;
  type: string;
  countries: string[];
  collectionId: string;
  image?: string;
  unitPrice: number;
  collection?: any;
  columns?: any[];
  filteredData: Record<string, string>[];
  volume: number;
}

interface CartStore {
  carts: CartItem[];
  setCarts: (carts: CartItem[]) => void;
  addCart: (cart: CartItem) => void;
  removeCart: (cartId: string) => void;
  removeCarts: (cartIds: string[]) => void;
  clearCarts: () => void;
}

const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      carts: [],
      
      setCarts: (carts) => set({ carts }),
      
      addCart: (cart) => 
        set((state) => {
          // Remove existing cart with same collection
          const filtered = state.carts.filter(
            (c) => c.collectionId !== cart.collectionId
          );
          return { carts: [...filtered, cart] };
        }),
      
      removeCart: (cartId) =>
        set((state) => ({
          carts: state.carts.filter((cart) => cart.id !== cartId),
        })),
      
      removeCarts: (cartIds) =>
        set((state) => ({
          carts: state.carts.filter((cart) => !cartIds.includes(cart.id)),
        })),
      
      clearCarts: () => set({ carts: [] }),
    }),
    {
      name: 'cart-storage',
    }
  )
);

export default useCartStore;

