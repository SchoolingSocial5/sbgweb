'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { formatDateToDDMMYY, formatTimeTo12Hour } from '@/lib/helpers'
import NotificationStore from '@/src/zustand/notification/Notification'
import { useParams } from 'next/navigation'
import { MessageStore } from '@/src/zustand/notification/Message'

const Notifications: React.FC = () => {
  const { notifications, page_size, getNotifications, updateNotification } = NotificationStore()
  const { page } = useParams()
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()

  useEffect(() => {
    if (notifications.length > 0) {
      const ids = notifications
        .filter((item) => item.unread === true)
        .map((item) => item._id)

      if (ids) {
        updateNotification('/notifications', { ids })
      }

      NotificationStore.setState((prev) => {
        return {
          notifications: prev.notifications.map((item) =>
            ids.includes(item._id) ? { ...item, unread: false } : item
          ),
        }
      })
    }
  }, [page])

  useEffect(() => {
    const params = `?page_size=${page_size}&page=${page ? page : 1
      }&ordering=${sort}`
    getNotifications(`/notifications/${params}`, setMessage)
  }, [page])

  return (
    <>
      <div className=" flex-1 sharp">
        {notifications.map((item, index) => (
          <div className="flex items-start mb-2" key={index}>
            <div className="w-[40px] rounded-full overflow-hidden min-w-[40px] mr-2 h-[40px]">
              <Image
                src={`/Icon.png`}
                loading="lazy"
                alt="username"
                sizes="100vw"
                height={0}
                width={0}
                style={{ height: 'auto', width: '100%' }}
              />
            </div>
            <div className="flex flex-col flex-1 py-2 px-[10px] bg-[var(--white)]">
              <div className="flex mb-2 flex-wrap items-end justify-between">
                <div
                  className={` uppercase overflow-ellipsis line-clamp-1 text-[var(--text-secondary)] mr-2`}
                >
                  {item.title}
                </div>
                <div className="text-[12px]">
                  {formatTimeTo12Hour(String(item.createdAt))} |{' '}
                  {formatDateToDDMMYY(item.createdAt)}
                </div>
              </div>
              <div className="flex">
                <div className="mr-2">
                  {item.greetings} {item.fullName}
                </div>
              </div>
              <div className="flex items-center">
                <div
                  className="text-sm sm:text-base"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                ></div>{' '}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default Notifications
