export default function PredictionResult({
  loading,
  error,
  result,
  resultKey,
}) {
  if (loading) {
    return (
      <article className="dash-card result-card result-card--loading">
        <div className="result-loading">
          <span className="spinner spinner--large spinner--on-dark" aria-hidden="true" />
          <div>
            <p className="result-loading__title">Analyzing</p>
            <p className="result-loading__text">
              Model score and amount anomaly checks…
            </p>
          </div>
        </div>
      </article>
    )
  }

  if (error) {
    return (
      <article className="dash-card result-card">
        <p className="result-error" role="alert">
          {error}
        </p>
      </article>
    )
  }

  if (!result) {
    return (
      <article className="dash-card result-card result-card--idle">
        <p className="result-idle">
          Result appears here after you screen a transaction.
        </p>
      </article>
    )
  }

  const fraud = result.fraud_label === true
  const prob = Number(result.combined_score)

  return (
    <article
      className={`dash-card result-card result-card--outcome result-card--${fraud ? 'fraud' : 'safe'}`}
      key={resultKey}
      aria-live="polite"
    >
      <h2 className="result-headline">
        {fraud ? '⚠️ Fraud detected' : '✅ Safe transaction'}
      </h2>
      <div className="result-stat">
        <span className="result-stat__label">Risk score (0–1)</span>
        <span className="result-stat__value">
          {!Number.isNaN(prob) ? prob.toFixed(3) : '—'}
        </span>
      </div>
    </article>
  )
}
