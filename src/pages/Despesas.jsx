
import { useEffect, useState } from 'react'

import {
  Wallet,
  Plus,
  Search,
  X,
  Pencil,
  Trash2
} from 'lucide-react'

import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

function Despesas() {
  const [despesas, setDespesas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [busca, setBusca] = useState('')
  const [editandoId, setEditandoId] = useState(null)

  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState('')
  const [valor, setValor] = useState('')
  const [data, setData] = useState(
    new Date().toLocaleDateString('en-CA')
  )

  // Buscar despesas no Supabase
  useEffect(() => {
    async function buscarDespesas() {
      const { data, error } = await supabase
        .from('despesas')
        .select('*')
        .order('data', { ascending: false })

      if (error) {
        console.error('Erro ao buscar despesas:', error.message)
        alert('Não foi possível carregar as despesas.')
      } else {
        setDespesas(data)
      }

      setCarregando(false)
    }

    buscarDespesas()
  }, [])

  // Calcular total das despesas
  const totalDespesas = despesas.reduce(
    (total, despesa) => total + Number(despesa.valor),
    0
  )

  // Filtrar despesas
  const despesasFiltradas = despesas.filter(despesa =>
    `${despesa.descricao} ${despesa.categoria}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  )

  // Formatar moeda
  const formatarMoeda = valor =>
    Number(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })

  // Limpar formulário
  function limparFormulario() {
    setDescricao('')
    setCategoria('')
    setValor('')
    setData(new Date().toLocaleDateString('en-CA'))
    setEditandoId(null)
    setMostrarFormulario(false)
  }

  // Cadastrar ou atualizar despesa
  async function cadastrarDespesa(e) {
    e.preventDefault()

    if (salvando) return

    if (
      !descricao.trim() ||
      !categoria ||
      !valor ||
      Number(valor) <= 0 ||
      !Number.isFinite(Number(valor))
    ) {
      alert('Preencha todos os campos corretamente.')
      return
    }

    setSalvando(true)

    const dadosDespesa = {
      descricao: descricao.trim(),
      categoria,
      valor: Number(valor),
      data
    }

    if (editandoId) {
      const { data: atualizada, error } = await supabase
        .from('despesas')
        .update(dadosDespesa)
        .eq('id', editandoId)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar despesa:', error.message)
        alert('Não foi possível atualizar a despesa.')
        setSalvando(false)
        return
      }

      setDespesas(lista =>
        lista.map(despesa =>
          despesa.id === editandoId ? atualizada : despesa
        )
      )
    } else {
      const { data: { user }, error: userError } =
        await supabase.auth.getUser()

      if (userError || !user) {
        alert('Sua sessão expirou. Faça login novamente.')
        setSalvando(false)
        return
      }

      const { data: novaDespesa, error } = await supabase
        .from('despesas')
        .insert({
          ...dadosDespesa,
          user_id: user.id
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao cadastrar despesa:', error.message)
        alert('Não foi possível cadastrar a despesa.')
        setSalvando(false)
        return
      }

      setDespesas(lista => [novaDespesa, ...lista])
    }

    limparFormulario()
    setSalvando(false)
  }

  // Editar despesa
  function editarDespesa(despesa) {
    setDescricao(despesa.descricao)
    setCategoria(despesa.categoria)
    setValor(String(despesa.valor))
    setData(despesa.data)
    setEditandoId(despesa.id)
    setMostrarFormulario(true)
  }

  // Excluir despesa
  async function excluirDespesa(id) {
    const confirmar = window.confirm(
      'Deseja realmente excluir esta despesa?'
    )

    if (!confirmar) return

    const { error } = await supabase
      .from('despesas')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir despesa:', error.message)
      alert('Não foi possível excluir a despesa.')
      return
    }

    setDespesas(lista =>
      lista.filter(despesa => despesa.id !== id)
    )
  }

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="dashboard-content">
          <div className="clients-heading">
            <div>
              <span className="clients-eyebrow">CONTROLE FINANCEIRO</span>
              <h1>Despesas</h1>
              <p>Gerencie os gastos do seu negócio.</p>
            </div>

            <button
              className="clients-primary-button"
              onClick={() => setMostrarFormulario(true)}
            >
              <Plus size={17} />
              Nova despesa
            </button>
          </div>

          <div className="clients-summary">
            <div className="summary-icon">
              <Wallet size={20} />
            </div>
            <span>Total de despesas</span>
            <strong>{formatarMoeda(totalDespesas)}</strong>
          </div>

          <div className="clients-panel">
            <div className="clients-toolbar">
              <div className="clients-search">
                <Search size={17} />
                <input
                  type="text"
                  placeholder="Buscar despesa ou categoria..."
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                />
              </div>
            </div>

            {carregando ? (
              <div className="clients-empty">
                <p>Carregando despesas...</p>
              </div>
            ) : despesasFiltradas.length === 0 ? (
              <div className="clients-empty">
                <Wallet size={38} />
                <h3>
                  {busca
                    ? 'Nenhuma despesa encontrada'
                    : 'Nenhuma despesa cadastrada'}
                </h3>
                <p>
                  {busca
                    ? 'Tente pesquisar por outra descrição ou categoria.'
                    : 'Cadastre sua primeira despesa para começar.'}
                </p>
              </div>
            ) : (
              <div className="clients-table-wrapper">
                <table className="clients-table">
                  <thead>
                    <tr>
                      <th>DESCRIÇÃO</th>
                      <th>CATEGORIA</th>
                      <th>DATA</th>
                      <th>VALOR</th>
                      <th>AÇÕES</th>
                    </tr>
                  </thead>

                  <tbody>
                    {despesasFiltradas.map(despesa => (
                      <tr key={despesa.id}>
                        <td>
                          <div className="client-name-cell">
                            <div className="client-avatar">
                              <Wallet size={17} />
                            </div>
                            <strong>{despesa.descricao}</strong>
                          </div>
                        </td>

                        <td>
                          <span className="client-company">
                            {despesa.categoria}
                          </span>
                        </td>

                        <td>
                          {new Date(
                            `${despesa.data}T12:00:00`
                          ).toLocaleDateString('pt-BR')}
                        </td>

                        <td>
                          <strong className="expense-table-value">
                            {formatarMoeda(despesa.valor)}
                          </strong>
                        </td>

                        <td>
                          <div className="client-actions">
                            <button
                              onClick={() => editarDespesa(despesa)}
                              title="Editar despesa"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              onClick={() => excluirDespesa(despesa.id)}
                              title="Excluir despesa"
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
              Exibindo {despesasFiltradas.length} de {despesas.length} despesas
            </div>
          </div>
        </section>
      </main>

      {mostrarFormulario && (
        <div className="client-modal-overlay">
          <div className="client-modal">
            <div className="client-modal-header">
              <div>
                <h2>{editandoId ? 'Editar despesa' : 'Nova despesa'}</h2>
                <p>Informe os dados da despesa.</p>
              </div>

              <button
                className="client-modal-close"
                onClick={limparFormulario}
                disabled={salvando}
              >
                <X size={20} />
              </button>
            </div>

            <form className="client-form" onSubmit={cadastrarDespesa}>
              <div className="client-form-group">
                <label>Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Compra de materiais"
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  required
                />
              </div>

              <div className="client-form-group">
                <label>Categoria</label>
                <select
                  value={categoria}
                  onChange={e => setCategoria(e.target.value)}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="Materiais">Materiais</option>
                  <option value="Aluguel">Aluguel</option>
                  <option value="Funcionários">Funcionários</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Contas">Contas</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div className="client-form-group">
                <label>Valor (R$)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0,00"
                  value={valor}
                  onChange={e => setValor(e.target.value)}
                  required
                />
              </div>

              <div className="client-form-group">
                <label>Data da despesa</label>
                <input
                  type="date"
                  value={data}
                  onChange={e => setData(e.target.value)}
                  required
                />
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
                  {salvando
                    ? 'Salvando...'
                    : editandoId
                      ? 'Salvar alterações'
                      : 'Cadastrar despesa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Despesas
