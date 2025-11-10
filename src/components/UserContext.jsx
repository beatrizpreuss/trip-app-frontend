import { createContext, useState, useEffect, useContext } from "react"
import { fetchCurrentUser } from '../util/apiCalls'


//Use Context to store the username so that it is the same both in Profile and on the NavBar 
// (so the NavBar username initial updates as soon as I change the username)

const UserContext = createContext()

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const token = localStorage.getItem("token")

    useEffect(() => {
        if (!token) return

        const fetchUserDetails = async () => {
            try {
                const data = await fetchCurrentUser(token)
                setUser(data)
            } catch (err) {
                console.error("Error fetching user details", err)

                if (err.message === "Unauthorized") { // handle expired token
                    logout() // clear token + user state
                }
            }
        }
        fetchUserDetails()

    }, [token])

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => useContext(UserContext)