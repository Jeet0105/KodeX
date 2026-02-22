import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

const getToken = () => localStorage.getItem("token")

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api