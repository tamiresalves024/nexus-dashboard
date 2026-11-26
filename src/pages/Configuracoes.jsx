
import { useEffect, useState } from 'react'

import {
  Save,
  Building2,
  User,
  Mail,
  Phone,
  Coins,
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  LogOut
} from 'lucide-react'

import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

function Configuracoes() {
  const navigate = useNavigate()

  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  const [usuario, setUsuario] = useState(null)

  const [configuracoes, setConfiguracoes] = useState({
    empresa: '',
    responsavel: '',
    email: '',
    telefone: '',
    moeda: 'BRL'
  })

  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  const [senhaAtualizada, setSenhaAtualizada] = useState(false)
  const [salvandoSenha, setSalvandoSenha] = useState(false)

  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')

  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false)

  // Buscar dados do usuário
  useEffect(() => {
    async function buscarUsuario() {
      const { data, error } = await supabase.auth.getUser()

      if (error || !data.user) {
        console.error('Erro ao buscar usuário:', error?.message)
        navigate('/login', { replace: true })
        return
      }

      const user = data.user
      setUsuario(user)

      const metadata = user.user_metadata || {}

      setConfiguracoes({
        empresa: metadata.empresa || '',
        responsavel: metadata.responsavel || metadata.nome || '',
        email: metadata.email_contato || '',
        telefone: metadata.telefone || '',
        moeda: metadata.moeda || 'BRL'
      })

      setCarregando(false)
    }

    buscarUsuario()
  }, [navigate])

  // Atualizar campos
  function atualizarCampo(e) {
    const { name, value } = e.target

    setConfiguracoes(prev => ({
      ...prev,
      [name]: value
    }))

    setMensagem('')
    setErro('')
  }

  // Salvar configurações da empresa
  async function salvarConfiguracoes(e) {
    e.preventDefault()

    if (salvando) return

    setSalvando(true)
    setMensagem('')
    setErro('')

    const { data, error } = await supabase.auth.updateUser({
      data: {
        empresa: configuracoes.empresa.trim(),
        responsavel: configuracoes.responsavel.trim(),
        email_contato: configuracoes.email.trim(),
        telefone: configuracoes.telefone.trim(),
        moeda: configuracoes.moeda
      }
    })

    if (error) {
      console.error('Erro ao salvar configurações:', error.message)
      setErro('Não foi possível salvar as configurações.')
    } else {
      setUsuario(data.user)
      setMensagem('Configurações salvas com sucesso!')
    }

    setSalvando(false)
  }

  // Alterar senha
  async function alterarSenha(e) {
    e.preventDefault()

    if (salvandoSenha) return

    setSenhaAtualizada(false)

    if (novaSenha.length < 6) {
      alert('A nova senha precisa ter pelo menos 6 caracteres.')
      return
    }

    if (novaSenha !== confirmarSenha) {
      alert('As senhas não são iguais.')
      return
    }

    setSalvandoSenha(true)

    const { error } = await supabase.auth.updateUser({
      password: novaSenha
    })

    if (error) {
      console.error('Erro ao alterar senha:', error.message)
      alert('Não foi possível alterar a senha: ' + error.message)
    } else {
      setNovaSenha('')
      setConfirmarSenha('')
      setSenhaAtualizada(true)
    }

    setSalvandoSenha(false)
  }

  // Sair da conta
  async function sairDaConta() {
    const confirmar = window.confirm(
      'Deseja realmente sair da sua conta?'
    )

    if (!confirmar) return

    const { error } = await supabase.auth.signOut()

    if (error) {
      alert('Não foi possível sair da conta.')
      return
    }

    navigate('/login', { replace: true })
  }

  if (carregando) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="main-content">
          <Header />
          <section className="dashboard-content">
            <p>Carregando configurações...</p>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="dashboard-content">

          {/* CABEÇALHO */}
          <div className="clients-heading">
            <div>
              <span className="clients-eyebrow">PERSONALIZAÇÃO</span>
              <h1>Configurações</h1>
              <p>Gerencie sua conta e as informações do seu negócio.</p>
            </div>
          </div>

          {/* INFORMAÇÕES DA EMPRESA */}
          <div className="clients-panel settings-panel">
            <div className="clients-panel-header">
              <div>
                <h2>Informações da empresa</h2>
                <p>Personalize os dados principais do seu negócio.</p>
              </div>

              <Building2 size={22} />
            </div>

            <form
              className="client-form settings-form"
              onSubmit={salvarConfiguracoes}
            >
              <div className="settings-field">
                <label>Nome da empresa</label>

                <div className="settings-input-wrapper">
                  <Building2 size={17} />

                  <input
                    type="text"
                    name="empresa"
                    value={configuracoes.empresa}
                    onChange={atualizarCampo}
                    placeholder="Ex: Minha Empresa"
                  />
                </div>
              </div>

              <div className="settings-field">
                <label>Nome do responsável</label>

                <div className="settings-input-wrapper">
                  <User size={17} />

                  <input
                    type="text"
                    name="responsavel"
                    value={configuracoes.responsavel}
                    onChange={atualizarCampo}
                    placeholder="Nome completo"
                  />
                </div>
              </div>

              <div className="settings-field">
                <label>E-mail de contato</label>

                <div className="settings-input-wrapper">
                  <Mail size={17} />

                  <input
                    type="email"
                    name="email"
                    value={configuracoes.email}
                    onChange={atualizarCampo}
                    placeholder="contato@empresa.com"
                  />
                </div>
              </div>

              <div className="settings-field">
                <label>Telefone</label>

                <div className="settings-input-wrapper">
                  <Phone size={17} />

                  <input
                    type="tel"
                    name="telefone"
                    value={configuracoes.telefone}
                    onChange={atualizarCampo}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="settings-field settings-full-field">
                <label>Moeda utilizada</label>

                <div className="settings-input-wrapper">
                  <Coins size={17} />

                  <select
                    name="moeda"
                    value={configuracoes.moeda}
                    onChange={atualizarCampo}
                  >
                    <option value="BRL">Real brasileiro (R$)</option>
                    <option value="USD">Dólar americano (US$)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
              </div>

              <div className="settings-form-footer">
                {mensagem && (
                  <span className="settings-success">
                    {mensagem}
                  </span>
                )}

                {erro && (
                  <span className="settings-success">
                    {erro}
                  </span>
                )}

                <button
                  type="submit"
                  className="clients-primary-button"
                  disabled={salvando}
                >
                  <Save size={16} />
                  {salvando ? 'Salvando...' : 'Salvar configurações'}
                </button>
              </div>
            </form>
          </div>

          {/* DADOS DA CONTA */}
          <div className="clients-panel settings-panel">
            <div className="clients-panel-header">
              <div>
                <h2>Minha conta</h2>
                <p>Informações de acesso ao NEXUS.</p>
              </div>

              <ShieldCheck size={22} />
            </div>

            <div className="client-form settings-form">
              <div className="settings-field settings-full-field">
                <label>E-mail de acesso</label>

                <div className="settings-input-wrapper">
                  <Mail size={17} />

                  <input
                    type="email"
                    value={usuario?.email || ''}
                    readOnly
                  />
                </div>

                <small>
                  Este é o e-mail utilizado para entrar no sistema.
                </small>
              </div>
            </div>
          </div>

          {/* SEGURANÇA */}
          <div className="clients-panel settings-panel">
            <div className="clients-panel-header">
              <div>
                <h2>Segurança</h2>
                <p>Atualize sua senha de acesso.</p>
              </div>

              <LockKeyhole size={22} />
            </div>

            <form
              className="client-form settings-form"
              onSubmit={alterarSenha}
            >
              <div className="settings-field">
                <label>Nova senha</label>

                <div className="settings-input-wrapper">
                  <LockKeyhole size={17} />

                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={novaSenha}
                    onChange={e => {
                      setNovaSenha(e.target.value)
                      setSenhaAtualizada(false)
                    }}
                    placeholder="Digite a nova senha"
                    minLength={6}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    aria-label="Mostrar ou ocultar senha"
                  >
                    {mostrarSenha
                      ? <EyeOff size={17} />
                      : <Eye size={17} />
                    }
                  </button>
                </div>
              </div>

              <div className="settings-field">
                <label>Confirmar nova senha</label>

                <div className="settings-input-wrapper">
                  <LockKeyhole size={17} />

                  <input
                    type={mostrarConfirmacao ? 'text' : 'password'}
                    value={confirmarSenha}
                    onChange={e => {
                      setConfirmarSenha(e.target.value)
                      setSenhaAtualizada(false)
                    }}
                    placeholder="Digite a senha novamente"
                    minLength={6}
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setMostrarConfirmacao(!mostrarConfirmacao)
                    }
                    aria-label="Mostrar ou ocultar confirmação"
                  >
                    {mostrarConfirmacao
                      ? <EyeOff size={17} />
                      : <Eye size={17} />
                    }
                  </button>
                </div>
              </div>

              <div className="settings-form-footer">
                {senhaAtualizada && (
                  <span className="settings-success">
                    Senha alterada com sucesso!
                  </span>
                )}

                <button
                  type="submit"
                  className="clients-primary-button"
                  disabled={salvandoSenha}
                >
                  <LockKeyhole size={16} />
                  {salvandoSenha ? 'Atualizando...' : 'Alterar senha'}
                </button>
              </div>
            </form>
          </div>

          {/* SAIR DA CONTA */}
          <div className="clients-panel settings-panel">
            <div className="clients-panel-header">
              <div>
                <h2>Sessão</h2>
                <p>Encerre seu acesso ao sistema.</p>
              </div>

              <LogOut size={22} />
            </div>

            <button
              type="button"
              className="client-cancel-button"
              onClick={sairDaConta}
            >
              <LogOut size={16} />
              Sair da conta
            </button>
          </div>

        </section>
      </main>
    </div>
  )
}

export default Configuracoes
