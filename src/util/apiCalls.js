import { BASE_URL } from './config'


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
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}`, {
        headers: {
            Authorization: `Bearer ${token}`, 
            "Content-Type": "application/json"
            }
    })
    return await res.json()
  } catch (err) {
    console.error('Error in getTripById:', err)
  }
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
export async function popupToBackend(token, tripId, finalAnswers, suggestionsParams) {
    try {
        const payload = { ...finalAnswers}

        if (suggestionsParams) {
            payload.lat = suggestionsParams.lat
            payload.lon = suggestionsParams.lon
            if (suggestionsParams.radius >= 2000) { // minimum radius is always 2km
                payload.radius = suggestionsParams.radius
            } else {
                payload.radius = 2000
            }
        } else {
            console.warn("No suggestionsParams provided, suggestions may be incorect")
        }
        console.log("Payload sent to backend:", payload)
        
        const res = await fetch (`${BASE_URL}/trips/${tripId}/suggestions`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`, 
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
        const data = await res.json()
        console.log("Backend response in apiCalls:", data)
        if (data.length > 0) {
            return data
        } else {
            return ["No results found"]
        }
        
    } catch (err) {
        console.error("Error in popupToBackend", err)
    }
}