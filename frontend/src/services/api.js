import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

/**
 * POST /predict — fraud score for a single transaction payload.
 */
export async function predictTransaction(body) {
  const { data } = await api.post('/predict', body)
  return data
}

/**
 * Past predictions: tries GET /prediction-history if the backend adds it later.
 * Otherwise falls back to GET /transactions (stored rows, closest available history).
 */
export async function fetchPastPredictions() {
  try {
    const { data } = await api.get('/prediction-history')
    return Array.isArray(data) ? data : []
  } catch {
    try {
      const { data } = await api.get('/transactions')
      return Array.isArray(data) ? data : []
    } catch {
      return []
    }
  }
}
