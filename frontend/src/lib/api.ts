import axios from "axios";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";

// export async function apiRequest(endpoint: string, options: RequestInit = {}) {
//   const url = `${API_BASE_URL}${endpoint}`

//   const response = await fetch(url, {
//     headers: {
//       'Content-Type': 'application/json',
//       ...options.headers,
//     },
//     ...options,
//   })

//   if (!response.ok) {
//     throw new Error(`API request failed: ${response.statusText}`)
//   }

//   return response.json()
// }

const apiRequest = axios.create({
  baseURL: API_BASE_URL,
});

apiRequest.defaults.withCredentials = true;

export { apiRequest };
