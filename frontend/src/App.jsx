import { lazy, Suspense, useCallback, useState } from 'react'
import './App.css'
import PredictionForm from './components/PredictionForm.jsx'

const PredictionCharts = lazy(() => import('./components/PredictionCharts.jsx'))

export default function App() {
  const [predictionHistory, setPredictionHistory] = useState([])

  const handlePredictionRecorded = useCallback((record) => {
    setPredictionHistory((prev) => [...prev, record])
  }, [])

  return (
    <div className="shell">
      <div className="dashboard">
        <div className="dashboard__primary">
          <PredictionForm onPredictionRecorded={handlePredictionRecorded} />
        </div>
        <div className="dashboard__charts">
          <Suspense
            fallback={
              <p className="charts-fallback">Loading charts…</p>
            }
          >
            <PredictionCharts predictions={predictionHistory} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
