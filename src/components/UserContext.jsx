import { createContext, useState, useEffect, useContext } from "react"
import { fetchCurrentUser } from '../util/apiCalls'
import { AuthContext } from "./AuthContext"
import { useNavigate } from "react-router-dom"


//Use Context to store the username so that it is the same both in Profile and on the NavBar 
// (so the NavBar username initial updates as soon as I change the username)

const UserContext = createContext()

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const { token, logout, refreshAccessToken } = useContext(AuthContext)
    const navigate = useNavigate()

    useEffect(() => {
        if (!token) return

        const fetchUserDetails = async () => {
            try {
                const data = await fetchCurrentUser({ token, refreshAccessToken, logout, navigate})
                setUser(data)
            } catch (err) {
                console.error("Error fetching user details", err)
            }
        }
        fetchUserDetails()

    }, [token, refreshAccessToken, logout, navigate])

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => useContext(UserContext)