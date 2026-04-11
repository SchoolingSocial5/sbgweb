"use client"
import { formatRelatedDate } from "@/lib/helpers";
import StockingStore from "@/src/zustand/Stocking";
import { Egg } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export function ProductionCard() {
    const { latestProductions, getLatestProductions } = StockingStore()

    useEffect(() => {
        getLatestProductions(`/products/stocking/?page_size=5&ordering=-createdAt&isProfit=true`)
    }, [])

    return (
        <div className="bg-[var(--primary)] shadow p-4 border-l-4 border-green-500">
            <Link href={`/admin/operations/production`}><h2 className="text-lg font-semibold mb-2">Production</h2></Link>

            {latestProductions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">

                    <div className="w-14 h-14 flex items-center justify-center rounded-full bg-green-100 mb-4">
                        <Egg className="w-6 h-6 text-green-600" />
                    </div>

                    <p className="text-sm font-medium text-gray-700">
                        No production records found
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                        Daily egg production entries will appear here.
                    </p>

                    <button className="mt-4 text-xs px-4 py-2 bg-green-600 text-white rounded-lg hover:opacity-90 transition">
                        + Add Production
                    </button>
                </div>
            ) : (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left border-b border-b-[var(--border)] text-[10px] uppercase font-bold opacity-60">
                            <th className="py-2">Date</th>
                            <th>Pen</th>
                            <th>Total Eggs</th>
                            <th>%</th>
                            <th className="text-right">Units</th>
                        </tr>
                    </thead>
                    <tbody>
                        {latestProductions.map((item, i) => (
                            <tr
                                key={i}
                                className={`border-b border-b-[var(--border)] last:border-none hover:bg-[var(--secondary)] transition-colors`}
                            >
                                {item.createdAt && <td className="py-2 whitespace-nowrap">
                                    {formatRelatedDate(item.createdAt)}
                                </td>}
                                <td className="font-semibold text-[var(--success)]">{item.pen}</td>
                                <td className="line-clamp-1">{item.name}</td>
                                <td className="text-[var(--success)] font-medium">{item.percentageProduction ? `${(item.percentageProduction * 100).toFixed(1)}%` : "N/A"}</td>
                                <td className="text-right font-bold">
                                    {item.units}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}