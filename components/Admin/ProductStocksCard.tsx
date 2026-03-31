"use client"
import { formatMoney } from "@/lib/helpers";
import StockingStore from "@/src/zustand/Stocking";
import { Package } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export function ProductStocksCard() {
    const { latestStocks, getLatestStocks, } = StockingStore()

    useEffect(() => {
        getLatestStocks(`/products?page_size=5&page=1&ordering=-createdAt`)
    }, [])

    return (
        <div className="bg-[var(--primary)] shadow p-4 border-l-4 border-purple-500">
            <Link href={`/admin/products/stocks`}><h2 className="text-lg font-semibold mb-2">Product Stocks</h2></Link>

            {latestStocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">

                    <div className="w-14 h-14 flex items-center justify-center rounded-full bg-purple-100 mb-4">
                        <Package className="w-6 h-6 text-purple-600" />
                    </div>

                    <p className="text-sm font-medium text-gray-700">
                        No product stock available
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                        Added products will appear here.
                    </p>

                    <button className="mt-4 text-xs px-4 py-2 bg-purple-600 text-white rounded-lg hover:opacity-90 transition">
                        + Add Product
                    </button>
                </div>
            ) : (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left border-b border-b-[var(--border)]">
                            <th>Product</th>
                            <th>Percentage</th>
                            <th className="text-right">Stock</th>
                        </tr>
                    </thead>
                    <tbody>
                        {latestStocks.map((item, i) => (
                            <tr
                                key={i}
                                className="border-b border-b-[var(--border)] last:border-none"
                            >
                                <td className="py-2">{item.name}</td>
                                <td className="text-[var(--success)]">{item.percentageProduction ? `${(item.percentageProduction * 100).toFixed(2)}%` : "N/A"}</td>
                                <td className="text-right font-medium">{formatMoney(item.units)} {item.purchaseUnit}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}