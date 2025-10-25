import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const analyzeData = async (usersFile, transactionsFile) => {
  const formData = new FormData()
  formData.append('users_file', usersFile)
  formData.append('transactions_file', transactionsFile)

  try {
    const response = await api.post('/api/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    if (response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data.message || 'Analysis failed')
    }
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.detail || 'Server error')
    } else if (error.request) {
      throw new Error('No response from server. Please ensure the backend is running.')
    } else {
    }
  }
}

export const explainAccount = async (accountId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/explain`, {
      account_id: accountId
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get explanation')
  }
}

export const chatAboutCompliance = async (country, question, conversationHistory = null) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/compliance-chat`, {
      country,
      question,
      conversation_history: conversationHistory
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get compliance information')
  }
}

export const getResults = async () => {
  try {
    const response = await api.get('/api/results')
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch results')
  }
}

export const healthCheck = async () => {
  try {
    const response = await api.get('/api/health')
    return response.data
  } catch (error) {
    throw new Error('Backend health check failed')
  }
}

export default api
