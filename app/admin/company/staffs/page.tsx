'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '@/components/Admin/LinkedPagination'
import { User, UserStore } from '@/src/zustand/user/User'
import StaffSheet from '@/components/Admin/StaffSheet'

const Users: React.FC = () => {
  const [page_size] = useState(20)
  const [sort] = useState('-office')
  const { setMessage } = MessageStore()
  const {
    staffs,
    isAllChecked,
    loading,
    count,
    selectedUsers,
    showProfileSheet,
    setShowProfileSheet,
    massDeleteUsers,
    makeStaffUser,
    deleteUser,
    toggleAllSelectedStaff,
    toggleCheckedStaff,
    reshuffleResults,
    toggleActiveStaff,
    getStaffs,
  } = UserStore()

  const pathname = usePathname()
  const { page } = useParams()
  const { setAlert } = AlartStore()
  const url = '/users'
  const params = `?page_size=${page_size}&page=${page ? page : 1
    }&ordering=${sort}&status=Staff`

  useEffect(() => {
    reshuffleResults()
  }, [pathname])

  useEffect(() => {
    getStaffs(`${url}${params}`, setMessage)
  }, [page])

  const deleteUserProfile = async (id: string, index: number) => {
    toggleActiveStaff(index)
    const params = `?page_size=${page_size}&page=${page ? page : 1
      }&ordering=${sort}`
    await deleteUser(`${url}/${id}/${params}`, setMessage)
  }

  const startDelete = (id: string, index: number) => {
    setAlert(
      'Warning',
      'Are you sure you want to delete this User?',
      true,
      () => deleteUserProfile(id, index)
    )
  }

  const deleteFaqs = async () => {
    if (selectedUsers.length === 0) {
      setMessage('Please select at least one item to delete', false)
      return
    }
    const ids = selectedUsers.map((item) => item._id)
    await massDeleteUsers(`${url}/mass-delete`, { ids: ids }, setMessage)
  }

  const showStaff = async (user: User) => {
    UserStore.setState({
      userForm: user,
    })
    setShowProfileSheet(true)
  }

  const makeUser = async (id: string) => {
    await makeStaffUser(
      `${url}/make-user/${id}/${params}`,
      {
        status: 'User',
        staffPositions: '',
        roles: '',
        office: '',
      },
      setMessage
    )
  }

  const suspend = async (id: string, suspend: boolean) => {
    await makeStaffUser(
      `${url}/${id}/${params}`,
      { isSuspended: suspend },
      setMessage
    )
  }

  return (
    <>
      <div className="overflow-auto mb-5">
        {staffs.length > 0 ? (
          <table>
            <thead>
              <tr className="bg-[var(--primary)] p-2">
                <th>S/N</th>
                <th>Picture</th>
                <th>Name</th>
                <th>Position</th>
                <th>Roles</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {staffs.map((item, index) => (
                <tr
                  key={index}
                  className={`${item.isSuspended ? 'text-[var(--customRedColor)]' : ''
                    } ${index % 2 === 1 ? 'bg-[var(--primary)]' : ''}`}
                >
                  <td>
                    <div className="flex items-center">
                      <div
                        className={`checkbox ${item.isChecked ? 'active' : ''}`}
                        onClick={() => toggleCheckedStaff(index)}
                      >
                        {item.isChecked && (
                          <i className="bi bi-check text-white text-lg"></i>
                        )}
                      </div>
                      {(page ? Number(page) - 1 : 1 - 1) * page_size +
                        index +
                        1}
                      <i
                        onClick={() => toggleActiveStaff(index)}
                        className="bi bi-three-dots-vertical text-lg cursor-pointer"
                      ></i>
                    </div>
                    {item.isActive && (
                      <div className="card_list">
                        <span
                          onClick={() => toggleActiveStaff(index)}
                          className="more_close "
                        >
                          X
                        </span>
                        <div
                          className="card_list_item"
                          onClick={() => makeUser(item._id)}
                        >
                          Make User
                        </div>
                        <div
                          className="card_list_item"
                          onClick={() => suspend(item._id, !item.isSuspended)}
                        >
                          Suspend
                        </div>
                        <div
                          className="card_list_item"
                          onClick={() => startDelete(item._id, index)}
                        >
                          Delete Staff
                        </div>
                      </div>
                    )}
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
                  <td
                    onClick={() => showStaff(item)}
                    className="cursor-pointer"
                  >
                    {item.fullName}
                  </td>
                  <td>{item.staffPositions}</td>
                  <td>{item.roles}</td>
                  <td>{item.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="relative flex justify-center">
            <div className="not_found_text">No Staff Found</div>
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
            <div onClick={toggleAllSelectedStaff} className="tableActions">
              <i
                className={`bi bi-check2-all ${isAllChecked ? 'text-[var(--custom)]' : ''
                  }`}
              ></i>
            </div>
            <div onClick={deleteFaqs} className="tableActions">
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
        <LinkedPagination url="/admin/pages/faq" count={count} page_size={20} />
      </div>

      {showProfileSheet && <StaffSheet />}
    </>
  )
}

export default Users
