'use client'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '@/components/Admin/LinkedPagination'
import { UserStore } from '@/src/zustand/user/User'
import StaffSheet from '@/components/Admin/StaffSheet'
import { formatMoney } from '@/lib/helpers'
import Link from 'next/link'
import _debounce from 'lodash/debounce'
import EmailStore, { Email } from '@/src/zustand/notification/Email'

const CustomersPage: React.FC = () => {
    const [page_size] = useState(20)
    const [showEmail, setShowEmail] = useState(false)
    const [sort] = useState('-totalPurchase')
    const { setMessage } = MessageStore()
    const {
        users,
        isAllChecked,
        loading,
        count,
        selectedUsers,
        showProfileSheet,
        searchedUsers,
        searchUser,
        massDeleteUsers,
        makeUserStaff,
        deleteUser,
        toggleAllSelected,
        toggleChecked,
        reshuffleResults,
        toggleActive,
        getUsers,
    } = UserStore()
    const pathname = usePathname()
    const { page } = useParams()
    const { setAlert } = AlartStore()
    const inputRef = useRef<HTMLInputElement>(null)
    const url = '/users'
    const params = `?page_size=${page_size}&page=${page ? page : 1
        }&ordering=${sort}&status=User`
    const { getSocialEmails, sendUsersEmail, emailForm, socialEmails } =
        EmailStore()

    useEffect(() => {
        reshuffleResults()
    }, [pathname])

    useEffect(() => {
        getUsers(`${url}${params}`, setMessage)
    }, [page])


    useEffect(() => {
        if (socialEmails.length === 0) {
            getSocialEmails(
                `/emails/?page_size=5&page=1&ordering=name&sendable=true`,
                setMessage
            )
        }
    }, [socialEmails.length, page])

    const handleSearch = _debounce(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            if (value.trim().length > 0) {
                searchUser(
                    `${url}/search?fullName=${value}&status=User&username=${value}&page_size=${page_size}`
                )
            } else {
                UserStore.setState({ searchedUsers: [] })
            }
        },
        1000
    )

    const selectEmail = (email: Email) => {
        EmailStore.setState({ emailForm: email })
        setShowEmail(false)
    }

    const deleteUserProfile = async (username: string, index: number) => {
        toggleActive(index)
        const params = `?page_size=${page_size}&page=${page ? page : 1
            }&ordering=${sort}&status=User`
        await deleteUser(`${url}/${username}/${params}`, setMessage)
    }

    const startDelete = (username: string, index: number) => {
        setAlert(
            'Warning',
            'Are you sure you want to delete this User?',
            true,
            () => deleteUserProfile(username, index)
        )
    }

    const startSendingUsersEmail = async () => {
        if (selectedUsers.length === 0) {
            setMessage('Please select at least one user to send email', false)
            return
        }

        setAlert(
            'Warning',
            'Are you sure you want to send the selected users this email?',
            true,
            () =>
                sendUsersEmail(
                    `/emails/send/${emailForm._id}`,
                    { selectedUsers },
                    setMessage, () => reshuffleResults()
                )
        )
    }

    const startSuspendUsers = async () => {
        if (selectedUsers.length === 0) {
            setMessage('Please select at least one user to suspend', false)
            return
        }

        setAlert(
            'Warning',
            'Are you sure you want to suspend the selected Users?',
            true,
            () => {
                makeUserStaff(`/users/suspend/${params}`, { selectedUsers }, setMessage)
            }
        )
    }

    const startDeleteUsers = async () => {
        if (selectedUsers.length === 0) {
            setMessage('Please select at least one item to delete', false)
            return
        }

        setAlert(
            'Warning',
            'Are you sure you want to delete the selected Users?',
            true,
            () => deleteManyUsers()
        )
    }

    const deleteManyUsers = async () => {
        const ids = selectedUsers.map((item) => item._id)
        await massDeleteUsers(`${url}/mass-delete/${params}`, { ids: ids }, setMessage)
    }

    const makeUser = async (id: string) => {
        await makeUserStaff(
            `${url}/make-staff/${params}`,
            {
                status: 'Staff',
                office: '',
                id
            },
            setMessage
        )
    }

    const suspend = async (id: string, suspend: boolean) => {
        await makeUserStaff(
            `${url}/${id}/${params}`,
            { isSuspended: suspend },
            setMessage
        )
    }

    return (
        <>
            <div className="card_body sharp mb-5">
                <div className="text-lg text-[var(--text-secondary)]">
                    Table of Users
                </div>
                <div className="relative mb-2">
                    <div className={`input_wrap ml-auto active `}>
                        <input
                            ref={inputRef}
                            type="search"
                            onChange={handleSearch}
                            className={`transparent-input flex-1 `}
                            placeholder="Search users"
                        />
                        {loading ? (
                            <i className="bi bi-opencollective common-icon loading"></i>
                        ) : (
                            <i className="bi bi-search common-icon cursor-pointer"></i>
                        )}
                    </div>

                    {searchedUsers.length > 0 && (
                        <div
                            className={`dropdownList ${searchedUsers.length > 0
                                ? 'overflow-auto'
                                : 'overflow-hidden h-0'
                                }`}
                        >
                            {searchedUsers.map((item, index) => (
                                <div key={index} className="input_drop_list">
                                    <Link
                                        href={`/admin/users/${item.username}`}
                                        className="flex-1"
                                    >
                                        {item.fullName}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="overflow-auto mb-5">
                {users.length > 0 ? (
                    <table>
                        <thead>
                            <tr className="bg-[var(--primary)] p-2">
                                <th>S/N</th>
                                <th>Picture</th>
                                <th>Username</th>
                                <th>Name</th>
                                <th>Purchase</th>
                                <th>Email</th>
                                <th>Phone</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((item, index) => (
                                <tr
                                    key={index}
                                    className={`${item.isSuspended ? 'text-[var(--customRedColor)]' : ''
                                        } ${index % 2 === 1 ? 'bg-[var(--primary)]' : ''}`}
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
                                                    className="card_list_item"
                                                    onClick={() => makeUser(item._id)}
                                                >
                                                    Make Staff
                                                </div>
                                                <div
                                                    className="card_list_item"
                                                    onClick={() => suspend(item._id, !item.isSuspended)}
                                                >
                                                    Suspend
                                                </div>
                                                <div
                                                    className="card_list_item"
                                                    onClick={() => startDelete(item.username, index)}
                                                >
                                                    Delete User
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
                                    <td className="cursor-pointer">
                                        <Link href={`/admin/customers/profile/${item.username}`} className="">
                                            {item.username}
                                        </Link>
                                    </td>
                                    <td className="cursor-pointer">
                                        <Link href={`/admin/customers/profile/${item.username}`} className="">
                                            {item.fullName}
                                        </Link>
                                    </td>
                                    <td>₦{formatMoney(item.totalPurchase)}</td>
                                    <td>{item.email}</td>
                                    <td>{item.phone}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="relative flex justify-center">
                        <div className="not_found_text">No Users Found</div>
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
                    <div className="mr-auto flex items-center gap-3 flex-wrap">
                        <div onClick={toggleAllSelected} className="tableActions">
                            <i
                                className={`bi bi-check2-all ${isAllChecked ? 'text-[var(--customRedColor)]' : ''
                                    }`}
                            ></i>
                        </div>
                        <div onClick={startDeleteUsers} className="tableActions">
                            <i className="bi bi-trash"></i>
                        </div>
                        <div onClick={startSuspendUsers} className="tableActions">
                            <i className="bi bi-person-slash"></i>
                        </div>
                        <div onClick={startSendingUsersEmail} className="tableActions">
                            <i className="bi bi-envelope"></i>
                        </div>
                    </div>
                    <div className="ml-auto relative">
                        <div
                            onClick={() => setShowEmail(!showEmail)}
                            className="bg-[var(--secondary)] flex justify-between items-center px-3 py-2 cursor-pointer"
                        >
                            {emailForm.name ? emailForm.title : 'Select Email'}
                            <i className="bi bi-caret-down-fill ml-2"></i>
                        </div>
                        {showEmail && (
                            <div className="bg-[var(--secondary)] max-h-[250px] min-w-[250px] overflow-auto absolute top-[45px] right-0">
                                {socialEmails.map((item, index) => (
                                    <div
                                        key={index}
                                        onClick={() => selectEmail(item)}
                                        className="cursor-pointer px-3 py-2 border-b border-b-[var(--border)] w-full"
                                    >
                                        {item.title}
                                    </div>
                                ))}
                            </div>
                        )}
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

export default CustomersPage
