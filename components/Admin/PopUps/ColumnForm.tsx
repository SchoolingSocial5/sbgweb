'use client'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import ColumnStore from '@/src/zustand/Column'

const ColumnForm: React.FC = () => {
    const {
        columnForm,
        loading,
        createColumn,
        updateColumn,
        setForm,
        resetForm,
    } = ColumnStore()
    const { setMessage } = MessageStore()
    const { setAlert } = AlartStore()

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm('name', e.target.value)
    }

    const closeForm = () => {
        ColumnStore.setState({ isForm: false })
        resetForm()
    }

    const handleSubmit = async () => {
        if (!columnForm.name.trim()) {
            setMessage('Column name is required', false)
            return
        }

        setAlert(
            'Confirm Submission',
            `Are you sure you want to ${columnForm._id ? 'update' : 'create'} this column?`,
            true,
            () => {
                const url = columnForm._id ? `/columns/${columnForm._id}` : '/columns'
                const action = columnForm._id ? updateColumn : createColumn

                action(url, columnForm as unknown as Record<string, unknown>, setMessage, () => {
                    ColumnStore.setState({ isForm: false })
                    resetForm()
                })
            }
        )
    }

    return (
        <div
            onClick={closeForm}
            className="fixed h-full w-full z-50 left-0 top-0 bg-black/50 items-center justify-center flex p-4"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="card_body sharp w-full max-w-[400px] flex flex-col"
            >
                <div className="text-xl font-bold mb-4 border-b pb-2">
                    {columnForm._id ? 'Edit Column' : 'Add New Column'}
                </div>

                <div className="flex flex-col mb-6">
                    <label className="label">Column Name</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., Medium Eggs, Small Eggs"
                        value={columnForm.name}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                        className="custom_btn danger"
                        onClick={closeForm}
                    >
                        Cancel
                    </button>
                    <button
                        className="custom_btn"
                        disabled={loading}
                        onClick={handleSubmit}
                    >
                        {loading ? <i className="bi bi-opencollective loading mr-2"></i> : null}
                        {columnForm._id ? 'Update Column' : 'Create Column'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ColumnForm
