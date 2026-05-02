import { useEffect, useState } from 'react'
import './App.css'
import AmountChart from './components/AmountChart.jsx'
import PredictionForm from './components/PredictionForm.jsx'
import { fetchPastPredictions } from './services/api.js'

export default function App() {
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    fetchPastPredictions().then(setTransactions)
  }, [])

  return (
    <div className="app">
      <header className="header">
        <h1>Fraud ML</h1>
        <p className="muted">Backend: http://localhost:8000</p>
      </header>
      <main className="layout">
        <PredictionForm />
        <AmountChart transactions={transactions} />
      </main>
    </div>
  )
}
