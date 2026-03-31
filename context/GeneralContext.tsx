'use client'
import { initializeSound } from '@/lib/sound'
import useSocket from '@/src/useSocket'
import ConsumptionStore, { Consumption } from '@/src/zustand/Consumption'
import ExpenseStore, { Expense } from '@/src/zustand/Expenses'
import { MessageStore } from '@/src/zustand/notification/Message'
import StockingStore, { Stocking } from '@/src/zustand/Stocking'
import TransactionStore, { Transaction } from '@/src/zustand/Transaction'
import { createContext, useEffect, useContext, ReactNode, useMemo } from 'react'

const GeneralContext = createContext<{
  socket: ReturnType<typeof useSocket> | null
}>({
  socket: null,
})

interface GeneralProviderProps {
  children: ReactNode
}

export const GeneralProvider = ({ children }: GeneralProviderProps) => {
  const socket = useSocket()
  const { setBaseUrl } = MessageStore()

  useEffect(() => {
    initializeSound()
    const url =
      process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_PROD_API_URL
        : process.env.NEXT_PUBLIC_DEV_API_URL
    setBaseUrl(String(url))
  }, [])


  useEffect(() => {
    if (!socket) return;

    socket.on("consumption", (data: { consumption: Consumption }) => {
      if (data.consumption) {
        ConsumptionStore.setState(prev => {
          return {
            latestConsumptions: [data.consumption, ...prev.latestConsumptions]
          }
        })
      }
    });
    socket.on("expenses", (data: { expenses: Expense }) => {
      if (data.expenses) {
        ExpenseStore.setState(prev => {
          return {
            latestExpenses: [data.expenses, ...prev.latestExpenses]
          }
        })
      }
    });
    socket.on("stocking", (data: { production: Stocking, stocking: Stocking }) => {
      if (data.production) {
        StockingStore.setState(prev => {
          return {
            latestProductions: [data.production, ...prev.latestProductions]
          }
        })
        StockingStore.setState(prev => {
          return {
            latestStocks: prev.latestStocks.map((e) => e._id === data.stocking.productId ? { ...e, units: data.stocking.units } : e)
          }
        })
      }
    });
    socket.on("motality", (data: { stocking: Stocking }) => {
      if (data.stocking) {
        StockingStore.setState(prev => {
          return {
            latestMotalities: [data.stocking, ...prev.latestMotalities]
          }
        })
      }
    });
    socket.on("transaction", (data: { transaction: Transaction }) => {
      if (data.transaction) {
        TransactionStore.setState(prev => {
          return {
            latest: [data.transaction, ...prev.latest]
          }
        })
      }
    });
    return () => {
      socket.off("stocking");
      socket.off("motality");
      socket.off("expenses");
      socket.off("consumption");
      socket.off("transaction");
    };
  }, [socket]);

  const value = useMemo(() => ({ socket }), [socket])

  return (
    <GeneralContext.Provider value={value}>{children}</GeneralContext.Provider>
  )
}

export const useGeneralContext = () => useContext(GeneralContext)
