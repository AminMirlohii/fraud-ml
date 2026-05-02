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
              Model score, amount Z-score, and category signals…
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
  const zScore =
    result.amount_z_score != null && result.amount_z_score !== ''
      ? Number(result.amount_z_score)
      : null
  const explanations = Array.isArray(result.explanations)
    ? result.explanations
    : []

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

      {zScore != null && !Number.isNaN(zScore) && (
        <div className="result-z">
          <span className="result-z__label">Amount Z-score</span>
          <span className="result-z__value">{zScore.toFixed(2)}</span>
          <span className="result-z__hint">
            vs. typical “safe” amounts in the model reference set (0 = average).
          </span>
        </div>
      )}

      <div className="result-why">
        <h3 className="result-why__title">Why this outcome</h3>
        <ul className="result-why__list">
          {explanations.length === 0 ? (
            <li className="result-why__item">No detail returned from the API.</li>
          ) : (
            explanations.map((line, i) => (
              <li key={`${i}-${line.slice(0, 24)}`} className="result-why__item">
                {line}
              </li>
            ))
          )}
        </ul>
      </div>
    </article>
  )
}
