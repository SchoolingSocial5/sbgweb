"use client"
import { formatRelatedDate } from "@/lib/helpers";
import TransactionStore from "@/src/zustand/Transaction";
import { DollarSign } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export function SalesCard() {
    const { latest, getLatestTransactions } = TransactionStore()

    useEffect(() => {
        getLatestTransactions(`/transactions/?page_size=5&ordering=-createdAt`)
    }, [])

    return (
        <div className="bg-[var(--primary)] shadow p-4 border-l-4 border-blue-500">
            <Link href={`/admin/transactions`}><h2 className="text-lg font-semibold mb-2">Transactions</h2></Link>

            {latest.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">

                    <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-100 mb-4">
                        <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>

                    <p className="text-sm font-medium text-gray-700">
                        No sales recorded
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                        Completed sales transactions will appear here.
                    </p>

                    <button className="mt-4 text-xs px-4 py-2 bg-blue-600 text-white rounded-lg hover:opacity-90 transition">
                        + Record Sale
                    </button>
                </div>
            ) : (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left border-b border-b-[var(--border)]">
                            <th>Date</th>
                            <th>Customer</th>
                            <th className="text-right">Revenue (₦)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {latest.map((item, i) => (
                            <tr
                                key={i}
                                className="border-b border-b-[var(--border)] last:border-none"
                            >
                                {item.createdAt && (
                                    <td className="py-2 font-medium">
                                        {formatRelatedDate(item.createdAt)}
                                    </td>
                                )}
                                <td>{item.fullName}</td>
                                <td className={`text-right font-medium ${!item.isProfit ? "text-red-500" : ""}`}>
                                    ₦{item.totalAmount.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
