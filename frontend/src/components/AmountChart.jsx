import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export default function AmountChart({ transactions }) {
  const data = (transactions || [])
    .slice(-20)
    .map((t) => ({
      label: `#${t.id}`,
      amount: Number(t.amount),
    }))

  if (!data.length) {
    return (
      <section className="panel">
        <h2>Recent activity</h2>
        <p className="muted">No stored transactions yet (save some via the API).</p>
      </section>
    )
  }

  return (
    <section className="panel">
      <h2>Recent amounts (stored)</h2>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
