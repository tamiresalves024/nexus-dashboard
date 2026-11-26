
import { useEffect, useState } from 'react'
import {
  ShoppingCart,
  Plus,
  Search,
  X,
  DollarSign,
  ClipboardList
} from 'lucide-react'

import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

function Vendas() {
  const [clientes, setClientes] = useState([])
  const [produtos, setProdutos] = useState([])
  const [vendas, setVendas] = useState([])

  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [busca, setBusca] = useState('')

  const [clienteId, setClienteId] = useState('')
  const [produtoId, setProdutoId] = useState('')
  const [quantidade, setQuantidade] = useState(1)

  // Buscar clientes, produtos e vendas
  useEffect(() => {
    async function buscarDados() {
      const [clientesResult, produtosResult, vendasResult] =
        await Promise.all([
          supabase
            .from('clientes')
            .select('*')
            .order('created_at', { ascending: false }),

          supabase
            .from('produtos')
            .select('*')
            .order('created_at', { ascending: false }),

          supabase
            .from('vendas')
            .select('*')
            .order('data', { ascending: false })
        ])

      if (clientesResult.error || produtosResult.error || vendasResult.error) {
        console.error(
          'Erro ao buscar dados:',
          clientesResult.error?.message,
          produtosResult.error?.message,
          vendasResult.error?.message
        )

        alert('Não foi possível carregar os dados das vendas.')
      } else {
        setClientes(clientesResult.data)
        setProdutos(produtosResult.data)
        setVendas(vendasResult.data)
      }

      setCarregando(false)
    }

    buscarDados()
  }, [])

  const produtoSelecionado = produtos.find(
    (produto) => produto.id === produtoId
  )

  const valorTotal = produtoSelecionado
    ? Number(produtoSelecionado.preco) * Number(quantidade)
    : 0

  // Atualizar dados da tela depois de uma venda
  async function atualizarDados() {
    const [produtosResult, vendasResult] = await Promise.all([
      supabase
        .from('produtos')
        .select('*')
        .order('created_at', { ascending: false }),

      supabase
        .from('vendas')
        .select('*')
        .order('data', { ascending: false })
    ])

    if (produtosResult.error || vendasResult.error) {
      console.error(
        'Erro ao atualizar dados:',
        produtosResult.error?.message,
        vendasResult.error?.message
      )

      alert('A venda foi registrada, mas não foi possível atualizar a tela.')
      return
    }

    setProdutos(produtosResult.data)
    setVendas(vendasResult.data)
  }

  // Limpar formulário
  function limparFormulario() {
    setClienteId('')
    setProdutoId('')
    setQuantidade(1)
    setMostrarFormulario(false)
  }

  // Registrar venda
  async function cadastrarVenda(e) {
    e.preventDefault()

    if (salvando) return

    const cliente = clientes.find(
      (item) => item.id === clienteId
    )

    const produto = produtos.find(
      (item) => item.id === produtoId
    )

    if (!cliente || !produto) {
      alert('Selecione um cliente e um produto.')
      return
    }

    const quantidadeVendida = Number(quantidade)

    if (
      !Number.isInteger(quantidadeVendida) ||
      quantidadeVendida <= 0
    ) {
      alert('Informe uma quantidade válida.')
      return
    }

    if (quantidadeVendida > Number(produto.estoque)) {
      alert('Estoque insuficiente para essa venda.')
      return
    }

    setSalvando(true)

    const { data, error } = await supabase.rpc('registrar_venda', {
      p_cliente_id: clienteId,
      p_produto_id: produtoId,
      p_quantidade: quantidadeVendida
    })

    if (error) {
      console.error('Erro ao registrar venda:', error.message)
      alert(error.message || 'Não foi possível registrar a venda.')
      setSalvando(false)
      return
    }

    console.log('Venda registrada:', data)

    await atualizarDados()

    limparFormulario()
    setSalvando(false)
  }

  // Filtrar vendas
  const vendasFiltradas = vendas.filter((venda) =>
    `${venda.cliente_nome} ${venda.produto_nome}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  )

  // Calcular faturamento
  const faturamento = vendas.reduce(
    (total, venda) => total + Number(venda.valor_total),
    0
  )

  // Formatar valores
  const formatarMoeda = (valor) =>
    Number(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="dashboard-content clients-page">
          <div className="clients-heading">
            <div>
              <span className="clients-eyebrow">GESTÃO DO NEGÓCIO</span>
              <h2>Vendas</h2>
              <p>Registre vendas e acompanhe suas movimentações.</p>
            </div>

            <button
              className="clients-primary-button"
              onClick={() => setMostrarFormulario(true)}
              disabled={clientes.length === 0 || produtos.length === 0}
            >
              <Plus size={18} />
              Nova venda
            </button>
          </div>

          <div className="products-summary-grid">
            <div className="clients-summary">
              <div className="clients-summary-icon">
                <ShoppingCart size={22} />
              </div>
              <div>
                <span>Total de vendas</span>
                <strong>{vendas.length}</strong>
              </div>
            </div>

            <div className="clients-summary">
              <div className="clients-summary-icon">
                <DollarSign size={22} />
              </div>
              <div>
                <span>Faturamento registrado</span>
                <strong>{formatarMoeda(faturamento)}</strong>
              </div>
            </div>
          </div>

          <section className="dashboard-panel clients-panel">
            <div className="clients-toolbar">
              <div>
                <h3>Histórico de vendas</h3>
                <p>Consulte as vendas realizadas.</p>
              </div>

              <div className="clients-search">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Buscar venda..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
            </div>

            {carregando ? (
              <div className="clients-empty">
                <p>Carregando vendas...</p>
              </div>
            ) : vendasFiltradas.length === 0 ? (
              <div className="clients-empty">
                <div className="clients-empty-icon">
                  <ClipboardList size={28} />
                </div>

                <h3>
                  {busca
                    ? 'Nenhuma venda encontrada'
                    : 'Nenhuma venda registrada'}
                </h3>

                <p>
                  {busca
                    ? 'Tente buscar por outro cliente ou produto.'
                    : 'As vendas registradas aparecerão aqui.'}
                </p>
              </div>
            ) : (
              <div className="clients-table-wrapper">
                <table className="clients-table">
                  <thead>
                    <tr>
                      <th>CLIENTE</th>
                      <th>PRODUTO</th>
                      <th>QUANTIDADE</th>
                      <th>DATA</th>
                      <th>VALOR TOTAL</th>
                    </tr>
                  </thead>

                  <tbody>
                    {vendasFiltradas.map((venda) => (
                      <tr key={venda.id}>
                        <td>
                          <strong>{venda.cliente_nome}</strong>
                        </td>

                        <td>{venda.produto_nome}</td>

                        <td>{venda.quantidade}</td>

                        <td>
                          {new Date(venda.data).toLocaleDateString('pt-BR')}
                        </td>

                        <td>
                          <strong>
                            {formatarMoeda(venda.valor_total)}
                          </strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="clients-footer">
              Exibindo {vendasFiltradas.length} de {vendas.length} vendas
            </div>
          </section>
        </section>
      </main>

      {mostrarFormulario && (
        <div className="client-modal-overlay">
          <div className="client-modal">
            <div className="client-modal-header">
              <div>
                <span className="clients-eyebrow">MOVIMENTAÇÃO</span>
                <h2>Nova venda</h2>
                <p>Preencha os dados da venda.</p>
              </div>

              <button
                className="client-modal-close"
                onClick={limparFormulario}
                disabled={salvando}
              >
                <X size={20} />
              </button>
            </div>

            <form className="client-form" onSubmit={cadastrarVenda}>
              <label className="sale-full-field">
                Cliente
                <select
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  required
                >
                  <option value="">Selecione um cliente</option>

                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label className="sale-full-field">
                Produto
                <select
                  value={produtoId}
                  onChange={(e) => setProdutoId(e.target.value)}
                  required
                >
                  <option value="">Selecione um produto</option>

                  {produtos.map((produto) => (
                    <option
                      key={produto.id}
                      value={produto.id}
                      disabled={produto.estoque <= 0}
                    >
                      {produto.nome} — Estoque: {produto.estoque}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Quantidade
                <input
                  type="number"
                  min="1"
                  max={produtoSelecionado?.estoque || undefined}
                  step="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  required
                />
              </label>

              <div className="sale-total-preview">
                <span>Valor total da venda</span>
                <strong>{formatarMoeda(valorTotal)}</strong>
              </div>

              <div className="client-form-actions">
                <button
                  type="button"
                  className="client-cancel-button"
                  onClick={limparFormulario}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="clients-primary-button"
                  disabled={salvando}
                >
                  {salvando ? 'Registrando...' : 'Registrar venda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Vendas
