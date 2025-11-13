
// Centralized API fetch wrapper that:
// - Automatically includes authorization headers
// - Handles token refresh on 401 responses
// - Supports optional HTTP method, request body, and AbortSignal
// - Allows optional custom headers
// This general function can be used for all API calls so individual functions
// don’t need to handle token refresh themselves.


export async function apiFetch(
    url, //the url to fetch
    //first parameter object, with default values
    {
        method = "GET",
        body = null,
        token, //access token
        headers = {},
        signal = undefined, //optional abort signal for cancellation
    } = {}, // = {} means the parameter is optional. If nothing is passed, it defaults to an empty object 
    // second parameter object, also optional, for auth helper functions:
    { refreshAccessToken, logout, navigate } = {}
) {

    const defaultHeaders = {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : undefined, //attach token if available
    }

    const options = {
        method,
        headers: { ...defaultHeaders, ...headers },
        body: body ? JSON.stringify(body) : undefined,
        signal
    }

    let res = await fetch(url, options)

    //Retry if 401 unauthorized
    if (res.status === 401 && refreshAccessToken) {
        try {
            const newToken = await refreshAccessToken()
            options.headers.Authorization = `Bearer ${newToken}`
            res = await fetch(url, options)
        } catch {
            logout()
            navigate("/login", { replace: true }) //redirect to login if refresh token is unauthorized
            throw new Error("Unauthorized after refresh")
        }
    }

    // Try to parse JSON
    let data
    try {
        data = await res.json()
    } catch {
        data = null
    }

    if (!res.ok) {
        const error = new Error(`API Error: ${res.status} ${res.statusText}`)
        error.response = data
        throw error
    }

    return data
}
