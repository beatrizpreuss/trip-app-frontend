import React, { createContext, useState } from 'react'
import { BASE_URL } from '../util/config'

// Create context
export const AuthContext = createContext()

// AuthProvider component to wrap around the app
export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('access_token') || null)
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refresh_token') || null)

  const login = ({ accessToken, refreshToken }) => {
    setAccessToken(accessToken)
    setRefreshToken(refreshToken)
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
  }

  const logout = () => {
    setAccessToken(null)
    setRefreshToken(null)
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }


  async function refreshAccessToken() {
        const res = await fetch (`${BASE_URL}/refresh`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${refreshToken}`,
            "Content-Type": "application/json"
            }
        })
        if (!res.ok) {
          console.error("Refresh token invalid or expired")
          throw new Error("Refresh failed")
        }

        const data = await res.json()
        if (!data.access_token) throw new Error("No access token returned")
        setAccessToken(data.access_token)
        localStorage.setItem('access_token', data.access_token)
        console.log("New token fetched")
        return data.access_token
  }


  return (
    <AuthContext.Provider value={{ token: accessToken, refreshToken, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  )
}