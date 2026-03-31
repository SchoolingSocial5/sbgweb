"use client"
import { formatRelatedDate } from "@/lib/helpers";
import ExpenseStore from "@/src/zustand/Expenses";
import { Receipt } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export function ExpensesCard() {
    const { latestExpenses, getLatestExpenses } = ExpenseStore()
    useEffect(() => {
        getLatestExpenses(`/expenses/latest`)
    }, [])

    return (
        <div className="bg-[var(--primary)] shadow p-4 border-l-4 border-yellow-500">
            <Link href={`/admin/operations/expenses`}><h2 className="text-lg font-semibold mb-2">Expenses</h2></Link>

            {latestExpenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">

                    <div className="w-14 h-14 flex items-center justify-center rounded-full bg-yellow-100 mb-4">
                        <Receipt className="w-6 h-6 text-yellow-600" />
                    </div>

                    <p className="text-sm font-medium text-gray-700">
                        No expenses recorded
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                        When expenses are added, they will appear here.
                    </p>

                    <button className="mt-4 text-xs px-4 py-2 bg-yellow-500 text-white rounded-lg hover:opacity-90 transition">
                        + Add Expense
                    </button>
                </div>
            ) : (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left border-b border-b-[var(--border)]">
                            <th>Date</th>
                            <th>Item</th>
                            <th className="text-right">Amount (₦)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {latestExpenses.map((item, i) => (
                            <tr
                                key={i}
                                className="border-b border-b-[var(--border)] last:border-none"
                            >
                                {item.createdAt && <td className="py-2">
                                    {formatRelatedDate(item.createdAt)}
                                </td>}
                                <td>{item.description}</td>
                                <td className="text-right font-medium">
                                    {item.amount.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
