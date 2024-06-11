import axios from 'axios'

const api = axios.create({
  baseURL: 'https://easy-desafio-backend.onrender.com/',
  headers: {
    'Content-Type': 'application/json',
    Accept: '*/*',
  },
})

export default api
