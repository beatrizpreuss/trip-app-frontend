import { BASE_URL } from './config'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../components/AuthContext'
import { useContext } from 'react'

// Login and Register Functions (together because they use the same hooks, and the hooks can't be inside non-component functions like async functions)
export function useAuthActions() {
    const { login } = useContext(AuthContext)
    const navigate = useNavigate()

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
                login(data.access_token)
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
export async function fetchCurrentUser(token) {
    const res = await fetch(`${BASE_URL}/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
    if (res.status === 401) {
        throw new Error("Unauthorized")
    }
    if (!res.ok) {
        throw new Error(`Failed to fetch current user: ${res.statusText}`);
    }
    return await res.json()
}


// Get all trips
export async function getAllTrips(token) {
    try {
        if (!token) throw new Error("No token provided")

        const res = await fetch(`${BASE_URL}/trips`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
        if (!res.ok) {
            if (res.status === 401) {
                throw new Error("Unauthorized") // token expired or invalid
            }
            const text = await res.text()
            throw new Error(`Error fetching trips: ${res.status} ${text}`)  // other errors
        }
        // parse JSON only if request succeeded
        const data = await res.json()
        return data
    } catch (err) {
        console.error("Error in getAllTrips:", err)
        throw err  // rethrow so caller can handle it
    }
}


// Get a trip by its ID (in the backend: open_trip function)
export async function getTripById(tripId, token) {
    const res = await fetch(`${BASE_URL}/trips/${tripId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
    if (res.status === 401) {
        throw new Error("Unauthorized")
    }
    if (!res.ok) {
        throw new Error(`Failed to fetch trip ${tripId}: ${res.statusText}`);
    }
    return await res.json()
}

// Update a trip by its ID
export async function updateTripById(token, tripId, tripName, mappedEatDrink, mappedExplore, mappedStays, mappedEssentials, mappedGettingAround) {
    try {
        const res = await fetch(`${BASE_URL}/trips/${tripId}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: tripName,
                eat_drink: mappedEatDrink,
                explore: mappedExplore,
                stays: mappedStays,
                essentials: mappedEssentials,
                getting_around: mappedGettingAround
            })
        })
        return await res.json()
    } catch (err) {
        console.error('Error in updateTripById')
    }
}

// Delete a trip by its ID
export async function deleteTripById(token, tripId) {
    try {
        const res = await fetch(`${BASE_URL}/trips/${tripId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        return await res.json()
    } catch (err) {
        console.error('Error in deleteTripById')
    }
}

// Create new trip
export async function createNewTrip(token) {
    try {
        const res = await fetch(`${BASE_URL}/trips`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: "Untitled Trip", image: null })
        })
        return await res.json()
    } catch (err) {
        console.error('Error in createNewTrip')
    }
}


// Send pop-up questionnaire answers to the backend
export async function popupToBackend(token, tripId, finalAnswers, suggestionsParams, signal) {
    try {
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

        const res = await fetch(`${BASE_URL}/trips/${tripId}/suggestions`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
            signal // to allow for cancellation of request
        })

        let data
        try {
            data = await res.json()
        } catch {
            console.error("Failed to parse backend response")
            return ["backend_unreachable"]
        }

        console.log("Backend response in apiCalls:", data)

        // Handle backend error signals
        if (!res.ok) {
            if (data?.error === "openai_unreachable") {
                return ["api_unreachable"]
            } else {
                return ["server_error"]
            }
        }

        // Normal success case
        if (Array.isArray(data) && data.length > 0) {
            return data
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


// Send form questions to backend to get destination suggestions
export async function formToBackend(formAnswers) {
    try{
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


// Get tips by the ID of the trip (in the backend: get_travel_tips function)
export async function getTipsByTripId(token, tripId, signal) {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/tips`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        signal
    })
    if (res.status === 401) {
        throw new Error("Unauthorized")
    }
    if (!res.ok) {
        throw new Error(`Failed to fetch trip ${tripId}: ${res.statusText}`);
    }
    return await res.json()
}