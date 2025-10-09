// Combine all markers into single array
export function combineMarkers(markerArrays = []) {
    return markerArrays.flat() //flatten all arrays into a single array
}

// Calculate geographic center of all markers
export function getCenterOfMarkers(markers = []) {
    if (!markers.length) return null
    //sum all lat and long  
    const sum = markers.reduce((accumulator, marker) => ({ //'reduce' reduces an array to a single value by applying a function
        lat: accumulator.lat + marker.lat,
        lon: accumulator.lon + marker.lon
    }), { lat: 0, lon: 0 } //initial value of accumulator
    )
    // Average = sum / number of markers
    const center = {
        lat: sum.lat / markers.length,
        lon: sum.lon / markers.length
    }
    return center
}

// Get radius from markers (calculates a radius that covers all markers)
export function getRadiusFromMarkers(markers = [], center) {
    if (!markers.length || !center) return 2000 // fallback 2km
    if (markers.length === 1) return 2000 //2km if there is only one marker
  
    const toRadians = degrees => (degrees * Math.PI) / 180
    const R = 6371000 // Earth radius in meters
  
    // Compute max distance from center to any marker
    const maxDist = markers.reduce((max, marker) => {
      const differenceLat = toRadians(marker.lat - center.lat)
      const differenceLon = toRadians(marker.lon - center.lon)
    
    //Haversine formula (calculates distance between 2 points on a sphere)
      const a =
        Math.sin(differenceLat / 2) ** 2 +
        Math.cos(toRadians(center.lat)) *
          Math.cos(toRadians(marker.lat)) *
          Math.sin(differenceLon / 2) ** 2
  
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const dist = R * c; // distance in meters
  
      return Math.max(max, dist) //keep the largest distance found so far
    }, 0)
  
    // Add padding: 30% plus 500m buffer
    return Math.round(maxDist * 1.3 + 500)
  }