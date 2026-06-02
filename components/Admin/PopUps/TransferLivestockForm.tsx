import { useState, useEffect } from 'react'
import ProductStore from '@/src/zustand/Product'
import { MessageStore } from '@/src/zustand/notification/Message'
import { Pen } from '@/src/zustand/Pen'

interface TransferLivestockFormProps {
    fromPen: Pen;
    pens: Pen[];
    onClose: () => void;
}

export default function TransferLivestockForm({ fromPen, pens, onClose }: TransferLivestockFormProps) {
    const { buyingProducts, transferLivestock, loading } = ProductStore()
    const { setMessage } = MessageStore()

    // Find livestock assigned to fromPen
    const livestockInPen = buyingProducts.filter(p => 
        p.type === 'Livestock' && p.penDistributions?.some(d => d.penId === fromPen._id)
    )

    const [selectedProduct, setSelectedProduct] = useState(livestockInPen.length > 0 ? livestockInPen[0]._id : '')
    const [toPen, setToPen] = useState('')
    const [quantity, setQuantity] = useState<number | ''>('')

    const selectedProductObj = livestockInPen.find(p => p._id === selectedProduct)
    const availableUnits = selectedProductObj?.penDistributions?.find(d => d.penId === fromPen._id)?.units || 0

    const [transferAs, setTransferAs] = useState(selectedProductObj?.name || '')

    useEffect(() => {
        if (selectedProductObj) {
            setTransferAs(selectedProductObj.name)
        }
    }, [selectedProductObj])

    const allLivestockNames = Array.from(
        new Set(buyingProducts.filter(p => p.type === 'Livestock').map(p => p.name))
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedProduct) {
            setMessage('Please select a livestock to transfer', true)
            return
        }

        if (!toPen) {
            setMessage('Please select a destination pen', true)
            return
        }

        if (toPen === fromPen._id) {
            setMessage('Destination pen cannot be the same as the source pen', true)
            return
        }

        if (!quantity || Number(quantity) <= 0) {
            setMessage('Please enter a valid quantity', true)
            return
        }

        if (Number(quantity) > availableUnits) {
            setMessage(`Quantity exceeds available units (${availableUnits}) in this pen`, true)
            return
        }

        const toPenObj = pens.find(p => p._id === toPen)

        await transferLivestock(
            `/products/${selectedProduct}/transfer`,
            {
                fromPenId: fromPen._id,
                toPenId: toPen,
                toPenName: toPenObj?.name || '',
                quantity: Number(quantity),
                transferAs: transferAs
            },
            setMessage,
            () => {
                onClose()
            }
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="card_body sharp w-full max-w-md bg-white dark:bg-[var(--secondary)] relative">
                <i
                    onClick={onClose}
                    className="bi bi-x-circle absolute right-4 top-4 text-2xl cursor-pointer hover:text-[var(--customRedColor)]"
                ></i>
                <div className="custom_sm_title mb-4">Transfer Livestock</div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col">
                        <label className="label">Source Pen</label>
                        <input
                            type="text"
                            className="form-input opacity-70"
                            value={fromPen.name}
                            disabled
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="label">Select Livestock</label>
                        <select
                            className="form-input"
                            value={selectedProduct}
                            onChange={e => setSelectedProduct(e.target.value)}
                        >
                            {livestockInPen.map(p => (
                                <option key={p._id} value={p._id}>
                                    {p.name} (Available: {p.penDistributions?.find(d => d.penId === fromPen._id)?.units})
                                </option>
                            ))}
                            {livestockInPen.length === 0 && (
                                <option value="">No livestock available in this pen</option>
                            )}
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="label">Transfer As</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter product name to transfer as"
                            value={transferAs}
                            onChange={e => setTransferAs(e.target.value)}
                            list="livestock-names"
                        />
                        <datalist id="livestock-names">
                            {allLivestockNames.map(name => (
                                <option key={name} value={name} />
                            ))}
                        </datalist>
                    </div>

                    <div className="flex flex-col">
                        <label className="label">Destination Pen</label>
                        <select
                            className="form-input"
                            value={toPen}
                            onChange={e => setToPen(e.target.value)}
                        >
                            <option value="">Select destination pen</option>
                            {pens.filter(p => p._id !== fromPen._id).map(p => (
                                <option key={p._id} value={p._id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="label">Quantity to Transfer</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="Enter quantity"
                            value={quantity}
                            onChange={e => setQuantity(Number(e.target.value))}
                            max={availableUnits}
                            min={1}
                        />
                    </div>

                    <div className="flex justify-end mt-4">
                        <button
                            type="submit"
                            className="custom_btn"
                            disabled={loading || livestockInPen.length === 0}
                        >
                            {loading ? <i className="bi bi-arrow-repeat loading mr-2"></i> : 'Transfer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
