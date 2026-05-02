import { lazy, Suspense, useCallback, useState } from 'react'
import './App.css'
import PredictionForm from './components/PredictionForm.jsx'
import PredictionResult from './components/PredictionResult.jsx'

const PredictionCharts = lazy(() => import('./components/PredictionCharts.jsx'))

const initialScreening = {
  loading: false,
  error: null,
  result: null,
  resultKey: 0,
}

export default function App() {
  const [screening, setScreening] = useState(initialScreening)
  const [predictionHistory, setPredictionHistory] = useState([])

  const handleScreeningPhase = useCallback((phase, payload) => {
    setScreening((prev) => {
      if (phase === 'start') {
        return { ...prev, loading: true, error: null, result: null }
      }
      if (phase === 'success') {
        return {
          loading: false,
          error: null,
          result: payload,
          resultKey: prev.resultKey + 1,
        }
      }
      if (phase === 'error') {
        return { ...prev, loading: false, error: payload, result: null }
      }
      return prev
    })
  }, [])

  const handlePredictionRecorded = useCallback((record) => {
    setPredictionHistory((prev) => [...prev, record])
  }, [])

  return (
    <div className="shell">
      <header className="app-header">
        <h1 className="app-header__title">RiskGuard</h1>
        <p className="app-header__meta">Fraud screening dashboard</p>
      </header>

      <main className="dash-stack">
        <section className="dash-section">
          <p className="dash-section__label">Input</p>
          <PredictionForm
            onScreeningPhase={handleScreeningPhase}
            onPredictionRecorded={handlePredictionRecorded}
          />
        </section>

        <section className="dash-section">
          <p className="dash-section__label">Prediction</p>
          <PredictionResult
            loading={screening.loading}
            error={screening.error}
            result={screening.result}
            resultKey={screening.resultKey}
          />
        </section>

        <section className="dash-section">
          <p className="dash-section__label">Charts</p>
          <Suspense fallback={<p className="charts-fallback">Loading charts…</p>}>
            <PredictionCharts predictions={predictionHistory} />
          </Suspense>
        </section>
      </main>
    </div>
  )
}
