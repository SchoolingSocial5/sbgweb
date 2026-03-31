"use client"

import QuillEditor from "@/components/Admin/QuillEditor"
import PositionStore from "@/src/zustand/app/Position"
import ApplicationStore from "@/src/zustand/Application"
import { AlartStore, MessageStore } from "@/src/zustand/notification/Message"
import { AuthStore } from "@/src/zustand/user/AuthStore"
import { useRouter } from "next/navigation"
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react"

interface FormDataType {
    _id?: string
    firstName: string
    middleName: string
    lastName: string
    gender: string
    maritalStatus: string
    dob: string
    nationality: string
    state: string
    lga: string
    homeAddress: string
    residenceCountry: string
    residenceState: string
    residenceLga: string
    residenceAddress: string
    phone: string
    email: string
    refereeName: string
    refereePhone: string
    applicationLetter: string
    refereeRelationship: string
    school: string
    course: string
    degree: string
    position: string
    username: string
    certificate: File | null
    certificateUrl?: string
}

export default function ApplicationForm() {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [photo, setPhoto] = useState<string | null>(null)
    const [existingPhoto, setExistingPhoto] = useState<string | null>(null)
    const { setMessage } = MessageStore()
    const { setAlert } = AlartStore()
    const { createApplication, updateApplication, getApplications } = ApplicationStore()
    const { positionResults, getPositions } = PositionStore()
    const { user } = AuthStore()
    const router = useRouter()

    const [formData, setFormData] = useState<FormDataType>({
        firstName: "",
        middleName: "",
        lastName: "",
        gender: "",
        maritalStatus: "",
        dob: "",
        applicationLetter: "",
        nationality: "",
        state: "",
        lga: "",
        homeAddress: "",
        residenceCountry: "",
        residenceState: "",
        residenceLga: "",
        residenceAddress: "",
        phone: "",
        email: "",
        refereeName: "",
        refereePhone: "",
        refereeRelationship: "",
        school: "",
        course: "",
        degree: "",
        position: "",
        username: "",
        certificate: null
    })

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isUpdating, setIsUpdating] = useState(false)

    useEffect(() => {
        if (!user) {
            setAlert("Authentication Required", "You must have an account to apply. Would you like to create one now?", true, () => router.push("/register"))
            return
        }

        getPositions('/company/positions', setMessage)

        // Fetch existing application for this user
        const fetchExisting = async () => {
            const url = `/applications?username=${user.username}`
            await getApplications(url, setMessage)
            const results = ApplicationStore.getState().applicants
            if (results && results.length > 0) {
                const app = results[0]
                setFormData({
                    ...app,
                    dob: app.dob ? new Date(app.dob).toISOString().split('T')[0] : "",
                    certificate: null,
                    certificateUrl: app.certificateUrl
                })
                setExistingPhoto(app.photoUrl)
                setIsUpdating(true)
            }
        }
        fetchExisting()
    }, [user])

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {

        const { name, value } = e.target
        const files = (e.target as HTMLInputElement).files

        setFormData(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }))
    }

    const startCamera = async () => {

        const stream = await navigator.mediaDevices.getUserMedia({ video: true })

        if (videoRef.current) {
            videoRef.current.srcObject = stream
        }
    }

    const capturePhoto = () => {

        if (!videoRef.current || !canvasRef.current) return

        const canvas = canvasRef.current
        const video = videoRef.current
        const ctx = canvas.getContext("2d")

        if (!ctx) return

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        ctx.drawImage(video, 0, 0)

        const image = canvas.toDataURL("image/png")
        setPhoto(image)
    }

    const validate = () => {

        const newErrors: Record<string, string> = {}

        const requiredFields: (keyof FormDataType)[] = [
            "firstName",
            "middleName",
            "lastName",
            "gender",
            "maritalStatus",
            "dob",
            "nationality",
            "state",
            "lga",
            "homeAddress",
            "residenceCountry",
            "residenceState",
            "residenceLga",
            "residenceAddress",
            "phone",
            "email",
            "refereeName",
            "refereePhone",
            "refereeRelationship",
            "school",
            "course",
            "degree",
            "position"
        ]

        requiredFields.forEach(field => {
            if (!formData[field]) {
                newErrors[field] = "Required"
            }
        })

        if (!isUpdating && !formData.certificate) {
            newErrors.certificate = "Certificate required"
        }

        if (!isUpdating && !photo) {
            newErrors.photo = "Face capture required"
        }

        setErrors(newErrors)

        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!user) return
        if (!validate()) return

        try {
            const payload = new FormData()
            Object.entries(formData).forEach(([key, value]) => {
                if (
                    value &&
                    key !== 'certificate' &&
                    key !== 'certificateUrl' &&
                    key !== 'photoUrl'
                ) {
                    if (value instanceof File || value instanceof Blob) {
                        payload.append(key, value)
                    } else {
                        payload.append(key, String(value))
                    }
                }
            })

            if (formData.certificate) {
                payload.append("certificate", formData.certificate)
            }

            if (photo) {
                payload.append("photo", photo)
            }

            payload.set("username", user.username)

            if (isUpdating && formData._id) {
                setAlert("Update Application", "Save changes to your application?", true, () =>
                    updateApplication(`/applications/${formData._id}`, payload, setMessage)
                )
            } else {
                setAlert("Application Submission", "Submit your application?", true, () =>
                    createApplication("/applications", payload, setMessage)
                )
            }

        } catch (error) {
            console.log(error)
        }
    }

    return (

        <div className="min-h-screen bg-gray-100 py-10 md:px-6 px-2">

            <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl sm:p-10 p-3">

                <h1 className="text-3xl font-bold mb-8 text-center">
                    Application Form
                </h1>

                <form onSubmit={handleSubmit} className="space-y-10">

                    {/* PERSONAL INFORMATION */}

                    <section>

                        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>

                        <div className="grid md:grid-cols-3 gap-4">

                            <input name="firstName" value={formData.firstName} placeholder="First Name" onChange={handleChange} className="input" />
                            <input name="middleName" value={formData.middleName} placeholder="Middle Name" onChange={handleChange} className="input" />
                            <input name="lastName" value={formData.lastName} placeholder="Last Name" onChange={handleChange} className="input" />

                            <select name="gender" value={formData.gender} onChange={handleChange} className="input">
                                <option value="">Gender</option>
                                <option>Male</option>
                                <option>Female</option>
                            </select>

                            <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="input">
                                <option value="">Marital Status</option>
                                <option>Single</option>
                                <option>Married</option>
                            </select>

                            <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="input" />

                            <input name="nationality" value={formData.nationality} placeholder="Nationality" onChange={handleChange} className="input" />
                            <input name="state" value={formData.state} placeholder="State" onChange={handleChange} className="input" />
                            <input name="lga" value={formData.lga} placeholder="LGA" onChange={handleChange} className="input" />

                        </div>

                        <textarea
                            name="homeAddress"
                            value={formData.homeAddress}
                            placeholder="Home Address"
                            onChange={handleChange}
                            className="input mt-4"
                        />

                    </section>

                    {/* RESIDENCE */}

                    <section>

                        <h2 className="text-xl font-semibold mb-4">Residence</h2>

                        <div className="grid md:grid-cols-3 gap-4">

                            <input name="residenceCountry" value={formData.residenceCountry} placeholder="Country" onChange={handleChange} className="input" />
                            <input name="residenceState" value={formData.residenceState} placeholder="State" onChange={handleChange} className="input" />
                            <input name="residenceLga" value={formData.residenceLga} placeholder="LGA" onChange={handleChange} className="input" />

                        </div>

                        <textarea
                            name="residenceAddress"
                            value={formData.residenceAddress}
                            placeholder="House Address"
                            onChange={handleChange}
                            className="input mt-4"
                        />

                    </section>

                    {/* CONTACT */}

                    <section>

                        <h2 className="text-xl font-semibold mb-4">Contact</h2>

                        <div className="grid md:grid-cols-2 gap-4">

                            <input name="phone" value={formData.phone} placeholder="Phone Number" onChange={handleChange} className="input" />
                            <input name="email" value={formData.email} placeholder="Email Address" onChange={handleChange} className="input" />

                        </div>

                    </section>

                    {/* REFEREE */}

                    <section>

                        <h2 className="text-xl font-semibold mb-4">Referee</h2>

                        <div className="grid md:grid-cols-3 gap-4">

                            <input name="refereeName" value={formData.refereeName} placeholder="Referee Name" onChange={handleChange} className="input" />
                            <input name="refereePhone" value={formData.refereePhone} placeholder="Referee Phone" onChange={handleChange} className="input" />
                            <input name="refereeRelationship" value={formData.refereeRelationship} placeholder="Relationship" onChange={handleChange} className="input" />

                        </div>

                    </section>

                    {/* EDUCATION */}

                    <section>

                        <h2 className="text-xl font-semibold mb-4">Education</h2>

                        <div className="grid md:grid-cols-3 gap-4">

                            <input name="school" value={formData.school} placeholder="School Graduated" onChange={handleChange} className="input" />
                            <input name="course" value={formData.course} placeholder="Course" onChange={handleChange} className="input" />
                            <input name="degree" value={formData.degree} placeholder="Degree" onChange={handleChange} className="input" />

                        </div>

                        <div className="mt-4">

                            <label className="block font-medium mb-2">
                                Upload Certificate {formData.certificateUrl && "(Already uploaded: " + formData.certificateUrl.split('/').pop() + ")"}
                            </label>

                            <input
                                type="file"
                                name="certificate"
                                onChange={handleChange}
                            />

                            {errors.certificate && (
                                <p className="text-red-500">{errors.certificate}</p>
                            )}

                        </div>

                    </section>

                    <section>
                        <select name="position" value={formData.position} onChange={handleChange} className="input mb-4">
                            <option value="">Select Position</option>
                            {positionResults.map((pos) => (
                                <option key={pos._id} value={pos.position}>{pos.position}</option>
                            ))}
                        </select>
                        <h2 className="text-xl font-semibold mb-2">Application Letter</h2>
                        <QuillEditor
                            contentValue={formData.applicationLetter}
                            onChange={(content) => setFormData((prev) => ({
                                ...prev,
                                applicationLetter: content,
                            }))}
                        />
                    </section>

                    {/* FACE CAPTURE */}

                    <section className="text-center">

                        <h2 className="text-xl font-semibold mb-4">
                            Face Capture
                        </h2>

                        <div className="flex flex-col items-center gap-4">

                            <video
                                ref={videoRef}
                                autoPlay
                                className="w-72 rounded-lg border"
                            />

                            <canvas ref={canvasRef} className="hidden" />

                            <div className="flex gap-4">

                                <button
                                    type="button"
                                    onClick={startCamera}
                                    className="bg-blue-600 text-white px-4 py-2 rounded"
                                >
                                    Start Camera
                                </button>

                                <button
                                    type="button"
                                    onClick={capturePhoto}
                                    className="bg-green-600 text-white px-4 py-2 rounded"
                                >
                                    Capture
                                </button>

                            </div>

                            {photo ? (
                                <img
                                    src={photo}
                                    className="w-40 rounded-lg border"
                                />
                            ) : existingPhoto && (
                                <div className="text-center">
                                    <p className="text-sm font-medium mb-1">Current Photo:</p>
                                    <img src={existingPhoto} className="w-40 rounded-lg border mx-auto" />
                                </div>
                            )}

                            {errors.photo && (
                                <p className="text-red-500">{errors.photo}</p>
                            )}

                        </div>

                    </section>

                    {/* SUBMIT */}

                    <div className="text-center">

                        <button
                            type="submit"
                            className="bg-black text-white px-10 py-3 rounded-lg hover:bg-gray-800"
                        >
                            {isUpdating ? "Update Application" : "Submit Application"}
                        </button>

                    </div>

                </form>

            </div>

            <style jsx>{`
.input{
width:100%;
border:1px solid #ddd;
padding:10px;
border-radius:8px;
}
`}</style>

        </div>
    )
}