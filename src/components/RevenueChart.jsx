

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

const meses = [
  'Jan', 'Fev', 'Mar', 'Abr',
  'Mai', 'Jun', 'Jul', 'Ago',
  'Set', 'Out', 'Nov', 'Dez'
]

function RevenueChart({ vendas = [] }) {
  const anoAtual = new Date().getFullYear()

  const dados = meses.map((mes, indice) => {
    const faturamento = vendas.reduce((total, venda) => {
      const dataVenda = new Date(venda.data)

      if (
        dataVenda.getFullYear() === anoAtual &&
        dataVenda.getMonth() === indice
      ) {
        return total + Number(venda.valorTotal || 0)
      }

      return total
    }, 0)

    return {
      month: mes,
      revenue: faturamento
    }
  })

  return (
    <div className="revenue-chart">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={dados}>
          <defs>
            <linearGradient
              id="revenueGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#36A68A" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#36A68A" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#EDF0F4"
          />

          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#8993A3', fontSize: 12 }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#8993A3', fontSize: 12 }}
            tickFormatter={(value) => `R$${value / 1000}k`}
          />

          <Tooltip
            formatter={(value) => [
              `R$ ${Number(value).toLocaleString('pt-BR', {
                minimumFractionDigits: 2
              })}`,
              'Faturamento'
            ]}
          />

          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#36A68A"
            strokeWidth={3}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default RevenueChart
