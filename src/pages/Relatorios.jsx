
import { useEffect, useState } from 'react'

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'

import {
  BarChart3,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  Wallet,
  CalendarDays,
  FileDown
} from 'lucide-react'

import { supabase } from '../lib/supabase'

import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

function Relatorios() {
  const [vendas, setVendas] = useState([])
  const [produtos, setProdutos] = useState([])
  const [despesas, setDespesas] = useState([])
  const [carregando, setCarregando] = useState(true)

  // Filtros de período
  const [periodo, setPeriodo] = useState('mes')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  // Buscar dados do Supabase
  useEffect(() => {
    let ativo = true

    async function buscarDados() {
      const [
        { data: vendasData, error: vendasError },
        { data: produtosData, error: produtosError },
        { data: despesasData, error: despesasError }
      ] = await Promise.all([
        supabase
          .from('vendas')
          .select('*')
          .order('data', { ascending: false }),

        supabase
          .from('produtos')
          .select('*'),

        supabase
          .from('despesas')
          .select('*')
          .order('data', { ascending: false })
      ])

      if (!ativo) return

      if (vendasError) {
        console.error('Erro ao buscar vendas:', vendasError.message)
      } else {
        setVendas(
          (vendasData || []).map(venda => ({
            ...venda,
            clienteNome: venda.cliente_nome,
            produtoNome: venda.produto_nome,
            valorTotal: Number(venda.valor_total)
          }))
        )
      }

      if (produtosError) {
        console.error('Erro ao buscar produtos:', produtosError.message)
      } else {
        setProdutos(produtosData || [])
      }

      if (despesasError) {
        console.error('Erro ao buscar despesas:', despesasError.message)
      } else {
        setDespesas(despesasData || [])
      }

      setCarregando(false)
    }

    buscarDados()

    // Atualização automática em tempo real
    const canal = supabase
      .channel('relatorios-atualizacoes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vendas'
        },
        () => buscarDados()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'produtos'
        },
        () => buscarDados()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'despesas'
        },
        () => buscarDados()
      )
      .subscribe()

    return () => {
      ativo = false
      supabase.removeChannel(canal)
    }
  }, [])

  // Exportar PDF
  function exportarPDF() {
    window.print()
  }

  // Obter data no formato local
  function obterDataLocal(data) {
    const ano = data.getFullYear()
    const mes = String(data.getMonth() + 1).padStart(2, '0')
    const dia = String(data.getDate()).padStart(2, '0')

    return `${ano}-${mes}-${dia}`
  }

  // Filtrar por período
  function filtrarPorPeriodo(item) {
    const dataItem = item.data?.substring(0, 10)
    const hoje = obterDataLocal(new Date())

    if (!dataItem) return false

    if (periodo === 'hoje') {
      return dataItem === hoje
    }

    if (periodo === '7dias') {
      const limite = new Date()
      limite.setDate(limite.getDate() - 6)

      return (
        dataItem >= obterDataLocal(limite) &&
        dataItem <= hoje
      )
    }

    if (periodo === 'mes') {
      return dataItem.substring(0, 7) === hoje.substring(0, 7)
    }

    if (periodo === 'personalizado') {
      if (dataInicio && dataItem < dataInicio) return false
      if (dataFim && dataItem > dataFim) return false

      return true
    }

    return true
  }

  const vendasFiltradas = vendas.filter(filtrarPorPeriodo)
  const despesasFiltradas = despesas.filter(filtrarPorPeriodo)

  // Cálculos financeiros
  const faturamento = vendasFiltradas.reduce(
    (total, venda) => total + Number(venda.valorTotal || 0),
    0
  )

  const quantidadeVendas = vendasFiltradas.length

  const totalDespesas = despesasFiltradas.reduce(
    (total, despesa) => total + Number(despesa.valor || 0),
    0
  )

  const lucroLiquido = faturamento - totalDespesas

  const margemLucro = faturamento > 0
    ? (lucroLiquido / faturamento) * 100
    : 0

  const ticketMedio = quantidadeVendas > 0
    ? faturamento / quantidadeVendas
    : 0

  // Dados do gráfico comparativo
  const dadosGrafico = [
    {
      nome: 'Faturamento',
      valor: faturamento
    },
    {
      nome: 'Despesas',
      valor: totalDespesas
    }
  ]

  // Ranking de produtos vendidos
  const produtosVendidos = {}

  vendasFiltradas.forEach(venda => {
    const nome = venda.produtoNome || 'Produto sem nome'

    produtosVendidos[nome] =
      (produtosVendidos[nome] || 0) +
      Number(venda.quantidade || 0)
  })

  const rankingProdutos = Object.entries(produtosVendidos)
    .sort((a, b) => b[1] - a[1])

  // Evolução do faturamento nos últimos 6 meses
  const dadosEvolucao = []
  const hoje = new Date()

  for (let i = 5; i >= 0; i--) {
    const dataMes = new Date(
      hoje.getFullYear(),
      hoje.getMonth() - i,
      1
    )

    const ano = dataMes.getFullYear()
    const mes = String(dataMes.getMonth() + 1).padStart(2, '0')

    const nomeMes = dataMes.toLocaleDateString('pt-BR', {
      month: 'short'
    })

    const faturamentoMes = vendas
      .filter(venda => {
        const dataVenda = venda.data?.substring(0, 10)

        return dataVenda?.startsWith(`${ano}-${mes}`)
      })
      .reduce((total, venda) => {
        return total + Number(venda.valorTotal || 0)
      }, 0)

    dadosEvolucao.push({
      mes: nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1),
      faturamento: faturamentoMes
    })
  }

  // Formatação de moeda
  const formatarMoeda = valor =>
    Number(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="dashboard-content">

          {/* CABEÇALHO */}
          <div className="clients-heading reports-heading">
            <div>
              <span className="clients-eyebrow">
                ANÁLISE DO NEGÓCIO
              </span>
              <h1>Relatórios</h1>
              <p>Acompanhe os resultados do seu negócio.</p>
            </div>

            <button
              className="reports-export-button"
              onClick={exportarPDF}
            >
              <FileDown size={18} />
              Exportar PDF
            </button>
          </div>

          {/* EVOLUÇÃO DO FATURAMENTO */}
          <div className="clients-panel reports-panel">
            <div className="clients-panel-header">
              <div>
                <h2>Evolução do faturamento</h2>
                <p>
                  Acompanhe o desempenho das vendas nos últimos 6 meses.
                </p>
              </div>

              <TrendingUp size={22} />
            </div>

            <div className="reports-chart">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosEvolucao}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis dataKey="mes" />

                  <YAxis
                    tickFormatter={valor =>
                      valor.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        maximumFractionDigits: 0
                      })
                    }
                  />

                  <Tooltip
                    formatter={valor => formatarMoeda(valor)}
                  />

                  <Line
                    type="monotone"
                    dataKey="faturamento"
                    stroke="#36A68A"
                    strokeWidth={3}
                    dot={{
                      r: 5,
                      fill: '#FFFFFF',
                      stroke: '#36A68A',
                      strokeWidth: 3
                    }}
                    activeDot={{
                      r: 7,
                      fill: '#36A68A',
                      stroke: '#FFFFFF',
                      strokeWidth: 2
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* FATURAMENTO X DESPESAS */}
          <div className="clients-panel reports-panel">
            <div className="clients-panel-header">
              <div>
                <h2>Faturamento x Despesas</h2>
                <p>
                  Compare o dinheiro que entrou e saiu no período.
                </p>
              </div>

              <BarChart3 size={22} />
            </div>

            <div className="reports-chart">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosGrafico}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis dataKey="nome" />
                  <YAxis />

                  <Tooltip
                    formatter={valor => formatarMoeda(valor)}
                  />

                  <Bar
                    dataKey="valor"
                    radius={[8, 8, 0, 0]}
                    barSize={65}
                  >
                    {dadosGrafico.map((item, index) => (
                      <Cell
                        key={item.nome}
                        fill={index === 0 ? '#36A68A' : '#E36B6B'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* FILTROS */}
          <div className="clients-panel reports-filter-panel">
            <div className="clients-panel-header">
              <div>
                <h2>Filtrar resultados</h2>
                <p>
                  Escolha o período que deseja analisar.
                </p>
              </div>

              <CalendarDays size={22} />
            </div>

            <div className="reports-filters">
              <div className="reports-filter-group">
                <label>Período</label>

                <select
                  value={periodo}
                  onChange={e => setPeriodo(e.target.value)}
                >
                  <option value="hoje">Hoje</option>
                  <option value="7dias">Últimos 7 dias</option>
                  <option value="mes">Este mês</option>
                  <option value="personalizado">Personalizado</option>
                </select>
              </div>

              {periodo === 'personalizado' && (
                <>
                  <div className="reports-filter-group">
                    <label>Data inicial</label>

                    <input
                      type="date"
                      value={dataInicio}
                      max={dataFim || undefined}
                      onChange={e => setDataInicio(e.target.value)}
                    />
                  </div>

                  <div className="reports-filter-group">
                    <label>Data final</label>

                    <input
                      type="date"
                      value={dataFim}
                      min={dataInicio || undefined}
                      onChange={e => setDataFim(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* INDICADORES FINANCEIROS */}
          <div className="reports-summary">

            <div className="clients-summary">
              <div className="summary-icon">
                <DollarSign size={20} />
              </div>
              <span>Faturamento total</span>
              <strong>
                {carregando ? '...' : formatarMoeda(faturamento)}
              </strong>
            </div>

            <div className="clients-summary">
              <div className="summary-icon">
                <ShoppingCart size={20} />
              </div>
              <span>Total de vendas</span>
              <strong>
                {carregando ? '...' : quantidadeVendas}
              </strong>
            </div>

            <div className="clients-summary">
              <div className="summary-icon">
                <TrendingUp size={20} />
              </div>
              <span>Ticket médio</span>
              <strong>
                {carregando ? '...' : formatarMoeda(ticketMedio)}
              </strong>
            </div>

            <div className="clients-summary">
              <div className="summary-icon">
                <Package size={20} />
              </div>
              <span>Produtos cadastrados</span>
              <strong>
                {carregando ? '...' : produtos.length}
              </strong>
            </div>

            <div className="clients-summary">
              <div className="summary-icon">
                <Wallet size={20} />
              </div>
              <span>Total de despesas</span>
              <strong>
                {carregando ? '...' : formatarMoeda(totalDespesas)}
              </strong>
            </div>

            <div className="clients-summary">
              <div className="summary-icon">
                <TrendingUp size={20} />
              </div>
              <span>Lucro líquido</span>
              <strong>
                {carregando ? '...' : formatarMoeda(lucroLiquido)}
              </strong>
              <small>{margemLucro.toFixed(1)}% de margem</small>
            </div>

          </div>

          {/* RANKING DE PRODUTOS */}
          <div className="clients-panel reports-panel">
            <div className="clients-panel-header">
              <div>
                <h2>Produtos mais vendidos</h2>
                <p>
                  Ranking baseado nas vendas do período selecionado.
                </p>
              </div>

              <BarChart3 size={22} />
            </div>

            {carregando ? (
              <div className="clients-empty">
                <p>Carregando relatórios...</p>
              </div>
            ) : rankingProdutos.length === 0 ? (
              <div className="clients-empty">
                <Package size={35} />
                <h3>Nenhuma venda encontrada</h3>
                <p>
                  Não existem vendas registradas neste período.
                </p>
              </div>
            ) : (
              <div className="reports-ranking">
                {rankingProdutos.map(([nome, quantidade], index) => (
                  <div
                    className="reports-ranking-item"
                    key={nome}
                  >
                    <div className="reports-ranking-position">
                      {index + 1}
                    </div>

                    <div className="reports-ranking-info">
                      <strong>{nome}</strong>
                      <span>{quantidade} unidades vendidas</span>
                    </div>

                    <strong>{quantidade} un.</strong>
                  </div>
                ))}
              </div>
            )}
          </div>

        </section>
      </main>
    </div>
  )
}

export default Relatorios
