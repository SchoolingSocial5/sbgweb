'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
// import _debounce from 'lodash/debounce'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '@/components/Admin/LinkedPagination'
import FaqStore from '@/src/zustand/faq'
import CreateFaq from '@/components/Admin/CreateFaq'

const Faqs: React.FC = () => {
  const {
    getFaqs,
    massDelete,
    deleteFaq,
    toggleAllSelected,
    toggleChecked,
    setLoading,
    toggleActive,
    reshuffleResults,
    getFaq,
    showForm,
    // searchFaq,
    // searchedFaqs,
    isAllChecked,
    isForm,
    selectedFaqs,
    loading,
    count,
    faqs,
  } = FaqStore()
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()
  const pathname = usePathname()
  const { page } = useParams()
  const { setAlert } = AlartStore()
  // const inputRef = useRef<HTMLInputElement>(null)
  const url = '/faqs'

  useEffect(() => {
    reshuffleResults()
  }, [pathname])

  useEffect(() => {
    const params = `?page_size=${page_size}&page=${
      page ? page : 1
    }&ordering=${sort}`
    getFaqs(`${url}${params}`, setMessage)
  }, [page])

  const deleteItem = async (id: string, index: number) => {
    toggleActive(index)
    const params = `?page_size=${page_size}&page=${
      page ? page : 1
    }&ordering=${sort}`
    await deleteFaq(`${url}/${id}/${params}`, setMessage, setLoading)
  }

  const startDelete = (id: string, index: number) => {
    setAlert(
      'Warning',
      'Are you sure you want to delete this news?',
      true,
      () => deleteItem(id, index)
    )
  }

  // const handlesearchFaq = _debounce(
  //   async (e: React.ChangeEvent<HTMLInputElement>) => {
  //     const value = e.target.value
  //     if (value.trim().length > 0) {
  //       searchFaq(
  //         `${url}/search?author=${value}&content=${value}&title=${value}&subtitle=${value}&page_size=${page_size}`
  //       )
  //     } else {
  //       FaqStore.setState({ searchedFaqs: [] })
  //     }
  //   },
  //   1000
  // )

  const editQuestion = (id: string, index: number) => {
    getFaq(`/faqs/${id}`, setMessage)
    toggleActive(index)
    showForm(true)
  }

  const deleteFaqs = async () => {
    if (selectedFaqs.length === 0) {
      setMessage('Please select at least one email to delete', false)
      return
    }
    const ids = selectedFaqs.map((item) => item._id)
    await massDelete(`${url}/mass-delete`, { ids: ids }, setMessage)
  }

  return (
    <>
      {/* <div className="card_body sharp mb-5">
        <div className="text-lg text-[var(--text-secondary)]">
          Table of Frequently Asked Questions
        </div>
        <div className="relative mb-2">
          <div className={`input_wrap ml-auto active `}>
            <input
              ref={inputRef}
              type="search"
              onChange={handlesearchFaq}
              className={`transparent-input flex-1 `}
              placeholder="Search Faqs"
            />
            {loading ? (
              <i className="bi bi-opencollective common-icon loading"></i>
            ) : (
              <i className="bi bi-search common-icon cursor-pointer"></i>
            )}
          </div>

          {searchedFaqs.length > 0 && (
            <div
              className={`dropdownList ${
                searchedFaqs.length > 0
                  ? 'overflow-auto'
                  : 'overflow-hidden h-0'
              }`}
            >
              {searchedFaqs.map((item, index) => (
                <div key={index} className="input_drop_list">
                  <Link
                    href={`/school/students/student/${item._id}`}
                    className="flex-1"
                  >
                    {item.question}, {item.category}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div> */}

      <div className="overflow-auto mb-5">
        {faqs.length > 0 ? (
          <table>
            <thead>
              <tr className="bg-[var(--primary)] p-2">
                <th>S/N</th>
                <th>Category</th>
                <th>Question</th>
                <th>Answer</th>
              </tr>
            </thead>
            <tbody>
              {faqs.map((item, index) => (
                <tr
                  key={index}
                  className={`${index % 2 === 1 ? 'bg-[var(--primary)]' : ''}`}
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
                        <div
                          onClick={() => editQuestion(item._id, index)}
                          className="card_list_item"
                        >
                          Edit Faq
                        </div>
                        <div
                          className="card_list_item"
                          onClick={() => startDelete(item._id, index)}
                        >
                          Delete Faq
                        </div>
                      </div>
                    )}
                  </td>

                  <td>{item.category}</td>
                  <td>{item.question}</td>
                  <td>
                    <div
                      className="line-clamp-1 overflow-ellipsis leading-[25px]"
                      dangerouslySetInnerHTML={{
                        __html: item.answer,
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="relative flex justify-center">
            <div className="not_found_text">No Questions Found</div>
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
                className={`bi bi-check2-all ${
                  isAllChecked ? 'text-[var(--custom)]' : ''
                }`}
              ></i>
            </div>
            <div onClick={deleteFaqs} className="tableActions">
              <i className="bi bi-trash"></i>
            </div>
            <div onClick={() => showForm(true)} className="tableActions">
              <i className="bi bi-plus-circle"></i>
            </div>
            {/* <div onClick={updateExam} className="tableActions">
              <i className="bi bi-table"></i>
            </div> */}
          </div>
        </div>
      </div>

      <div className="card_body sharp">
        <LinkedPagination url="/admin/pages/faq" count={count} page_size={20} />
      </div>
      {isForm && <CreateFaq />}
    </>
  )
}

export default Faqs
