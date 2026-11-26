
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus
} from 'lucide-react'

import { supabase } from '../lib/supabase'

function Cadastro() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [tipoMensagem, setTipoMensagem] = useState('')

  async function cadastrar(e) {
    e.preventDefault()

    setMensagem('')
    setTipoMensagem('')

    if (!nome.trim() || !email.trim() || !senha || !confirmarSenha) {
      setMensagem('Preencha todos os campos.')
      setTipoMensagem('erro')
      return
    }

    if (senha.length < 6) {
      setMensagem('A senha precisa ter pelo menos 6 caracteres.')
      setTipoMensagem('erro')
      return
    }

    if (senha !== confirmarSenha) {
      setMensagem('As senhas não são iguais.')
      setTipoMensagem('erro')
      return
    }

    try {
      setCarregando(true)

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
        options: {
          data: {
            nome: nome.trim()
          }
        }
      })

      if (error) {
        throw error
      }

      if (data.session) {
        setMensagem('Conta criada com sucesso! Você já pode acessar o Nexus.')
      } else {
        setMensagem('Conta criada! Verifique seu e-mail para confirmar o cadastro.')
      }

      setTipoMensagem('sucesso')

      setNome('')
      setEmail('')
      setSenha('')
      setConfirmarSenha('')

    } catch (error) {
      setMensagem(error.message || 'Não foi possível criar sua conta.')
      setTipoMensagem('erro')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">N</div>
          <h1>NEXUS</h1>
          <p>GESTÃO INTELIGENTE</p>
        </div>

        <div className="auth-heading">
          <h2>Crie sua conta</h2>
          <p>Preencha os dados para começar.</p>
        </div>

        <form onSubmit={cadastrar} className="auth-form">
          <div className="auth-field">
            <label>Nome completo</label>
            <div className="auth-input-wrapper">
              <User size={18} />
              <input
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={e => setNome(e.target.value)}
              />
            </div>
          </div>

          <div className="auth-field">
            <label>E-mail</label>
            <div className="auth-input-wrapper">
              <Mail size={18} />
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Senha</label>
            <div className="auth-input-wrapper">
              <Lock size={18} />
              <input
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Mínimo de 6 caracteres"
                value={senha}
                onChange={e => setSenha(e.target.value)}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setMostrarSenha(!mostrarSenha)}
              >
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="auth-field">
            <label>Confirmar senha</label>
            <div className="auth-input-wrapper">
              <Lock size={18} />
              <input
                type="password"
                placeholder="Digite a senha novamente"
                value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={carregando}
          >
            {carregando ? 'Criando conta...' : 'Criar conta'}
            {!carregando && <UserPlus size={18} />}
          </button>
        </form>

        {mensagem && (
          <p className={`auth-message ${tipoMensagem}`}>
            {mensagem}
          </p>
        )}

        <p className="auth-switch">
          Já possui uma conta?
          <Link to="/login"> Fazer login</Link>
        </p>

        <p className="auth-footer">
          © 2026 NEXUS. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}

export default Cadastro
