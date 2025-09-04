import { BASE_URL } from './config'


// Get all trips
export async function getAllTrips() {
    try {
        const res = await fetch(`${BASE_URL}/trips`)
        return await res.json()
      } catch (err) {
        console.error('Error in getAllTrips:', err)
      }
}


// Get a trip by its ID
export async function getTripById(tripId) {
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}`)
    return await res.json()
  } catch (err) {
    console.error('Error in getTripById:', err)
  }
}

// Update a trip by its ID
export async function updateTripById(tripId, tripName, mappedFoods, mappedPointsOfInterest, mappedAccommodations) {
    try {
        const res = await fetch(`${BASE_URL}/trips/${tripId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: tripName,
                foods: mappedFoods,
                points_of_interest: mappedPointsOfInterest,
                accommodations: mappedAccommodations
            })
        })
        return await res.json()
    } catch (err) {
        console.error('Error in updateTripById')
    }
}

// Delete a trip by its ID
export async function deleteTripById(tripId) {
    try {
        const res = await fetch(`${BASE_URL}/trips/${tripId}`, {
            method: "DELETE"
        })
        return await res.json()
    } catch (err) {
        console.error('Error in deleteTripById')
    }
}

// Create new trip
export async function createNewTrip() {
    try {
        const res = await fetch(`${BASE_URL}/trips`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Untitled Trip", image: null })
        })
        return await res.json()
    } catch (err) {
        console.error('Error in createNewTrip')
    }

}