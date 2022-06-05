import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if(storagedCart) {
      return JSON.parse(storagedCart)
    }

    return []
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const productStock: Stock = (await api.get(`stock/${productId}`)).data
      const productAlreadyInCartIndex = cart.findIndex(product => product.id === productId)
      const cartArray = [...cart]

      if(productAlreadyInCartIndex >= 0) {
        if(cartArray[productAlreadyInCartIndex].amount >= productStock.amount) {
          toast.error('Quantidade solicitada fora de estoque')
          return
        }

        cartArray[productAlreadyInCartIndex].amount += 1
      } else {
        const productToAdd: Product = (await api.get(`products/${productId}`)).data
        productToAdd.amount = 1
        cartArray.push(productToAdd)
      }

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartArray))
      setCart(cartArray)
    } catch(error) {
      // TODO
      toast.error('Erro na adição do produto')
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const productToRemoveIndex = cart.findIndex(product => product.id === productId)
      if(productToRemoveIndex < 0) {
        throw new Error()
      }

      const cartArray = [...cart]
      cartArray.splice(productToRemoveIndex, 1)

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartArray))
      setCart(cartArray)
    } catch {
      // TODO
      toast.error('Erro na remoção do produto')
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      if(amount <= 0){
        return
      }

      const productStock: Stock = (await api.get(`stock/${productId}`)).data
      if(amount > productStock.amount) {
        toast.error('Quantidade solicitada fora de estoque')
        return
      }

      const productToUpdateIndex = cart.findIndex(product => product.id === productId)
      const cartArray = [...cart]
      cartArray[productToUpdateIndex].amount = amount

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartArray))
      setCart(cartArray)
    } catch {
      // TODO
      toast.error('Erro na alteração de quantidade do produto')
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
