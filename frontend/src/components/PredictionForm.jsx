import { useState } from 'react'
import { predictTransaction } from '../services/api.js'

const defaultForm = {
  amount: '',
  timestamp: '',
  merchant: '',
  category: 'shopping',
  location: '',
  isFraud: false,
}

export default function PredictionForm() {
  const [form, setForm] = useState(defaultForm)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      const ts =
        form.timestamp.trim() || new Date().toISOString().slice(0, 19)
      const payload = {
        amount: Number(form.amount),
        timestamp: ts,
        merchant: form.merchant.trim() || 'unknown',
        category: form.category,
        location: form.location.trim() || null,
        isFraud: Boolean(form.isFraud),
      }
      if (Number.isNaN(payload.amount)) {
        throw new Error('Amount must be a number')
      }
      const data = await predictTransaction(payload)
      setResult(data)
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((d) => d.msg || d).join(', ')
            : err.message || 'Request failed',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="panel">
      <h2>Predict fraud</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Amount
          <input
            type="number"
            step="any"
            required
            value={form.amount}
            onChange={(e) => update('amount', e.target.value)}
          />
        </label>
        <label>
          Timestamp (ISO)
          <input
            type="datetime-local"
            value={form.timestamp}
            onChange={(e) => update('timestamp', e.target.value)}
          />
        </label>
        <label>
          Merchant
          <input
            type="text"
            value={form.merchant}
            onChange={(e) => update('merchant', e.target.value)}
          />
        </label>
        <label>
          Category
          <select
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
          >
            <option value="shopping">shopping</option>
            <option value="food">food</option>
            <option value="travel">travel</option>
            <option value="bills">bills</option>
            <option value="entertainment">entertainment</option>
            <option value="uncategorized">uncategorized</option>
          </select>
        </label>
        <label>
          Location (optional)
          <input
            type="text"
            value={form.location}
            onChange={(e) => update('location', e.target.value)}
          />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={form.isFraud}
            onChange={(e) => update('isFraud', e.target.checked)}
          />
          Ground-truth isFraud (optional)
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Scoring…' : 'Run prediction'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {result && (
        <pre className="result">{JSON.stringify(result, null, 2)}</pre>
      )}
    </section>
  )
}
