import { useState } from 'react'
import { predictTransaction } from '../services/api.js'

const CATEGORIES = [
  'shopping',
  'food',
  'travel',
  'bills',
  'entertainment',
  'uncategorized',
]

export default function PredictionForm() {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('shopping')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      const n = Number(amount)
      if (Number.isNaN(n)) {
        throw new Error('Amount must be a number.')
      }
      const payload = {
        amount: n,
        timestamp: new Date().toISOString(),
        merchant: 'unknown',
        category,
        location: null,
        isFraud: false,
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

  const fraud = result?.fraud_label === true
  const prob = result != null ? Number(result.combined_score) : null

  return (
    <article className="card">
      <header className="card-header">
        <h1 className="card-title">Fraud check</h1>
        <p className="card-subtitle">
          Enter a transaction. We score it against the API model.
        </p>
      </header>

      <form className="card-form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field-label">Amount</span>
          <input
            className="field-input"
            type="number"
            step="any"
            required
            inputMode="decimal"
            placeholder="e.g. 150000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>

        <label className="field">
          <span className="field-label">Category</span>
          <select
            className="field-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <button className="submit" type="submit" disabled={loading}>
          {loading ? 'Checking…' : 'Check for fraud'}
        </button>
      </form>

      {error && <p className="message message-error">{error}</p>}

      {result && (
        <section className="outcome" aria-live="polite">
          <div className="outcome-row">
            <span className="outcome-label">Fraud probability</span>
            <span className="outcome-value">
              {prob != null && !Number.isNaN(prob)
                ? prob.toFixed(3)
                : '—'}
            </span>
          </div>
          <div className="outcome-row outcome-row--verdict">
            <span className="outcome-label">Prediction</span>
            <span
              className={`verdict ${fraud ? 'verdict--fraud' : 'verdict--ok'}`}
            >
              {fraud ? 'Fraud' : 'Not fraud'}
            </span>
          </div>
        </section>
      )}
    </article>
  )
}
