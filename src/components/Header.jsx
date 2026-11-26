

import { useEffect, useState } from 'react'
import {
  Search,
  Bell,
  ChevronDown,
  Package,
  ShoppingCart,
  Wallet,
  User,
  CheckCheck
} from 'lucide-react'

import { supabase } from '../lib/supabase'

function Header() {
  const [usuario, setUsuario] = useState(null)
  const [notificacoes, setNotificacoes] = useState([])
  const [idsLidas, setIdsLidas] = useState([])
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false)
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false)
  const [carregandoNotificacoes, setCarregandoNotificacoes] = useState(true)

  useEffect(() => {
    async function carregarCabecalho() {
      const { data: dadosUsuario, error: erroUsuario } =
        await supabase.auth.getUser()

      if (erroUsuario) {
        console.error('Erro ao carregar usuário:', erroUsuario.message)
      } else {
        const usuarioAtual = dadosUsuario.user
        setUsuario(usuarioAtual)

        if (usuarioAtual) {
          const chaveLidas = `nexus-notificacoes-lidas-${usuarioAtual.id}`

          try {
            const salvas = JSON.parse(localStorage.getItem(chaveLidas) || '[]')
            setIdsLidas(Array.isArray(salvas) ? salvas : [])
          } catch {
            setIdsLidas([])
          }
        }
      }

      const [resultadoProdutos, resultadoVendas, resultadoDespesas] =
        await Promise.all([
          supabase
            .from('produtos')
            .select('id, nome, estoque')
            .lte('estoque', 5)
            .order('estoque', { ascending: true })
            .limit(5),

          supabase
            .from('vendas')
            .select('id, produto_nome, valor_total, data')
            .order('data', { ascending: false })
            .limit(3),

          supabase
            .from('despesas')
            .select('id, descricao, valor, data')
            .order('data', { ascending: false })
            .limit(3)
        ])

      if (resultadoProdutos.error) {
        console.error('Erro ao buscar estoque:', resultadoProdutos.error.message)
      }

      if (resultadoVendas.error) {
        console.error('Erro ao buscar vendas:', resultadoVendas.error.message)
      }

      if (resultadoDespesas.error) {
        console.error('Erro ao buscar despesas:', resultadoDespesas.error.message)
      }

      const estoqueBaixo = (resultadoProdutos.data || []).map(produto => ({
        id: `produto-${produto.id}-${produto.estoque}`,
        tipo: 'estoque',
        titulo: 'Estoque baixo',
        descricao: `${produto.nome} — ${produto.estoque} unidade(s)`,
        data: null
      }))

      const vendasRecentes = (resultadoVendas.data || []).map(venda => ({
        id: `venda-${venda.id}`,
        tipo: 'venda',
        titulo: 'Venda registrada',
        descricao: `${venda.produto_nome} — ${formatarMoeda(venda.valor_total)}`,
        data: venda.data
      }))

      const despesasRecentes = (resultadoDespesas.data || []).map(despesa => ({
        id: `despesa-${despesa.id}`,
        tipo: 'despesa',
        titulo: 'Despesa registrada',
        descricao: `${despesa.descricao} — ${formatarMoeda(despesa.valor)}`,
        data: despesa.data
      }))

      const todasNotificacoes = [
        ...estoqueBaixo,
        ...vendasRecentes,
        ...despesasRecentes
      ].sort((a, b) => {
        if (!a.data) return -1
        if (!b.data) return 1
        return new Date(b.data) - new Date(a.data)
      })

      setNotificacoes(todasNotificacoes)
      setCarregandoNotificacoes(false)
    }

    carregarCabecalho()
  }, [])

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  function obterNome() {
    return (
      usuario?.user_metadata?.nome ||
      usuario?.user_metadata?.responsavel ||
      usuario?.email?.split('@')[0] ||
      'Usuário'
    )
  }

  function obterIniciais(nome) {
    return nome
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(palavra => palavra[0])
      .join('')
      .toUpperCase()
  }

  function formatarData(data) {
    if (!data) return ''

    return new Date(data).toLocaleDateString('pt-BR')
  }

  function iconeNotificacao(tipo) {
    if (tipo === 'estoque') return <Package size={18} />
    if (tipo === 'venda') return <ShoppingCart size={18} />
    return <Wallet size={18} />
  }

  function marcarTodasComoLidas() {
    const novosIdsLidos = notificacoes.map(item => item.id)

    setIdsLidas(novosIdsLidos)

    if (usuario?.id) {
      const chaveLidas = `nexus-notificacoes-lidas-${usuario.id}`
      localStorage.setItem(chaveLidas, JSON.stringify(novosIdsLidos))
    }
  }

  const nome = obterNome()
  const quantidadeNaoLidas = notificacoes.filter(
    item => !idsLidas.includes(item.id)
  ).length

  return (
    <header className="header">
      <div className="header-title">
        <h1>Visão geral</h1>
        <p>Acompanhe o desempenho do seu negócio.</p>
      </div>

      <div className="header-actions">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Pesquisar..."
          />
        </div>

        <div className="header-dropdown-container">
          <button
            type="button"
            className="notification-button"
            onClick={() => {
              setNotificacoesAbertas(!notificacoesAbertas)
              setMenuPerfilAberto(false)
            }}
            aria-label={`Abrir notificações. ${quantidadeNaoLidas} não lidas`}
            aria-expanded={notificacoesAbertas}
          >
            <Bell size={20} />

            {quantidadeNaoLidas > 0 && (
              <span className="notification-count">
                {quantidadeNaoLidas > 99 ? '99+' : quantidadeNaoLidas}
              </span>
            )}
          </button>

          {notificacoesAbertas && (
            <div className="header-dropdown notification-dropdown">
              <div className="dropdown-heading">
                <strong>Notificações</strong>
                <span>{quantidadeNaoLidas} não lidas</span>
              </div>

              {quantidadeNaoLidas > 0 && (
                <button
                  type="button"
                  className="mark-read-button"
                  onClick={marcarTodasComoLidas}
                >
                  <CheckCheck size={16} />
                  Marcar todas como lidas
                </button>
              )}

              <div className="notification-list">
                {carregandoNotificacoes ? (
                  <p className="dropdown-empty">Carregando notificações...</p>
                ) : notificacoes.length === 0 ? (
                  <p className="dropdown-empty">
                    Nenhuma notificação no momento.
                  </p>
                ) : (
                  notificacoes.map(item => {
                    const lida = idsLidas.includes(item.id)

                    return (
                      <div
                        className={`notification-item ${lida ? 'lida' : 'nao-lida'}`}
                        key={item.id}
                      >
                        <div className={`notification-icon ${item.tipo}`}>
                          {iconeNotificacao(item.tipo)}
                        </div>

                        <div className="notification-content">
                          <strong>{item.titulo}</strong>
                          <p>{item.descricao}</p>
                          {item.data && (
                            <span>{formatarData(item.data)}</span>
                          )}
                        </div>

                        {!lida && (
                          <span className="unread-indicator"></span>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="header-dropdown-container">
          <button
            type="button"
            className="user-profile"
            onClick={() => {
              setMenuPerfilAberto(!menuPerfilAberto)
              setNotificacoesAbertas(false)
            }}
            aria-expanded={menuPerfilAberto}
          >
            <div className="user-avatar">
              {obterIniciais(nome)}
            </div>

            <div className="user-info">
              <strong>{nome}</strong>
              <span>Administrador</span>
            </div>

            <ChevronDown
              size={16}
              className={menuPerfilAberto ? 'chevron-open' : ''}
            />
          </button>

          {menuPerfilAberto && (
            <div className="header-dropdown profile-dropdown">
              <div className="profile-dropdown-heading">
                <div className="profile-dropdown-avatar">
                  {obterIniciais(nome)}
                </div>

                <div>
                  <strong>{nome}</strong>
                  <span>{usuario?.email || 'E-mail não disponível'}</span>
                </div>
              </div>

              <div className="profile-dropdown-info">
                <User size={16} />
                <span>Conta pessoal do NEXUS</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
