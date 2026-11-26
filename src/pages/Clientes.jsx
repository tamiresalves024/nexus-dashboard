
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  Users,
  UserPlus,
  X,
  Search,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Building2
} from 'lucide-react'

import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

function Clientes() {
const [clientes, setClientes] = useState([])
const [carregando, setCarregando] = useState(true)

useEffect(() => {
  async function buscarClientes() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar clientes:', error.message)
      alert('Não foi possível carregar os clientes.')
    } else {
      setClientes(data)
    }

    setCarregando(false)
  }

  buscarClientes()
}, [])

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [clienteEditando, setClienteEditando] = useState(null)
  const [busca, setBusca] = useState('')

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [empresa, setEmpresa] = useState('')

  async function salvarClienteNoBanco(cliente) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    alert('Sua sessão expirou. Faça login novamente.')
    return false
  }

  const { error } = await supabase
    .from('clientes')
    .insert({
      ...cliente,
      user_id: user.id
    })

  if (error) {
    console.error('Erro ao salvar cliente:', error.message)
    alert('Não foi possível salvar o cliente.')
    return false
  }

  return true
}

  function limparFormulario() {
    setNome('')
    setEmail('')
    setTelefone('')
    setEmpresa('')
    setClienteEditando(null)
    setMostrarFormulario(false)
  }

  function abrirNovoCliente() {
    limparFormulario()
    setMostrarFormulario(true)
  }

  function editarCliente(cliente) {
    setClienteEditando(cliente)
    setNome(cliente.nome)
    setEmail(cliente.email)
    setTelefone(cliente.telefone)
    setEmpresa(cliente.empresa)
    setMostrarFormulario(true)
  }

  async function excluirCliente(id) {
  const confirmar = window.confirm('Deseja realmente excluir este cliente?')

  if (!confirmar) return

  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erro ao excluir cliente:', error.message)
    alert('Não foi possível excluir o cliente.')
    return
  }

  setClientes((lista) =>
    lista.filter((cliente) => cliente.id !== id)
  )
}

  async function cadastrarCliente(e) {
  e.preventDefault()

  if (clienteEditando) {
    const { error } = await supabase
      .from('clientes')
      .update({
        nome,
        email,
        telefone,
        empresa
      })
      .eq('id', clienteEditando.id)

    if (error) {
      console.error('Erro ao atualizar cliente:', error.message)
      alert('Não foi possível atualizar o cliente.')
      return
    }

    setClientes((lista) =>
      lista.map((cliente) =>
        cliente.id === clienteEditando.id
          ? { ...cliente, nome, email, telefone, empresa }
          : cliente
      )
    )
  } else {
    const sucesso = await salvarClienteNoBanco({
      nome,
      email,
      telefone,
      empresa
    })

    if (!sucesso) return

    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao atualizar lista:', error.message)
    } else {
      setClientes(data)
    }
  }

  limparFormulario()
}

  const clientesFiltrados = clientes.filter((cliente) =>
    `${cliente.nome} ${cliente.email} ${cliente.empresa}`
      .toLowerCase()
      .includes(busca.toLowerCase())
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
              <h2>Clientes</h2>
              <p>Gerencie seus contatos e mantenha tudo organizado.</p>
            </div>

            <button className="clients-primary-button" onClick={abrirNovoCliente}>
              <UserPlus size={18} />
              Novo cliente
            </button>
          </div>

          <div className="clients-summary">
            <div className="clients-summary-icon">
              <Users size={22} />
            </div>
            <div>
              <span>Total de clientes</span>
              <strong>{clientes.length}</strong>
            </div>
          </div>

          <section className="dashboard-panel clients-panel">
            <div className="clients-toolbar">
              <div>
                <h3>Todos os clientes</h3>
                <p>Visualize e gerencie seus cadastros.</p>
              </div>

              <div className="clients-search">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
            </div>

            {carregando ? (
  <div className="clients-empty">
    <p>Carregando clientes...</p>
  </div>
) : clientesFiltrados.length === 0 ? (
              <div className="clients-empty">
                <div className="clients-empty-icon">
                  <Users size={28} />
                </div>
                <h3>
                  {busca ? 'Nenhum resultado encontrado' : 'Nenhum cliente cadastrado'}
                </h3>
                <p>
                  {busca
                    ? 'Tente pesquisar usando outro nome ou empresa.'
                    : 'Seus clientes aparecerão aqui quando você fizer o primeiro cadastro.'}
                </p>
                {!busca && (
                  <button className="clients-primary-button" onClick={abrirNovoCliente}>
                    <UserPlus size={17} />
                    Cadastrar primeiro cliente
                  </button>
                )}
              </div>
            ) : (
              <div className="clients-table-wrapper">
                <table className="clients-table">
                  <thead>
                    <tr>
                      <th>CLIENTE</th>
                      <th>CONTATO</th>
                      <th>EMPRESA</th>
                      <th className="clients-actions-heading">AÇÕES</th>
                    </tr>
                  </thead>

                  <tbody>
                    {clientesFiltrados.map((cliente) => (
                      <tr key={cliente.id}>
                        <td>
                          <div className="client-name-cell">
                            <div className="client-avatar">
                              {cliente.nome.charAt(0).toUpperCase()}
                            </div>
                            <strong>{cliente.nome}</strong>
                          </div>
                        </td>

                        <td>
                          <div className="client-contact">
                            <span><Mail size={14} /> {cliente.email}</span>
                            <span><Phone size={14} /> {cliente.telefone}</span>
                          </div>
                        </td>

                        <td>
                          <span className="client-company">
                            <Building2 size={15} />
                            {cliente.empresa}
                          </span>
                        </td>

                        <td>
                          <div className="client-actions">
                            <button
                              className="client-edit-button"
                              onClick={() => editarCliente(cliente)}
                              title="Editar cliente"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              className="client-delete-button"
                              onClick={() => excluirCliente(cliente.id)}
                              title="Excluir cliente"
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
              Exibindo {clientesFiltrados.length} de {clientes.length} clientes
            </div>
          </section>
        </section>
      </main>

      {mostrarFormulario && (
        <div className="client-modal-overlay">
          <div className="client-modal">
            <div className="client-modal-header">
              <div>
                <span className="clients-eyebrow">CADASTRO</span>
                <h2>{clienteEditando ? 'Editar cliente' : 'Novo cliente'}</h2>
                <p>Preencha as informações abaixo.</p>
              </div>

              <button className="client-modal-close" onClick={limparFormulario}>
                <X size={20} />
              </button>
            </div>

            <form className="client-form" onSubmit={cadastrarCliente}>
              <label>
                Nome completo
                <input
                  type="text"
                  placeholder="Ex.: Maria Oliveira"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </label>

              <label>
                E-mail
                <input
                  type="email"
                  placeholder="maria@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <label>
                Telefone
                <input
                  type="text"
                  placeholder="(00) 00000-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  required
                />
              </label>

              <label>
                Empresa
                <input
                  type="text"
                  placeholder="Nome da empresa"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  required
                />
              </label>

              <div className="client-form-actions">
                <button type="button" className="client-cancel-button" onClick={limparFormulario}>
                  Cancelar
                </button>
                <button type="submit" className="clients-primary-button">
                  {clienteEditando ? 'Salvar alterações' : 'Salvar cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Clientes
