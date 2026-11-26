
import { useEffect, useState } from 'react'

import {
  DollarSign,
  ShoppingCart,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

import { supabase } from '../lib/supabase'

import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import StatCard from '../components/StatCard'
import RevenueChart from '../components/RevenueChart'

function Dashboard() {
  const [vendas, setVendas] = useState([])
  const [despesas, setDespesas] = useState([])
  const [carregando, setCarregando] = useState(true)

  // Buscar dados do Supabase
  useEffect(() => {
    let ativo = true

    async function buscarDados() {
      const [
        { data: vendasData, error: vendasError },
        { data: despesasData, error: despesasError }
      ] = await Promise.all([
        supabase
          .from('vendas')
          .select('*')
          .order('data', { ascending: false }),

        supabase
          .from('despesas')
          .select('*')
          .order('data', { ascending: false })
      ])

      if (!ativo) return

      if (vendasError) {
        console.error('Erro ao buscar vendas:', vendasError.message)
      }

      if (despesasError) {
        console.error('Erro ao buscar despesas:', despesasError.message)
      }

      if (!vendasError) {
        const vendasFormatadas = (vendasData || []).map(venda => ({
          ...venda,
          clienteNome: venda.cliente_nome,
          produtoNome: venda.produto_nome,
          valorTotal: Number(venda.valor_total)
        }))

        setVendas(vendasFormatadas)
      }

      if (!despesasError) {
        setDespesas(despesasData || [])
      }

      setCarregando(false)
    }

    buscarDados()

    // Atualização automática em tempo real
    const canal = supabase
      .channel('dashboard-atualizacoes')
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

  // Cálculos financeiros
  const faturamento = vendas.reduce(
    (total, venda) => total + Number(venda.valorTotal || 0),
    0
  )

  const quantidadeVendas = vendas.length

  const totalDespesas = despesas.reduce(
    (total, despesa) => total + Number(despesa.valor || 0),
    0
  )

  const lucro = faturamento - totalDespesas

  // Formatar moeda
  const formatarMoeda = valor =>
    Number(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })

  // Organizar atividades recentes
  const atividades = [
    ...vendas.map(venda => ({
      id: `venda-${venda.id}`,
      tipo: 'venda',
      titulo: 'Venda realizada',
      descricao: `${venda.clienteNome} · ${venda.produtoNome}`,
      valor: Number(venda.valorTotal || 0),
      data: venda.data
    })),

    ...despesas.map(despesa => ({
      id: `despesa-${despesa.id}`,
      tipo: 'despesa',
      titulo: 'Despesa registrada',
      descricao: `${despesa.descricao} · ${despesa.categoria}`,
      valor: Number(despesa.valor || 0),
      data: despesa.data
    }))
  ]

  const atividadesRecentes = atividades
    .sort((a, b) => new Date(b.data) - new Date(a.data))
    .slice(0, 5)

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="dashboard-content">

          <div className="welcome-section">
            <div>
              <h2>Bem-vindo de volta!</h2>
              <p>Aqui está o resumo do seu negócio.</p>
            </div>

            <span className="panel-period">
              {carregando ? 'Atualizando dados...' : 'Dados atualizados'}
            </span>
          </div>

          {/* INDICADORES FINANCEIROS */}
          <div className="stats-grid">

            <StatCard
              title="Faturamento"
              value={carregando ? '...' : formatarMoeda(faturamento)}
              percentage={`${quantidadeVendas} vendas registradas`}
              type="positive"
              icon={DollarSign}
            />

            <StatCard
              title="Vendas"
              value={carregando ? '...' : quantidadeVendas}
              percentage="Vendas realizadas"
              type="positive"
              icon={ShoppingCart}
            />

            <StatCard
              title="Despesas"
              value={carregando ? '...' : formatarMoeda(totalDespesas)}
              percentage={`${despesas.length} despesas registradas`}
              type="negative"
              icon={Wallet}
            />

            <StatCard
              title="Lucro líquido"
              value={carregando ? '...' : formatarMoeda(lucro)}
              percentage="Faturamento menos despesas"
              type={lucro >= 0 ? 'positive' : 'negative'}
              icon={TrendingUp}
            />

          </div>

          {/* GRÁFICO DE FATURAMENTO */}
          <section className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <h3>Visão financeira</h3>
                <p>
                  Faturamento mensal das vendas registradas.
                </p>
              </div>

              <span className="panel-period">
                {new Date().getFullYear()}
              </span>
            </div>

            <RevenueChart vendas={vendas} />
          </section>

          {/* ATIVIDADES RECENTES */}
          <section className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <h3>Atividades recentes</h3>
                <p>Últimas movimentações do negócio.</p>
              </div>
            </div>

            {carregando ? (
              <div className="clients-empty">
                <p>Carregando atividades...</p>
              </div>
            ) : atividadesRecentes.length === 0 ? (
              <div className="clients-empty">
                <ShoppingCart size={35} />
                <h3>Nenhuma atividade registrada</h3>
                <p>
                  As vendas e despesas aparecerão aqui.
                </p>
              </div>
            ) : (
              atividadesRecentes.map(atividade => (
                <div className="activity-item" key={atividade.id}>

                  <div className="activity-icon">
                    {atividade.tipo === 'venda' ? (
                      <ArrowUpRight size={19} />
                    ) : (
                      <ArrowDownRight size={19} />
                    )}
                  </div>

                  <div className="activity-info">
                    <strong>{atividade.titulo}</strong>
                    <span>{atividade.descricao}</span>
                  </div>

                  <strong className="activity-value">
                    {atividade.tipo === 'venda' ? '+' : '-'}
                    {' '}
                    {formatarMoeda(atividade.valor)}
                  </strong>

                </div>
              ))
            )}

          </section>

        </section>
      </main>
    </div>
  )
}

export default Dashboard
