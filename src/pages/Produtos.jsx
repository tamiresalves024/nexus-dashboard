

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

import {
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  DollarSign,
  Boxes
} from 'lucide-react'

import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

function Produtos() {
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [produtoEditando, setProdutoEditando] = useState(null)
  const [busca, setBusca] = useState('')

  const [nome, setNome] = useState('')
  const [categoria, setCategoria] = useState('')
  const [preco, setPreco] = useState('')
  const [estoque, setEstoque] = useState('')

  // Buscar produtos no Supabase
  useEffect(() => {
    async function buscarProdutos() {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar produtos:', error.message)
        alert('Não foi possível carregar os produtos.')
      } else {
        setProdutos(data)
      }

      setCarregando(false)
    }

    buscarProdutos()
  }, [])

  // Salvar produto no Supabase
  async function salvarProdutoNoBanco(produto) {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert('Sua sessão expirou. Faça login novamente.')
      return false
    }

    const { error } = await supabase
      .from('produtos')
      .insert({
        ...produto,
        user_id: user.id
      })

    if (error) {
      console.error('Erro ao salvar produto:', error.message)
      alert('Não foi possível salvar o produto.')
      return false
    }

    return true
  }

  // Limpar formulário
  function limparFormulario() {
    setNome('')
    setCategoria('')
    setPreco('')
    setEstoque('')
    setProdutoEditando(null)
    setMostrarFormulario(false)
  }

  // Abrir novo produto
  function abrirNovoProduto() {
    limparFormulario()
    setMostrarFormulario(true)
  }

  // Editar produto
  function editarProduto(produto) {
    setProdutoEditando(produto)
    setNome(produto.nome)
    setCategoria(produto.categoria)
    setPreco(produto.preco)
    setEstoque(produto.estoque)
    setMostrarFormulario(true)
  }

  // Excluir produto
  async function excluirProduto(id) {
    const confirmar = window.confirm(
      'Deseja realmente excluir este produto?'
    )

    if (!confirmar) return

    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir produto:', error.message)
      alert('Não foi possível excluir o produto.')
      return
    }

    setProdutos((lista) =>
      lista.filter((produto) => produto.id !== id)
    )
  }

  // Cadastrar ou atualizar produto
  async function cadastrarProduto(e) {
    e.preventDefault()

    const dadosProduto = {
      nome,
      categoria,
      preco: Number(preco),
      estoque: Number(estoque)
    }

    if (produtoEditando) {
      const { error } = await supabase
        .from('produtos')
        .update(dadosProduto)
        .eq('id', produtoEditando.id)

      if (error) {
        console.error('Erro ao atualizar produto:', error.message)
        alert('Não foi possível atualizar o produto.')
        return
      }

      setProdutos((lista) =>
        lista.map((produto) =>
          produto.id === produtoEditando.id
            ? { ...produto, ...dadosProduto }
            : produto
        )
      )
    } else {
      const sucesso = await salvarProdutoNoBanco(dadosProduto)

      if (!sucesso) return

      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao atualizar lista:', error.message)
      } else {
        setProdutos(data)
      }
    }

    limparFormulario()
  }

  // Pesquisa de produtos
  const produtosFiltrados = produtos.filter((produto) =>
    `${produto.nome} ${produto.categoria}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  )

  // Valor total do estoque
  const valorEstoque = produtos.reduce(
    (total, produto) =>
      total + Number(produto.preco) * Number(produto.estoque),
    0
  )

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="dashboard-content clients-page">
          <div className="clients-heading">
            <div>
              <span className="clients-eyebrow">GESTÃO DO NEGÓCIO</span>
              <h2>Produtos</h2>
              <p>Gerencie seu catálogo, preços e estoque.</p>
            </div>

            <button
              className="clients-primary-button"
              onClick={abrirNovoProduto}
            >
              <Plus size={18} />
              Novo produto
            </button>
          </div>

          <div className="products-summary-grid">
            <div className="clients-summary">
              <div className="clients-summary-icon">
                <Package size={22} />
              </div>
              <div>
                <span>Total de produtos</span>
                <strong>{produtos.length}</strong>
              </div>
            </div>

            <div className="clients-summary">
              <div className="clients-summary-icon">
                <Boxes size={22} />
              </div>
              <div>
                <span>Unidades em estoque</span>
                <strong>
                  {produtos.reduce(
                    (total, produto) => total + Number(produto.estoque),
                    0
                  )}
                </strong>
              </div>
            </div>

            <div className="clients-summary">
              <div className="clients-summary-icon">
                <DollarSign size={22} />
              </div>
              <div>
                <span>Valor em estoque</span>
                <strong>
                  {valorEstoque.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </strong>
              </div>
            </div>
          </div>

          <section className="dashboard-panel clients-panel">
            <div className="clients-toolbar">
              <div>
                <h3>Todos os produtos</h3>
                <p>Visualize e gerencie seu catálogo.</p>
              </div>

              <div className="clients-search">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Buscar produto..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
            </div>

            {carregando ? (
              <div className="clients-empty">
                <p>Carregando produtos...</p>
              </div>
            ) : produtosFiltrados.length === 0 ? (
              <div className="clients-empty">
                <div className="clients-empty-icon">
                  <Package size={28} />
                </div>

                <h3>
                  {busca
                    ? 'Nenhum resultado encontrado'
                    : 'Nenhum produto cadastrado'}
                </h3>

                <p>
                  {busca
                    ? 'Tente pesquisar usando outro nome ou categoria.'
                    : 'Seus produtos aparecerão aqui quando você fizer o primeiro cadastro.'}
                </p>

                {!busca && (
                  <button
                    className="clients-primary-button"
                    onClick={abrirNovoProduto}
                  >
                    <Plus size={17} />
                    Cadastrar primeiro produto
                  </button>
                )}
              </div>
            ) : (
              <div className="clients-table-wrapper">
                <table className="clients-table">
                  <thead>
                    <tr>
                      <th>PRODUTO</th>
                      <th>CATEGORIA</th>
                      <th>PREÇO</th>
                      <th>ESTOQUE</th>
                      <th className="clients-actions-heading">AÇÕES</th>
                    </tr>
                  </thead>

                  <tbody>
                    {produtosFiltrados.map((produto) => (
                      <tr key={produto.id}>
                        <td>
                          <div className="client-name-cell">
                            <div className="client-avatar">
                              <Package size={17} />
                            </div>
                            <strong>{produto.nome}</strong>
                          </div>
                        </td>

                        <td>{produto.categoria}</td>

                        <td>
                          {Number(produto.preco).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          })}
                        </td>

                        <td>
                          <span
                            className={
                              produto.estoque <= 5
                                ? 'stock-low'
                                : 'stock-normal'
                            }
                          >
                            {produto.estoque} unidades
                          </span>
                        </td>

                        <td>
                          <div className="client-actions">
                            <button
                              className="client-edit-button"
                              onClick={() => editarProduto(produto)}
                              title="Editar produto"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              className="client-delete-button"
                              onClick={() => excluirProduto(produto.id)}
                              title="Excluir produto"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="clients-footer">
              Exibindo {produtosFiltrados.length} de {produtos.length} produtos
            </div>
          </section>
        </section>
      </main>

      {mostrarFormulario && (
        <div className="client-modal-overlay">
          <div className="client-modal">
            <div className="client-modal-header">
              <div>
                <span className="clients-eyebrow">CATÁLOGO</span>
                <h2>
                  {produtoEditando ? 'Editar produto' : 'Novo produto'}
                </h2>
                <p>Preencha as informações do produto.</p>
              </div>

              <button
                className="client-modal-close"
                onClick={limparFormulario}
              >
                <X size={20} />
              </button>
            </div>

            <form className="client-form" onSubmit={cadastrarProduto}>
              <label>
                Nome do produto
                <input
                  type="text"
                  placeholder="Ex.: Camiseta básica"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </label>

              <label>
                Categoria
                <input
                  type="text"
                  placeholder="Ex.: Vestuário"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  required
                />
              </label>

              <label>
                Preço (R$)
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Ex.: 59.90"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  required
                />
              </label>

              <label>
                Quantidade em estoque
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Ex.: 20"
                  value={estoque}
                  onChange={(e) => setEstoque(e.target.value)}
                  required
                />
              </label>

              <div className="client-form-actions">
                <button
                  type="button"
                  className="client-cancel-button"
                  onClick={limparFormulario}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="clients-primary-button"
                >
                  {produtoEditando
                    ? 'Salvar alterações'
                    : 'Salvar produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Produtos
