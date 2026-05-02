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
  const [resultKey, setResultKey] = useState(0)
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
      setResultKey((k) => k + 1)
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

  const cardTone =
    result === null ? '' : fraud ? 'card--fraud' : 'card--safe'

  return (
    <article className={`card ${cardTone} ${loading ? 'card--loading' : ''}`}>
      <div className="card-brand">
        <span className="card-brand-mark" aria-hidden="true" />
        <div>
          <p className="card-brand-name">RiskGuard</p>
          <p className="card-brand-tag">Live transaction screening</p>
        </div>
      </div>

      <div className="card-body">
        <p className="card-lead">
          Review a payment before it settles. Results sync with your fraud
          model API.
        </p>

        <form className="card-form" onSubmit={handleSubmit}>
          <div className="fields-row">
            <label className="field">
              <span className="field-label">Amount</span>
              <input
                className="field-input"
                type="number"
                step="any"
                required
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
              />
            </label>
            <label className="field">
              <span className="field-label">Category</span>
              <select
                className="field-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button className="submit" type="submit" disabled={loading}>
            {loading ? (
              <span className="submit-inner">
                <span className="spinner" aria-hidden="true" />
                Analyzing…
              </span>
            ) : (
              'Screen transaction'
            )}
          </button>
        </form>

        {loading && (
          <div className="loading-panel" aria-live="polite">
            <div className="loading-panel__track">
              <span className="spinner spinner--large" aria-hidden="true" />
              <div>
                <p className="loading-panel__title">Checking risk signals</p>
                <p className="loading-panel__text">
                  Model scoring and amount anomaly checks…
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="message message-error message--animate" role="alert">
            {error}
          </div>
        )}

        {result && !loading && (
          <section
            className={`verdict-panel verdict-panel--${fraud ? 'fraud' : 'safe'}`}
            key={resultKey}
            aria-live="polite"
          >
            <h2 className="verdict-panel__headline">
              {fraud ? '⚠️ Fraud detected' : '✅ Safe transaction'}
            </h2>
            <div className="verdict-panel__stats">
              <div className="stat">
                <span className="stat-label">Risk score</span>
                <span className="stat-value">
                  {prob != null && !Number.isNaN(prob) ? prob.toFixed(3) : '—'}
                </span>
                <span className="stat-hint">0 = lowest, 1 = highest</span>
              </div>
            </div>
          </section>
        )}
      </div>
    </article>
  )
}
