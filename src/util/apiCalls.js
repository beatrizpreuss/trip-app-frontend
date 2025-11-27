import { BASE_URL } from './config'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../components/AuthContext'
import { useContext } from 'react'
import { useUser } from '../components/UserContext'
import { apiFetch } from './apiFetch'

// Login and Register Functions (together because they use the same hooks, and the hooks can't be inside non-component functions like async functions)
export function useAuthActions() {
    const { login } = useContext(AuthContext)
    const navigate = useNavigate()
    const { user, setUser } = useUser() //comes com UserContext

    const loginFunction = async (email, password) => {
        try {
            const response = await fetch(`${BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })

            const data = await response.json()

            if (response.ok) {
                login({ accessToken: data.access_token, refreshToken: data.refresh_token })
                const userData = await fetchCurrentUser({
                    token: data.access_token,
                    refreshAccessToken: null,
                    logout: null,
                    navigate: null
                }) // fetch user details
                setUser(userData)
                navigate('/trips')
            } else {
                alert(data.msg)
            }
        } catch (error) {
            console.error('Error logging in:', error)
        }
    }

    const registerFunction = async (username, email, password) => {
        try {
            const registerResponse = await fetch(`${BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password })
            })

            const registerData = await registerResponse.json()
            console.log(registerData)

            if (!registerResponse.ok) {
                alert(registerData.msg || "Registration failed")
                return
            }
            await loginFunction(email, password) // Login after registration

        } catch (error) {
            console.error('Error during registration/login:', error)
            alert("Something went wrong. Please try again. ")
        }
    }
    return { loginFunction, registerFunction }
}

// Get username
export async function fetchCurrentUser({ token, refreshAccessToken, logout, navigate }) {
    return apiFetch(
        `${BASE_URL}/me`, { token }, { refreshAccessToken, logout, navigate })
}


// Update user details  
export async function updateUser({ token, form, refreshAccessToken, logout, navigate }) {
    return apiFetch(`${BASE_URL}/me`,
        {
            token,
            method: "PUT",
            body: form
        }, { refreshAccessToken, logout, navigate })
}


// Get all trips
export async function getAllTrips({ token, refreshAccessToken, logout, navigate }) {
    return apiFetch(`${BASE_URL}/trips`, { token }, { refreshAccessToken, logout, navigate })
}


// Get a trip by its ID (in the backend: open_trip function)
export async function getTripById({ tripId, token, refreshAccessToken, logout, navigate }) {
    return apiFetch(`${BASE_URL}/trips/${tripId}`, { token }, { refreshAccessToken, logout, navigate })
}


// Update a trip by its ID
export async function updateTripById({
    token,
    tripId, tripName, tripDate,
    mappedEatDrink, mappedExplore, mappedStays, mappedEssentials, mappedGettingAround,
    refreshAccessToken, logout, navigate
}) {
    return apiFetch(`${BASE_URL}/trips/${tripId}`,
        {
            token,
            method: "PUT",
            body: ({
                name: tripName,
                date: tripDate,
                eat_drink: mappedEatDrink,
                explore: mappedExplore,
                stays: mappedStays,
                essentials: mappedEssentials,
                getting_around: mappedGettingAround
            })
        }, { refreshAccessToken, logout, navigate })
}


// Delete a trip by its ID
export async function deleteTripById({ token, tripId, refreshAccessToken, logout, navigate }) {
    return apiFetch(`${BASE_URL}/trips/${tripId}`,
        {
            token,
            method: "DELETE",
        }, { refreshAccessToken, logout, navigate })
}


// Create new trip
export async function createNewTrip({ token, refreshAccessToken, logout, navigate }) {
    return apiFetch(`${BASE_URL}/trips`,
        {
            token,
            method: "POST",
            body: ({ name: "Untitled Trip", image: null })
        }, { refreshAccessToken, logout, navigate })
}


// Send pop-up questionnaire answers to the backend
export async function popupToBackend({
    token, tripId, finalAnswers,
    suggestionsParams, signal,
    refreshAccessToken, logout, navigate }) {
    const payload = { ...finalAnswers }

    if (suggestionsParams) {
        payload.lat = suggestionsParams.lat
        payload.lon = suggestionsParams.lon
        if (suggestionsParams.radius > 50000) { // maximum radius is always 50km
            payload.radius = 50000
        } else if (suggestionsParams.radius >= 2000) { // minimum radius is always 2km
            payload.radius = suggestionsParams.radius
        } else {
            payload.radius = 2000
        }
    } else {
        console.warn("No suggestionsParams provided, suggestions may be incorect")
    }
    console.log("Payload sent to backend:", payload)

    try {
        const data = await apiFetch(`${BASE_URL}/trips/${tripId}/suggestions`, {
            token,
            method: "POST",
            body: payload,
            signal // to allow for cancellation of request
        }, { refreshAccessToken, logout, navigate })

        // Normal success case
        if (Array.isArray(data) && data.length > 0) {
            return data
        } else if (data?.error === "openai_unreachable") {
            return ["api_unreachable"]
        } else {
            return ["No results found"]
        }

    } catch (err) {
        if (err.name === "AbortError") {
            console.log("popuptoBackend aborted")
            return null
        } else {
            console.error("Network or unexpected error in popupToBackend:", err)
            return ["api_unreachable"]
        }
    }
}


// Get tips by the ID of the trip (in the backend: get_travel_tips function)
export async function getTipsByTripId({ token, tripId, signal, refreshAccessToken, logout, navigate }) {
    return apiFetch(`${BASE_URL}/trips/${tripId}/tips`,
        { token, signal },
        { refreshAccessToken, logout, navigate })
}


// This does not requre authentication
// Send form questions to backend to get destination suggestions
export async function formToBackend(formAnswers) {
    try {
        const res = await fetch(`${BASE_URL}/find-destination`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formAnswers)
        })
        return await res.json()
    } catch (err) {
        console.error('Error in formToBackend')
    }
}