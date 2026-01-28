import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Transactions
export const getTransactions = (params = {}) => {
  return api.get('/transactions/', { params })
}

export const getTransaction = (id) => {
  return api.get(`/transactions/${id}`)
}

export const createTransaction = (data) => {
  return api.post('/transactions/', data)
}

export const updateTransaction = (id, data) => {
  return api.put(`/transactions/${id}`, data)
}

export const deleteTransaction = (id) => {
  return api.delete(`/transactions/${id}`)
}

// Categories
export const getCategories = () => {
  return api.get('/categories/')
}

export const getCategory = (id) => {
  return api.get(`/categories/${id}`)
}

export const createCategory = (data) => {
  return api.post('/categories/', data)
}

export const updateCategory = (id, data) => {
  return api.put(`/categories/${id}`, data)
}

export const deleteCategory = (id) => {
  return api.delete(`/categories/${id}`)
}

// Accounts
export const getAccounts = () => {
  return api.get('/accounts/')
}

export const getAccount = (id) => {
  return api.get(`/accounts/${id}`)
}

export const createAccount = (data) => {
  return api.post('/accounts/', data)
}

export const updateAccount = (id, data) => {
  return api.put(`/accounts/${id}`, data)
}

export const deleteAccount = (id) => {
  return api.delete(`/accounts/${id}`)
}

// Reports
export const getMonthlyReport = (year, month) => {
  return api.get(`/reports/monthly/${year}/${month}`)
}

export const getCurrentMonthReport = () => {
  return api.get('/reports/current-month')
}

// Import
export const importCSV = (file, accountId = null) => {
  const formData = new FormData()
  formData.append('file', file)
  if (accountId) {
    formData.append('account_id', accountId)
  }

  return api.post('/import/csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const getCSVTemplate = () => {
  return api.get('/import/template')
}

export default api
