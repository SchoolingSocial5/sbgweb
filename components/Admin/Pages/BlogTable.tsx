'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { formatDate } from '@/lib/helpers'
import _debounce from 'lodash/debounce'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import { Edit, Trash } from 'lucide-react'
import LinkedPagination from '@/components/Admin/LinkedPagination'
import BlogStore from '@/src/zustand/Blog'

const BlogTable: React.FC = () => {
    const {
        getBlogs,
        massDelete,
        deleteBlog,
        toggleAllSelected,
        toggleChecked,
        setLoading,
        toggleActive,
        reshuffleResults,
        searchBlogs,
        searchedBlogs,
        isAllChecked,
        selectedBlogs,
        loading,
        count,
        blogs,
    } = BlogStore()
    const [page_size] = useState(20)
    const [sort] = useState('-createdAt')
    const { setMessage } = MessageStore()
    const pathname = usePathname()
    const { page } = useParams()
    const { setAlert } = AlartStore()
    const inputRef = useRef<HTMLInputElement>(null)
    const url = '/blogs'
    const params = `?page_size=${page_size}&page=${page ? page : 1
        }&ordering=${sort}`

    useEffect(() => {
        reshuffleResults()
    }, [pathname])

    useEffect(() => {
        getBlogs(`${url}${params}`, setMessage)
    }, [page])

    const deleteProduct = async (id: string, index: number) => {
        toggleActive(index)
        const params = `?page_size=${page_size}&page=${page ? page : 1
            }&ordering=${sort}`
        await deleteBlog(`${url}/${id}/${params}`, setMessage, setLoading)
    }

    const startDelete = (id: string, index: number) => {
        setAlert(
            'Warning',
            'Are you sure you want to delete this news?',
            true,
            () => deleteProduct(id, index)
        )
    }

    const handlesearchBlogs = _debounce(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            if (value.trim().length > 0) {
                searchBlogs(
                    `${url}/search?author=${value}&content=${value}&title=${value}&subtitle=${value}&page_size=${page_size}`
                )
            } else {
                BlogStore.setState({ searchedBlogs: [] })
            }
        },
        1000
    )

    const deleteBlogs = async () => {
        if (selectedBlogs.length === 0) {
            setMessage('Please select at least one email to delete', false)
            return
        }
        const ids = selectedBlogs.map((item) => item._id)
        await massDelete(`${url}/mass-delete${params}`, { ids: ids }, setMessage)
    }

    return (
        <>
            <div className="card_body sharp mb-5">
                <div className="text-lg text-[var(--text-secondary)]">
                    Table of Blog Posts
                </div>
                <div className="relative mb-2">
                    <div className={`input_wrap ml-auto active `}>
                        <input
                            ref={inputRef}
                            type="search"
                            onChange={handlesearchBlogs}
                            className={`transparent-input flex-1 `}
                            placeholder="Search blogs"
                        />
                        {loading ? (
                            <i className="bi bi-opencollective common-icon loading"></i>
                        ) : (
                            <i className="bi bi-search common-icon cursor-pointer"></i>
                        )}
                    </div>

                    {searchedBlogs.length > 0 && (
                        <div
                            className={`dropdownList ${searchedBlogs.length > 0
                                ? 'overflow-auto'
                                : 'overflow-hidden h-0'
                                }`}
                        >
                            {searchedBlogs.map((item, index) => (
                                <div key={index} className="input_drop_list">
                                    <Link
                                        href={`/school/students/student/${item._id}`}
                                        className="flex-1"
                                    >
                                        {item.title}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {blogs.map((item, index) => (
                <div key={index} className="card_body sharp mb-1">
                    <div className="">
                        <div className="flex flex-wrap sm:flex-nowrap relative items-start mb-3 sm:mb-1">
                            <div className="flex items-center mr-3">
                                <div
                                    className={`checkbox ${item.isChecked ? 'active' : ''}`}
                                    onClick={() => toggleChecked(index)}
                                >
                                    {item.isChecked && (
                                        <i className="bi bi-check text-white text-lg"></i>
                                    )}
                                </div>
                                {(page ? Number(page) - 1 : 1 - 1) * page_size + index + 1}
                            </div>
                            <div className="relative w-[150px] h-[100px] sm:h-[50] sm:w-[100] mb-3 sm:mb-0 overflow-hidden rounded-[5px] sm:mr-3">
                                {item.picture ? (
                                    <Image
                                        alt={`email of ${item.picture}`}
                                        src={String(item.picture)}
                                        width={0}
                                        sizes="100vw"
                                        height={0}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                        }}
                                    />
                                ) : (
                                    <span>N/A</span>
                                )}
                            </div>
                            <div className="t w-full sm:w-auto">
                                <div className="text-lg mb-2 sm:mb-3">
                                    <div className="flex items-center">
                                        <div className="text-[var(--text-secondary)]">
                                            {item.title}
                                        </div>
                                        <span className="mx-2">|</span>
                                        <span className="text-[var(--customRedColor)] text-sm">
                                            {item.category}
                                        </span>
                                    </div>
                                    <div className="line-clamp-2 overflow-ellipsis">
                                        {item.subtitle}
                                    </div>
                                </div>
                                <div className="flex text-[var(--text-secondary)] ml-1">
                                    {formatDate(String(item.createdAt))}
                                </div>
                            </div>
                            <div className="absolute top-[-10px] right-0 flex items-center">
                                <Link href={`/admin/pages/blog/edit-blog/${item._id}`}>
                                    <Edit className="cursor-pointer" size={18} />
                                </Link>

                                <Trash
                                    className="ml-2 cursor-pointer"
                                    onClick={() => startDelete(item._id, index)}
                                    size={18}
                                />
                            </div>
                        </div>
                        <div
                            className="line-clamp-1 overflow-ellipsis leading-[25px]"
                            dangerouslySetInnerHTML={{
                                __html: item.content,
                            }}
                        />
                    </div>
                </div>
            ))}
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
                        <div onClick={deleteBlogs} className="tableActions">
                            <i className="bi bi-trash"></i>
                        </div>
                        <Link
                            href={`/admin/pages/blog/create-blog`}
                            className="tableActions"
                        >
                            <i className="bi bi-plus-circle"></i>
                        </Link>
                        {/* <div onClick={updateExam} className="tableActions">
              <i className="bi bi-table"></i>
            </div> */}
                    </div>
                </div>
            </div>

            <div className="card_body sharp">
                <LinkedPagination url="/admin/blogs" count={count} page_size={20} />
            </div>
        </>
    )
}

export default BlogTable
