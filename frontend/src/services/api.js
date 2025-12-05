import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getByCategory: (category) => api.get(`/products/category/${category}`),
  search: (query) => api.get(`/products/search?q=${query}`)
}

export const categoryService = {
  getAll: () => api.get('/categories'),
  getActive: () => api.get('/categories/active'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`)
}

export const subcategoryService = {
  getAll: () => api.get('/subcategories'),
  getActive: () => api.get('/subcategories/active'),
  getByCategory: (categoryId) => api.get(`/subcategories/category/${categoryId}`),
  create: (data) => api.post('/subcategories', data),
  update: (id, data) => api.put(`/subcategories/${id}`, data),
  delete: (id) => api.delete(`/subcategories/${id}`)
}

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile')
}

export const orderService = {
  create: (data) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getUserOrders: () => api.get('/orders/user'),
  getById: (id) => api.get(`/orders/${id}`)
}

export const cartService = {
  sync: (cartItems) => api.post('/cart/sync', { items: cartItems })
}

export default api
