import { useEffect, useState, useContext } from "react"
import { AuthContext } from './AuthContext'
import { fetchCurrentUser, updateUser } from '../util/apiCalls'
import { useUser } from "./UserContext"
import { useNavigate } from "react-router-dom"


export default function Profile() {

    const [form, setForm] = useState({ username: "", email: "", password: ""})
    const [editing, setEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const { token, logout, refreshAccessToken } = useContext(AuthContext)
    const { user, setUser } = useUser() //Comes from UserContext
    const navigate = useNavigate()

    useEffect(() => {
            if (!token) return
    
            const fetchUserDetails = async () => {
                try {
                    const data = await fetchCurrentUser({ token, refreshAccessToken, logout, navigate })
                    setForm({username: data.username, email: data.email, password: data.password})
                } catch (err) {
                    console.error("Error fetching user details", err)
                }
            }
            fetchUserDetails()
        }, [token, refreshAccessToken, logout, navigate])


        const handleChange = (e) => {
            const { name, value } = e.target
            setForm((prev) => ({ ...prev, [name]: value }))
          }

        async function handleSave(e) {
            e.preventDefault()
            setLoading(true)
            try {
              const payload = { username: form.username, email: form.email }
              if (form.password) payload.password = form.password
              await updateUser({ 
                token, 
                form: payload, 
                refreshAccessToken,
                logout, 
                navigate })
              
              console.log("Profile updated successfully.")
              setForm((f) => ({ ...f, password: "" }))
              setEditing(false)
              setUser((prev) => ({ ...prev, username: form.username })) //update global user state so navbar updates
            } catch (err) {
              console.error("Error updating profile", err)
            } finally {
              setLoading(false)
            }
          }


    return (
        <div className="max-w-3xl mx-auto p-6 my-15">
            <div className="bg-white shadow-md rounded-2xl p-6">
                <h1 className="text-2xl font-semibold mb-2">My Profile</h1>
                <p className="text-sm text-slate-500 mb-6">View and update your account details.</p>

                {!editing ? (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-slate-500">Username</p>
                            <p className="text-lg font-medium">{form.username}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Email</p>
                            <p className="text-lg font-medium">{form.email}</p>
                        </div>
                        <div>
                            <button
                                onClick={() => setEditing(true)}
                                className="general-button"
                            >
                                Edit profile
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                                New Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                placeholder="Leave blank to keep current password"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="general-button"
                            >
                                {loading ? "Saving..." : "Save changes"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditing(false)}
                                className="general-button"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}