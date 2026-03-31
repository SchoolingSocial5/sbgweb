'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '@/components/Admin/LinkedPagination'
import { formatDateToDDMMYY, formatTimeTo12Hour } from '@/lib/helpers'
import RatingStore, { Rating } from '@/src/zustand/Rating'
import { Star } from 'lucide-react'

const Ratings: React.FC = () => {
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()
  const {
    ratings,
    isAllChecked,
    loading,
    count,
    selectedRatings,
    massDelete, updateRating,
    toggleAllSelected,
    toggleChecked,
    reshuffleResults,
    getRatings,
  } = RatingStore()
  const pathname = usePathname()
  const { page } = useParams()
  const url = '/reviews/'
  const params = `?page_size=${page_size}&page=${page ? page : 1
    }&ordering=${sort}`

  useEffect(() => {
    reshuffleResults()
  }, [pathname])

  useEffect(() => {
    getRatings(`${url}${params}`, setMessage)
  }, [page])


  const deleteReviews = async () => {
    if (selectedRatings.length === 0) {
      setMessage('Please select at least one item to delete', false)
      return
    }
    const ids = selectedRatings.map((item) => item._id)
    await massDelete(`${url}/mass-delete/${params}`, { ids: ids }, setMessage)
  }

  const toggleReview = async (el: Rating) => {
    await updateRating(`${url}${el.username}`, { status: !el.status }, setMessage)
  }

  return (
    <>
      <div className="text-lg text-[var(--text-secondary)]">
        Table of Reviews
      </div>
      <div className="overflow-auto mb-5">
        {ratings.length > 0 ? (
          <table>
            <thead>
              <tr className="bg-[var(--primary)] p-2">
                <th>S/N</th>
                <th>Picture</th>
                <th>Name</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ratings.map((item, index) => (
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

                    </div>
                  </td>
                  <td>
                    <div className="relative w-[50px] h-[50px] overflow-hidden rounded-full">
                      <Image
                        alt={`email of ${item.picture}`}
                        src={
                          item.picture
                            ? String(item.picture)
                            : '/images/avatar.jpg'
                        }
                        width={0}
                        sizes="100vw"
                        height={0}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                  </td>
                  <td>{item.fullName}</td>
                  <td>
                    <div className="flex items-center">
                      {item.rating}{' '}
                      <Star
                        size={16}
                        className="text-[var(--customColor)] ml-1"
                      />{' '}
                    </div>
                  </td>
                  <td>
                    <div
                      className="line-clamp-5 overflow-ellipsis leading-[25px]"
                      dangerouslySetInnerHTML={{
                        __html: item.review,
                      }}
                    />
                  </td>
                  <td>
                    {formatTimeTo12Hour(item.createdAt)} <br />
                    {formatDateToDDMMYY(item.createdAt)}
                  </td>
                  <td>
                    <div className="flex">
                      {item.status ? (
                        <div onClick={() => toggleReview(item)} className="px-3 py-1 cursor-pointer bg-[var(--success)] text-white">
                          Approved
                        </div>
                      ) : (
                        <div onClick={() => toggleReview(item)} className="px-3 py-1 cursor-pointer bg-[var(--secondary)] text-[var(--customRedColor)]">
                          Pending
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="relative flex justify-center">
            <div className="not_found_text">No Reviews Found</div>
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
            <div onClick={deleteReviews} className="tableActions">
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
        <LinkedPagination url="/admin/customers/reviews" count={count} page_size={20} />
      </div>
    </>
  )
}

export default Ratings
