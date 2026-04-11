import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'
import TransactionStore, { Transaction } from './Transaction'
import NotificationStore, { Notification } from './notification/Notification'

const getSavedCart = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('paragon_cart');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.log(e)
      return []; // Safety if JSON is corrupted
    }
  }
  return [];
};

export interface NotificationResult {
  notification: Notification
  unread: number
}

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Product[]
  data: Product
  result: FetchResponse
  transaction: Transaction
  notificationResult: NotificationResult
}

export interface Cart {
  _id: string
  customer: string
  username: string
  delivery: string
  products: Product[]
  totalItems: number
  items: number
  totalAmount: number
  createdAt: Date | null | number
  isChecked?: boolean
  isActive?: boolean
}

export const CartEmpty = {
  _id: '',
  customer: '',
  username: '',
  delivery: 'Instant',
  products: [],
  totalItems: 0,
  items: 0,
  totalAmount: 0,
  createdAt: null,
}

export interface Product {
  _id: string
  name: string
  supName: string
  remark: string
  supAddress: string
  supPhone: string
  purchaseUnit: string
  consumptionUnit: string
  discount: number
  cartUnits: number
  unitPerPurchase: number
  percentageProduction: number
  units: number
  costPrice: number
  price: number
  adjustedPrice: number
  description: string
  picture: string | File
  payment?: string
  type: 'Feed' | 'Medicine' | 'Water' | 'Livestock' | 'General'
  isProducing: boolean
  isSelling: boolean
  createdAt: Date | null | number
  dateOfBirth?: string | Date | null
  seoTitle: string
  isBuyable: boolean
  pId: string
  isChecked?: boolean
  isActive?: boolean
  penDistributions: { penId: string; penName: string; units: number }[]
}

export const ProductEmpty = {
  _id: '',
  name: '',
  supName: '',
  supAddress: '',
  supPhone: '',
  purchaseUnit: '',
  remark: '',
  discount: 0,
  percentageProduction: 0,
  units: 0,
  unitPerPurchase: 1,
  consumptionUnit: '',
  costPrice: 0,
  adjustedPrice: 0,
  price: 0,
  cartUnits: 0,
  description: '',
  picture: '',
  type: 'General' as const,
  isProducing: false,
  isSelling: false,
  createdAt: 0,
  dateOfBirth: null,
  seoTitle: '',
  isBuyable: false,
  pId: '',
  payment: '',
  penDistributions: [],
}

interface ProductState {
  count: number
  feedsCount: number
  medicinesCount: number
  livestockCount: number
  page_size: number
  totalAmount: number
  products: Product[]
  buyingProducts: Product[]
  feeds: Product[]
  medicines: Product[]
  livestockProducts: Product[]
  cartProducts: Product[]
  buyingCartProducts: Product[]
  cart: Cart
  loading: boolean
  showStocking: boolean
  showBuyProductForm: boolean
  setShowBuyProductForm: (status: boolean) => void
  showProductForm: boolean
  setShowProductForm: (status: boolean) => void
  selectedProducts: Product[]
  searchedProducts: Product[]
  isAllChecked: boolean
  productForm: Product
  setForm: (key: keyof Product, value: Product[keyof Product]) => void
  setToCart: (p: Product, isAdd: boolean) => void
  setToBuyCart: (p: Product, isAdd: boolean) => void
  setShowStocking: (status: boolean) => void
  setIsPurchaseMode: (status: boolean) => void
  isPurchaseMode: boolean
  resetForm: () => void
  updateBuyingProducts: () => void
  updateCartUnits: (id: string, units: number) => void
  updateBuyingCartUnits: (id: string, units: number) => void
  getProducts: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getBuyingProducts: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getFeeds: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getMedicines: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getLivestock: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getProduct: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  updateUnitPrice: (value: number, price: number) => void
  setProcessedResults: (data: FetchResponse) => void
  processBuyingProducts: (data: FetchResponse) => void
  processFeeds: (data: FetchResponse) => void
  processMedicines: (data: FetchResponse) => void
  processLivestock: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedProducts: Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>
  updateProduct: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  postProduct: (
    url: string,
    data: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  createTransaction: (
    url: string,
    data: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  postStocking: (
    url: string,
    data: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  clearCart: () => void
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  searchProducts: (url: string) => void
  decrementStock: (id: string, units: number, penName?: string) => void
  syncCategorizedLists: (data: FetchResponse) => void
}

const ProductStore = create<ProductState>((set) => ({
  count: 0,
  feedsCount: 0,
  medicinesCount: 0,
  livestockCount: 0,
  page_size: 0,
  totalAmount: getSavedCart().reduce(
    (sum: number, item: Product) => sum + item.cartUnits * (item.price || 0),
    0
  ),
  cart: CartEmpty,
  products: [],
  buyingProducts: [],
  feeds: [],
  medicines: [],
  livestockProducts: [],
  cartProducts: getSavedCart(),
  buyingCartProducts: [],
  productStockings: [],
  isPurchaseMode: false,
  setIsPurchaseMode: (status: boolean) =>
    set({ isPurchaseMode: status }),
  loading: false,
  showStocking: false,
  showBuyProductForm: false,
  setShowBuyProductForm: (status: boolean) =>
    set({ showBuyProductForm: status }),
  showProductForm: false,
  setShowProductForm: (status: boolean) =>
    set({ showProductForm: status }),
  selectedProducts: [],
  searchedProducts: [],
  isAllChecked: false,
  productForm: ProductEmpty,

  setForm: (key, value) =>
    set((state) => ({
      productForm: {
        ...state.productForm,
        [key]: value,
      },
    })),

  resetForm: () =>
    set({
      productForm: ProductEmpty,
      isPurchaseMode: false,
    }),

  updateUnitPrice: (value, index) => {
    set((state) => {
      const updated = [...state.cartProducts]
      updated[index] = {
        ...updated[index],
        adjustedPrice: value,
      }
      return { cartProducts: updated }
    })
  },

  updateBuyingProducts: () => {
    set((state) => {
      const products = state.buyingProducts.map((item) => ({
        ...item,
        cartUnits: 0,
      }))
      return { buyingProducts: products }
    })
  },

  processFeeds: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Product) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))
      set({ feedsCount: count, page_size, feeds: updatedResults })
    }
  },

  processMedicines: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Product) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))
      set({ medicinesCount: count, page_size, medicines: updatedResults })
    }
  },

  processLivestock: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Product) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))
      set({
        livestockCount: count,
        page_size,
        livestockProducts: updatedResults,
      })
    }
  },

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Product) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        count,
        page_size,
        products: updatedResults,
      })
    }
  },

  processBuyingProducts: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Product) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        count,
        page_size,
        buyingProducts: updatedResults,
      })
    }
  },

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setToCart: (p, isAdded) => {
    set((prev) => {
      const existing = prev.cartProducts.find((item) => item._id === p._id);

      const updateProductsCartUnits = (id: string, newUnits: number) =>
        prev.products.map((prod) =>
          prod._id === id ? { ...prod, cartUnits: newUnits } : prod
        );

      let nextState = prev;

      if (existing) {
        const newUnits = isAdded ? existing.cartUnits + 1 : existing.cartUnits - 1;

        if (!isAdded && newUnits <= 0) {
          const updatedCart = prev.cartProducts.filter((item) => item._id !== p._id);
          nextState = {
            ...prev,
            cartProducts: updatedCart,
            products: updateProductsCartUnits(p._id, 0),
            totalAmount: updatedCart.reduce((sum, item) => sum + item.cartUnits * (item.price || 0), 0),
          };
        } else {
          const updatedCart = prev.cartProducts.map((item) =>
            item._id === p._id ? { ...item, cartUnits: newUnits } : item
          );
          nextState = {
            ...prev,
            cartProducts: updatedCart,
            products: updateProductsCartUnits(p._id, newUnits),
            totalAmount: updatedCart.reduce((sum, item) => sum + item.cartUnits * (item.price || 0), 0),
          };
        }
      } else if (isAdded) {
        const updatedCart = [...prev.cartProducts, { ...p, cartUnits: 1 }];
        nextState = {
          ...prev,
          cartProducts: updatedCart,
          products: updateProductsCartUnits(p._id, 1),
          totalAmount: updatedCart.reduce((sum, item) => sum + item.cartUnits * (item.price || 0), 0),
        };
      }

      // Persist to LocalStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('paragon_cart', JSON.stringify(nextState.cartProducts));
      }

      return nextState;
    });
  },

  clearCart: () => {
    set((prev) => {
      const resetProducts = prev.products.map((prod) => ({
        ...prod,
        cartUnits: 0,
      }));

      const clearedState = {
        ...prev,
        cartProducts: [],
        products: resetProducts,
        totalAmount: 0,
      };

      if (typeof window !== 'undefined') {
        localStorage.removeItem('paragon_cart');
      }

      return clearedState;
    });
  },

  setToBuyCart: (p, isAdded) => {
    set((prev) => {
      const existing = prev.buyingCartProducts.find(
        (item) => item._id === p._id
      )

      const updateAllLists = (id: string, newUnits: number) => {
        const mapper = (prod: Product) => prod._id === id ? { ...prod, cartUnits: newUnits } : prod;
        return {
          buyingProducts: prev.buyingProducts.map(mapper),
          feeds: prev.feeds.map(mapper),
          medicines: prev.medicines.map(mapper),
          livestockProducts: prev.livestockProducts.map(mapper),
        }
      }

      let updatedCart: typeof prev.buyingCartProducts = []

      if (existing) {
        const newUnits = isAdded
          ? existing.cartUnits + 1
          : existing.cartUnits - 1

        if (!isAdded && newUnits <= 0) {
          updatedCart = prev.buyingCartProducts.filter(
            (item) => item._id !== p._id
          )
          return {
            ...updateAllLists(p._id, 0),
            buyingCartProducts: updatedCart,
            totalAmount: updatedCart.reduce(
              (sum, item) => sum + item.cartUnits * (item.price || 0),
              0
            ),
          }
        }

        updatedCart = prev.buyingCartProducts.map((item) =>
          item._id === p._id ? { ...item, cartUnits: newUnits } : item
        )

        return {
          ...updateAllLists(p._id, newUnits),
          buyingCartProducts: updatedCart,
          totalAmount: updatedCart.reduce(
            (sum, item) => sum + item.cartUnits * (item.price || 0),
            0
          ),
        }
      }

      if (isAdded) {
        updatedCart = [...prev.buyingCartProducts, { ...p, cartUnits: 1 }]

        return {
          ...updateAllLists(p._id, 1),
          buyingCartProducts: updatedCart,
          totalAmount: updatedCart.reduce(
            (sum, item) => sum + item.cartUnits * (item.price || 0),
            0
          ),
        }
      }

      return prev
    })
  },

  updateCartUnits: (productId: string, newUnits: number) => {
    set((prev) => {
      // Ensure units can’t go below 0
      const units = Math.max(0, newUnits)

      const existing = prev.cartProducts.find((item) => item._id === productId)

      const updateProductsCartUnits = (id: string, newUnits: number) =>
        prev.products.map((prod) =>
          prod._id === id ? { ...prod, cartUnits: newUnits } : prod
        )

      let updatedCart: typeof prev.cartProducts = []

      // If the product exists in the cart
      if (existing) {
        if (units === 0) {
          // Remove item if units go to 0
          updatedCart = prev.cartProducts.filter(
            (item) => item._id !== productId
          )
        } else {
          // Update quantity directly
          updatedCart = prev.cartProducts.map((item) =>
            item._id === productId ? { ...item, cartUnits: units } : item
          )
        }
      } else if (units > 0) {
        // Add to cart if not existing and units > 0
        const product = prev.products.find((p) => p._id === productId)
        if (product) {
          updatedCart = [...prev.cartProducts, { ...product, cartUnits: units }]
        } else {
          updatedCart = prev.cartProducts
        }
      } else {
        updatedCart = prev.cartProducts
      }

      return {
        cartProducts: updatedCart,
        products: updateProductsCartUnits(productId, units),
        totalAmount: updatedCart.reduce(
          (sum, item) => sum + item.cartUnits * (item.price || 0),
          0
        ),
      }
    })
  },

  updateBuyingCartUnits: (productId: string, newUnits: number) => {
    set((prev) => {
      const units = Math.max(0, newUnits)
      const existing = prev.buyingCartProducts.find(
        (item) => item._id === productId
      )

      const updateAllLists = (id: string, newUnits: number) => {
        const mapper = (prod: Product) => prod._id === id ? { ...prod, cartUnits: newUnits } : prod;
        return {
          buyingProducts: prev.buyingProducts.map(mapper),
          feeds: prev.feeds.map(mapper),
          medicines: prev.medicines.map(mapper),
          livestockProducts: prev.livestockProducts.map(mapper),
        }
      }

      let updatedCart: typeof prev.buyingCartProducts = []

      if (existing) {
        if (units === 0) {
          updatedCart = prev.buyingCartProducts.filter(
            (item) => item._id !== productId
          )
        } else {
          updatedCart = prev.buyingCartProducts.map((item) =>
            item._id === productId ? { ...item, cartUnits: units } : item
          )
        }
      } else if (units > 0) {
        // Find product in any of the categories
        const product = prev.buyingProducts.find((p) => p._id === productId) || 
                        prev.feeds.find((p) => p._id === productId) ||
                        prev.medicines.find((p) => p._id === productId) ||
                        prev.livestockProducts.find((p) => p._id === productId);

        if (product) {
          updatedCart = [
            ...prev.buyingCartProducts,
            { ...product, cartUnits: units },
          ]
        } else {
          updatedCart = prev.buyingCartProducts
        }
      } else {
        updatedCart = prev.buyingCartProducts
      }

      return {
        ...updateAllLists(productId, units),
        buyingCartProducts: updatedCart,
        totalAmount: updatedCart.reduce(
          (sum, item) => sum + item.cartUnits * (item.price || 0),
          0
        ),
      }
    })
  },

  setShowStocking: (loadState: boolean) => {
    set({ showStocking: loadState })
  },

  getProducts: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: ProductStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        ProductStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getFeeds: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: ProductStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        ProductStore.getState().processFeeds(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getMedicines: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: ProductStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        ProductStore.getState().processMedicines(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getLivestock: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: ProductStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        ProductStore.getState().processLivestock(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getBuyingProducts: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: ProductStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        ProductStore.getState().processBuyingProducts(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getProduct: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: ProductStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({ productForm: data.data })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      products: state.products.map((item: Product) => ({
        ...item,
        isChecked: false,
        isActive: false,
        cartUnits: 0,
      })),
    }))
  },

  searchProducts: _debounce(async (url: string) => {
    const response = await apiRequest<FetchResponse>(url, {
      setLoading: ProductStore.getState().setLoading,
    })
    const results = response?.data.results
    if (results) {
      set({ searchedProducts: results })
    }
  }, 1000),

  massDelete: async (
    url,
    selectedProducts,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: selectedProducts,
      setMessage,
      setLoading: ProductStore.getState().setLoading,
    })
    const data = response?.data
    console.log(data)
    if (data) {
      ProductStore.getState().setProcessedResults(data)
      ProductStore.getState().syncCategorizedLists(data)
    }
  },

  deleteItem: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setLoading?: (loading: boolean) => void
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'DELETE',
      setMessage,
      setLoading,
    })
    const data = response?.data
    if (data) {
      ProductStore.getState().setProcessedResults(data)
      ProductStore.getState().syncCategorizedLists(data)
    }
  },

  updateProduct: async (url, updatedItem, setMessage, redirect) => {
    try {
      set({ loading: true })
      const response = await apiRequest<FetchResponse>(url, {
        method: 'PATCH',
        body: updatedItem,
        setMessage,
        setLoading: ProductStore.getState().setLoading,
      })
      if (response?.data) {
        ProductStore.getState().setProcessedResults(response.data)
        ProductStore.getState().syncCategorizedLists(response.data)
      }
      if (redirect) redirect()
    } catch (error) {
      console.error("Update product failed:", error)
    } finally {
      set({ loading: false })
    }
  },

  syncCategorizedLists: (data: FetchResponse) => {
    const { results } = data
    if (!results || results.length === 0) return

    // Identify types in results
    const types = [...new Set(results.map((p: Product) => p.type))]

    set(() => {
      const newState: Partial<ProductState> = {}
      
      const format = (items: Product[]) => items.map(item => ({
        ...item,
        isChecked: false,
        isActive: false
      }))

      if (types.includes('Feed')) {
        // If the results are specifically feeds (common from category-specific refreshes)
        // or contain feeds, we could merge or replace. 
        // Standard behavior here seems to be replacement of the list.
        const feeds = results.filter((p: Product) => p.type === 'Feed')
        if (feeds.length > 0) {
            newState.feeds = format(feeds)
            newState.feedsCount = data.count || feeds.length
        }
      }

      if (types.includes('Medicine')) {
        const meds = results.filter((p: Product) => p.type === 'Medicine')
        if (meds.length > 0) {
            newState.medicines = format(meds)
            newState.medicinesCount = data.count || meds.length
        }
      }

      if (types.includes('Livestock')) {
        const livestock = results.filter((p: Product) => p.type === 'Livestock')
        if (livestock.length > 0) {
            newState.livestockProducts = format(livestock)
            newState.livestockCount = data.count || livestock.length
        }
      }

      const buyable = results.filter((p: Product) => p.isBuyable)
      if (buyable.length > 0) {
        newState.buyingProducts = format(buyable)
        // Note: we don't necessarily update 'count' here because it might conflict with the 'products' count
      }

      return newState
    })
  },

  postProduct: async (url, updatedItem, setMessage, redirect) => {
    try {
      set({ loading: true })
      const response = await apiRequest<FetchResponse>(url, {
        method: 'POST',
        body: updatedItem,
        setMessage,
        setLoading: ProductStore.getState().setLoading,
      })
      if (response?.data) {
        ProductStore.getState().setProcessedResults(response.data)
        ProductStore.getState().syncCategorizedLists(response.data)
      }

      if (redirect) redirect()
    } catch (error) {
      console.error("Post product failed:", error)
    } finally {
      set({ loading: false })
    }
  },

  createTransaction: async (url, body: any, setMessage, redirect) => {
    try {
      set({ loading: true })

      // Handle both single objects and arrays for bulk creation
      const finalBody = Array.isArray(body)
        ? body.map((item) => ({
          ...item,
          createdAt: item.createdAt || new Date(),
        }))
        : {
          ...body,
          createdAt: body.createdAt || new Date(),
        }

      const response = await apiRequest<FetchResponse>(url, {
        method: 'POST',
        body: finalBody,
        setMessage,
      })
      const data = response?.data
      if (data) {
        ProductStore.getState().setProcessedResults(data.result)
        ProductStore.getState().syncCategorizedLists(data.result)
        if (data.transaction) {
          TransactionStore.setState((prev) => {
            return {
              transactions: [data.transaction, ...prev.transactions],
            }
          })
        }
        if (data.notificationResult) {
          NotificationStore.setState((prev) => {
            return {
              unread: data.notificationResult.unread,
              notifications: [
                data.notificationResult.notification,
                ...prev.notifications,
              ],
            }
          })
        }
      }
      if (redirect) {
        redirect()
        set({ cartProducts: [], buyingCartProducts: [], totalAmount: 0 })
      }
    } catch (error: any) {
      console.log(error)
      // Save offline if network error
      if (!error.response || error.code === 'ECONNABORTED') {
        const type = url.includes('purchase') ? 'purchase' : 'sale';
        const { offlineDb } = await import('@/lib/offlineDb');
        await offlineDb.saveRecord({
          type,
          url,
          body,
        });

        if (setMessage) setMessage('Saved to local queue. Will sync when online.', true);
        if (redirect) {
          redirect()
          set({ cartProducts: [], buyingCartProducts: [], totalAmount: 0 })
        }
      }
    } finally {
      set({ loading: false })
    }
  },

  postStocking: async (url, body: any, setMessage, redirect) => {
    try {
      set({ loading: true })
      
      // Handle both single objects and arrays for bulk creation
      const finalBody = Array.isArray(body)
        ? body.map((item) => ({
          ...item,
          createdAt: item.createdAt || new Date(),
        }))
        : {
          ...body,
          createdAt: body.createdAt || new Date(),
        }

      await apiRequest<FetchResponse>(url, {
        method: 'POST',
        body: finalBody,
        setMessage,
        setLoading: ProductStore.getState().setLoading,
      })

      if (redirect) redirect()
    } catch (error: any) {
      console.error("Post stocking failed:", error)
      // Save offline if network error
      if (!error.response || error.code === 'ECONNABORTED') {
        const type = url.includes('profit=true') ? 'production' : 'mortality';
        const { offlineDb } = await import('@/lib/offlineDb');
        await offlineDb.saveRecord({
          type,
          url,
          body,
        });

        if (setMessage) setMessage('Stocking saved offline.', true);
        if (redirect) redirect();
      }
    } finally {
      set({ loading: false })
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.products[index]?.isActive
      const updatedResults = state.products.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        products: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.products.map((tertiary, idx) =>
        idx === index
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )

      const isAllChecked = updatedResults.every(
        (tertiary) => tertiary.isChecked
      )
      const updatedSelectedProducts = updatedResults.filter(
        (tertiary) => tertiary.isChecked
      )

      return {
        products: updatedResults,
        selectedProducts: updatedSelectedProducts,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.products.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.products.map((item) => ({
        ...item,
        isChecked: isAllChecked,
      }))

      const updatedSelectedProducts = isAllChecked ? updatedResults : []

      return {
        products: updatedResults,
        selectedProducts: updatedSelectedProducts,
        isAllChecked,
      }
    })
  },
  
  decrementStock: (id: string, quantity: number, penName?: string) => {
    set((state) => {
      const mapper = (p: Product) => {
        if (p._id !== id) return p;
        
        let newDistributions = p.penDistributions || [];
        if (penName) {
          newDistributions = newDistributions.map(d => 
            d.penName === penName ? { ...d, units: Math.max(0, d.units - quantity) } : d
          );
        }
        
        return {
          ...p,
          units: Math.max(0, p.units - quantity),
          penDistributions: newDistributions
        };
      };

      return {
        products: state.products.map(mapper),
        buyingProducts: state.buyingProducts.map(mapper),
        feeds: state.feeds.map(mapper),
        medicines: state.medicines.map(mapper),
        livestockProducts: state.livestockProducts.map(mapper),
      };
    });
  },
}))

export default ProductStore