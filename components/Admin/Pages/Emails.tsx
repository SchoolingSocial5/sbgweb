'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { MessageStore } from '@/src/zustand/notification/Message'
import EmailStore, { Email } from '@/src/zustand/notification/Email'
import EmailForm from '../PopUps/EmailForm'

const Emails: React.FC = () => {
  const url = '/emails/'
  const { page } = useParams()
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()
  const pathname = usePathname()

  const {
    results, isEmailForm,
    isAllChecked,
    selectedItems,
    loading,
    getItems,
    massDelete,
    toggleAllSelected,
    toggleChecked,
    reshuffleResults,
  } = EmailStore()
  const params = `?page_size=${page_size}&page=${page ? page : 1
    }&ordering=${sort}`

  useEffect(() => {
    reshuffleResults()
  }, [pathname])

  useEffect(() => {
    reshuffleResults()
    getItems(`${url}${params}`, setMessage)
  }, [results.length, page])

  const DeleteItems = async () => {
    if (selectedItems.length === 0) {
      setMessage('Please select at least one email to delete', false)
      return
    }
    const ids = selectedItems.map((item) => item._id)
    await massDelete(`${url}mass-delete/${params}`, { ids }, setMessage)
  }

  const selectEmail = async (e: Email) => {
    EmailStore.setState({ emailForm: e, isEmailForm: true })

  }
  return (
    <>
      <div className="overflow-auto mb-5">
        {results.length > 0 ? (
          <table>
            <thead>
              <tr className="bg-[var(--primary)] p-2">
                <th>S/N</th>
                <th>Picture</th>
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

                    </div>                  </td>
                  <td>
                    {item.picture ? (
                      <Image
                        alt={`email of ${item.picture}`}
                        src={String(item.picture)}
                        width={0}
                        sizes="100vw"
                        height={0}
                        style={{ width: '50px', height: 'auto' }}
                      />
                    ) : (
                      <span>No picture available</span>
                    )}
                  </td>
                  <td>
                    <span onClick={() => selectEmail(item)} className="cursor-pointer">{item.name}</span>
                  </td>
                  <td>{item.title}</td>
                  <td>{item.greetings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="relative flex justify-center">
            <div className="not_found_text">No Email Found</div>
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
              onClick={() => {
                EmailStore.setState({ isEmailForm: true })
              }}
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

      {isEmailForm && <EmailForm />}
    </>
  )
}

export default Emails
