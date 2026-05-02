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

function newPredictionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `pred-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export default function PredictionForm({
  onPredictionRecorded,
  onScreeningPhase,
}) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('shopping')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    onScreeningPhase?.('start')
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
      onScreeningPhase?.('success', data)
      onPredictionRecorded?.({
        id: newPredictionId(),
        amount: n,
        category,
        fraud_label: Boolean(data.fraud_label),
        fraud_probability: Number(data.combined_score),
        recordedAt: new Date().toISOString(),
      })
    } catch (err) {
      const detail = err.response?.data?.detail
      const message =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((d) => d.msg || d).join(', ')
            : err.message || 'Request failed'
      onScreeningPhase?.('error', message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <article className="dash-card form-card">
      <header className="form-card__header">
        <h2 className="form-card__title">Screen a transaction</h2>
        <p className="form-card__hint">
          Amount and category are sent to your API at{' '}
          <span className="mono">/predict</span>.
        </p>
      </header>

      <form className="form-card__form" onSubmit={handleSubmit}>
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
              disabled={submitting}
            />
          </label>
          <label className="field">
            <span className="field-label">Category</span>
            <select
              className="field-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={submitting}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button className="submit" type="submit" disabled={submitting}>
          {submitting ? (
            <span className="submit-inner">
              <span className="spinner" aria-hidden="true" />
              Screening…
            </span>
          ) : (
            'Run screening'
          )}
        </button>
      </form>
    </article>
  )
}
