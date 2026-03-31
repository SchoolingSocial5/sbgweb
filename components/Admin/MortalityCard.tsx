"use client"
import { formatRelatedDate } from "@/lib/helpers";
import StockingStore from "@/src/zustand/Stocking";
import { Skull } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export function MortalityCard() {
    const { latestMotalities, getLatestMotalities } = StockingStore()

    useEffect(() => {
        getLatestMotalities(`/products/stocking/?page_size=5&ordering=-createdAt&isProfit=false`)
    }, [])

    return (
        <div className="bg-[var(--primary)] shadow p-4 border-l-4 border-red-500">
            <Link href={`/admin/operations/production`}><h2 className="text-lg font-semibold mb-2">Mortality</h2></Link>

            {latestMotalities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">

                    <div className="w-14 h-14 flex items-center justify-center rounded-full bg-red-100 mb-4">
                        <Skull className="w-6 h-6 text-red-600" />
                    </div>

                    <p className="text-sm font-medium text-gray-700">
                        No mortality records
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                        Recorded bird losses will appear here.
                    </p>

                    <button className="mt-4 text-xs px-4 py-2 bg-red-600 text-white rounded-lg hover:opacity-90 transition">
                        + Record Mortality
                    </button>
                </div>
            ) : (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left border-b border-b-[var(--border)]">
                            <th>Date</th>
                            <th>Cause</th>
                            <th className="text-right">Birds</th>
                        </tr>
                    </thead>
                    <tbody>
                        {latestMotalities.map((item, i) => (
                            <tr
                                key={i}
                                className="border-b border-b-[var(--border)] last:border-none"
                            >
                                {item.createdAt && <td className="py-2 font-medium">
                                    {formatRelatedDate(item.createdAt)}
                                </td>}
                                <td>{item.name}</td>
                                <td className="text-right font-medium">
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
