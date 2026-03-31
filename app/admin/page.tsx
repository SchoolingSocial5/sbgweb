"use client"
import { ConsumptionCard } from "@/components/Admin/ConsumptionCard";
import { ExpensesCard } from "@/components/Admin/ExpensesCard";
import { MortalityCard } from "@/components/Admin/MortalityCard";
import { ProductionCard } from "@/components/Admin/ProductionCard";
import { ProductStocksCard } from "@/components/Admin/ProductStocksCard";
import { SalesCard } from "@/components/Admin/SalesCard";
import { AuthStore } from "@/src/zustand/user/AuthStore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = AuthStore()

  useEffect(() => {
    if (user && !user.roles.includes("Director")) {
      router.push(`/admin/profile`)
    }
  }, [pathname, user])
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 xl:gap-6 gap-2 pb-4">
      <MortalityCard />
      <ProductionCard />
      <SalesCard />
      <ProductStocksCard />
      <ConsumptionCard />
      <ExpensesCard />
    </div>
  );
}
