"use client"
import { formatRelatedDate } from "@/lib/helpers";
import ConsumptionStore from "@/src/zustand/Consumption";
import { Wheat } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export function ConsumptionCard() {
    const { latestConsumptions, getLatestConsumptions } = ConsumptionStore()

    useEffect(() => {
        getLatestConsumptions(`/consumptions/?page_size=5&ordering=-createdAt`)
    }, [])

    return (
        <div className="bg-[var(--primary)] shadow p-4 border-l-4 border-red-500">
            <Link href={`/admin/operations/production`}><h2 className="text-lg font-semibold mb-2">Consumption</h2></Link>

            {latestConsumptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">

                    <div className="w-14 h-14 flex items-center justify-center rounded-full bg-red-100 mb-4">
                        <Wheat className="w-6 h-6 text-red-600" />
                    </div>

                    <p className="text-sm font-medium text-gray-700">
                        No consumption records found
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                        Daily feed consumption entries will appear here.
                    </p>

                    <button className="mt-4 text-xs px-4 py-2 bg-red-600 text-white rounded-lg hover:opacity-90 transition">
                        + Add Consumption
                    </button>
                </div>
            ) : (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left border-b border-b-[var(--border)]">
                            <th>Date</th>
                            <th>Livestock</th>
                            <th>Feed</th>
                            <th className="text-right">Units</th>
                        </tr>
                    </thead>
                    <tbody>
                        {latestConsumptions.map((item, i) => (
                            <tr
                                key={i}
                                className={`border-b border-b-[var(--border)] last:border-none`}
                            >
                                {item.createdAt && <td className="py-2">
                                    {formatRelatedDate(item.createdAt)}
                                </td>}
                                <td>{item.birdClass}</td>
                                <td>{item.feed}</td>
                                <td className="text-right font-medium">
                                    {item.consumption} {item.consumptionUnit}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
