import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const FRAUD_COLOR = '#dc2626'
const SAFE_COLOR = '#16a34a'
const AMT_COLOR = '#6366f1'

function formatAmount(v) {
  if (v == null || Number.isNaN(v)) return '—'
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(1)}k`
  return String(Math.round(v))
}

function countOutcomes(predictions) {
  let fraud = 0
  let safe = 0
  for (const p of predictions) {
    if (p.fraud_label) fraud += 1
    else safe += 1
  }
  return { fraud, safe }
}

function pieSlices(fraud, safe) {
  return [
    { name: 'Fraud', value: fraud, fill: FRAUD_COLOR },
    { name: 'Safe', value: safe, fill: SAFE_COLOR },
  ].filter((d) => d.value > 0)
}

function barDataFromHistory(predictions, maxPoints = 10) {
  const slice = predictions.slice(-maxPoints)
  const start = predictions.length - slice.length + 1
  return slice.map((p, i) => ({
    name: `Run ${start + i}`,
    amount: p.amount,
    probability: p.fraud_probability,
  }))
}

export default function PredictionCharts({ predictions }) {
  const total = predictions.length
  const { fraud: fraudTotal, safe: safeTotal } = countOutcomes(predictions)
  const pieData = pieSlices(fraudTotal, safeTotal)
  const barData = barDataFromHistory(predictions)

  return (
    <div className="charts">
      <section className="chart-card">
        <h2 className="chart-card__title">Outcome mix</h2>
        <p className="chart-card__desc">
          Share of screened transactions flagged as fraud vs safe.
        </p>
        {total === 0 ? (
          <p className="chart-card__empty">
            No runs yet — screen a transaction to populate this chart.
          </p>
        ) : (
          <div className="chart-card__plot chart-card__plot--pie">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={88}
                  paddingAngle={2}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} runs`, name]}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  formatter={(value) =>
                    value === 'Fraud'
                      ? `Fraud (${fraudTotal})`
                      : `Safe (${safeTotal})`
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="chart-card">
        <h2 className="chart-card__title">Amount vs fraud probability</h2>
        <p className="chart-card__desc">
          Last {barData.length} run{barData.length === 1 ? '' : 's'}: bars =
          amount you entered; line = fraud probability (0–1).
        </p>
        {barData.length === 0 ? (
          <p className="chart-card__empty">
            No runs yet — screen a transaction to see trends here.
          </p>
        ) : (
          <div className="chart-card__plot">
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart
                data={barData}
                margin={{ top: 8, right: 12, left: 4, bottom: 4 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="amt"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={formatAmount}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  label={{
                    value: 'Amount',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fill: '#64748b', fontSize: 11 },
                  }}
                />
                <YAxis
                  yAxisId="prob"
                  orientation="right"
                  domain={[0, 1]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(v) => v.toFixed(1)}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  label={{
                    value: 'Fraud probability',
                    angle: 90,
                    position: 'insideRight',
                    style: { fill: '#64748b', fontSize: 11 },
                  }}
                />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === 'Transaction amount')
                      return [formatAmount(value), 'Amount']
                    if (name === 'Fraud probability')
                      return [Number(value).toFixed(3), 'Probability (0–1)']
                    return [value, name]
                  }}
                  labelFormatter={(label) => `Screening: ${label}`}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  yAxisId="amt"
                  dataKey="amount"
                  name="Transaction amount"
                  fill={AMT_COLOR}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
                <Line
                  yAxisId="prob"
                  type="monotone"
                  dataKey="probability"
                  name="Fraud probability"
                  stroke={FRAUD_COLOR}
                  strokeWidth={2}
                  dot={{ r: 4, fill: FRAUD_COLOR }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  )
}
