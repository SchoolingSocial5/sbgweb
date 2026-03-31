'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { MessageStore } from '@/src/zustand/notification/Message'
import NotificationTemplateStore, { NotificationTemplate, NotificationTemplateEmpty } from '@/src/zustand/notification/NotificationTemplate'
import LinkedPagination from '../LinkedPagination'
import NotificationForm from '../PopUps/NotificationForm'

const NotificationTemplates: React.FC = () => {
  const url = '/notifications/templates/'
  const { page } = useParams()
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()
  const pathname = usePathname()
  const {
    results,
    isAllChecked,
    selectedItems,
    loading,
    count, isNoteForm,
    getItems,
    massDelete,
    deleteItem,
    toggleAllSelected,
    toggleChecked,
    toggleActive,
    reshuffleResults,
  } = NotificationTemplateStore()
  const params = `?page_size=${page_size}&page=${page ? page : 1
    }&ordering=${sort}`

  useEffect(() => {
    reshuffleResults()
  }, [pathname])

  useEffect(() => {
    reshuffleResults()
    getItems(`${url}${params}`, setMessage)
  }, [results.length, page])

  const deleteEmail = async (id: string) => {
    await deleteItem(`${url}${id}/${params}`, setMessage)
  }

  const DeleteItems = async () => {
    if (selectedItems.length === 0) {
      setMessage('Please select at least one email to delete', false)
      return
    }
    const ids = selectedItems.map((item) => item._id)
    await massDelete(`${url}mass-delete/${params}`, { ids }, setMessage)
  }

  const selectItem = async (e: NotificationTemplate) => {
    NotificationTemplateStore.setState({ formData: e, isNoteForm: true })

  }
  return (
    <>
      <div className="overflow-auto mb-5">
        {results.length > 0 ? (
          <table>
            <thead>
              <tr className="bg-[var(--primary)] p-2">
                <th>S/N</th>
                <th>Name</th>
                <th>Title</th>
                <th>Greetings</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item, index) => (
                <tr
                  key={index}
                  className={` ${index % 2 === 1 ? 'bg-[var(--primary)]' : ''}`}
                >
                  <td>
                    <div className="flex items-center">
                      <div
                        className={`checkbox ${item.isChecked ? 'active' : ''}`}
                        onClick={() => toggleChecked(index)}
                      >
                        {item.isChecked && (
                          <i className="bi bi-check text-white text-lg"></i>
                        )}
                      </div>
                      {(page ? Number(page) - 1 : 1 - 1) * page_size +
                        index +
                        1}
                      <i
                        onClick={() => toggleActive(index)}
                        className="bi bi-three-dots-vertical text-lg cursor-pointer"
                      ></i>
                    </div>
                    {item.isActive && (
                      <div className="card_list">
                        <span
                          onClick={() => toggleActive(index)}
                          className="more_close "
                        >
                          X
                        </span>
                        <Link
                          className="card_list_item"
                          href={`/admin/company/notification-templates/edit/${item._id}`}
                        >
                          Edit
                        </Link>
                        <div
                          className="card_list_item"
                          onClick={() => deleteEmail(item._id)}
                        >
                          Delete
                        </div>
                      </div>
                    )}
                  </td>
                  <td>
                    <span onClick={() => selectItem(item)} className="cursor-pointer">{item.name}</span>
                  </td>
                  <td>{item.title}</td>
                  <td>{item.greetings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="relative flex justify-center">
            <div className="not_found_text">No Notifications Found</div>
            <Image
              className="max-w-[300px]"
              alt={`no record`}
              src="/images/not-found.png"
              width={0}
              sizes="100vw"
              height={0}
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        )}
      </div>
      {loading && (
        <div className="flex w-full justify-center py-5">
          <i className="bi bi-opencollective loading"></i>
        </div>
      )}
      <div className="card_body sharp mb-3">
        <div className="flex flex-wrap items-center">
          <div className="grid mr-auto grid-cols-4 gap-2 w-[160px]">
            <div onClick={toggleAllSelected} className="tableActions">
              <i
                className={`bi bi-check2-all ${isAllChecked ? 'text-[var(--custom)]' : ''
                  }`}
              ></i>
            </div>
            <div
              onClick={() => selectItem(NotificationTemplateEmpty)}
              className="tableActions"
            >
              <i className="bi bi-plus-circle"></i>
            </div>
            <div onClick={DeleteItems} className="tableActions">
              <i className="bi bi-trash"></i>
            </div>
            {/* <div onClick={() => showForm(true)} className="tableActions">
                    <i className="bi bi-plus-circle"></i>
                  </div> */}
            {/* <div onClick={updateExam} className="tableActions">
                    <i className="bi bi-table"></i>
                  </div> */}
          </div>
        </div>
      </div>
      <div className="card_body sharp">
        <LinkedPagination
          url="/admin/company/notification-templates"
          count={count}
          page_size={20}
        />
      </div>

      {isNoteForm && <NotificationForm />}
    </>
  )
}

export default NotificationTemplates
