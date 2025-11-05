// Helper functions that formats the data 

// BACKEND -> FRONTEND

export const mapCategoryForFrontend = (items) => {
    return items.map(item => ({
        ...item,
        latLong: item.coordinates // match frontend and backend names
            ? item.coordinates.split(",").map(Number)
            : null,
        url: item.external_url // match frontend and backend names
    }))
}

// used to get the data
export const formatTripData = (data) => { 
    return {
        tripName: data.trip.name,
        stays: mapCategoryForFrontend(data.stays),
        eatDrink: mapCategoryForFrontend(data.eat_drink),
        explore: mapCategoryForFrontend(data.explore),
        essentials: mapCategoryForFrontend(data.essentials),
        gettingAround: mapCategoryForFrontend(data.getting_around)
    }
}

// FRONTEND -> BACKEND

// used to save the data
export const mapItemForBackend = (item) => ({ 
    id: item.id && item.id.toString().startsWith("temp-") ? null : item.id,
    name: item.name,
    status: item.status,
    price: item.price,
    address: item.address,
    day: typeof item.day === "string" ? item.day.split(",").map(v => parseInt(v.trim(), 10)).filter(v => !isNaN(v)) : item.day,
    coordinates: Array.isArray(item.latLong) ? item.latLong.join(",") : (item.latLong || null),
    external_url: item.url,
    comments: item.comments,
    deleted: item.deleted || false
})