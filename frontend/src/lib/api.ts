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
  withCredentials: true,
});
apiRequest.interceptors.request.use((config) => {
  config.withCredentials = true;
  return config;
});
apiRequest.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("error from apiRequest", error);
    console.log("Document cookies", document.cookie);
    if (error.response?.status === 401) {
      const response = await axios.post(
        `${API_BASE_URL}/user/token/refresh/`,
        {},
        {
          withCredentials: true,
        }
      );
      console.log("response from refresh token", response);
      // return response;
      return apiRequest(error.config);
    }
    return Promise.reject(error);
  }
);

apiRequest.defaults.withCredentials = true;

export { apiRequest };
