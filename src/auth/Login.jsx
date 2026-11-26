

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'

import { supabase } from '../lib/supabase'

function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [tipoMensagem, setTipoMensagem] = useState('')

  const navigate = useNavigate()

  async function entrar(e) {
    e.preventDefault()
    setMensagem('')
    setTipoMensagem('')

    if (!email.trim() || !senha) {
      setMensagem('Preencha todos os campos.')
      setTipoMensagem('erro')
      return
    }

    try {
      setCarregando(true)

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha
      })

      if (error) {
        throw error
      }

      navigate('/')
    } catch (error) {
      setMensagem(
        error.message || 'Não foi possível entrar. Tente novamente.'
      )
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
          <h2>Bem-vindo de volta!</h2>
          <p>Acesse sua conta para continuar.</p>
        </div>

        <form onSubmit={entrar} className="auth-form">
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
                placeholder="Digite sua senha"
                value={senha}
                onChange={e => setSenha(e.target.value)}
              />

              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={carregando}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
            {!carregando && <LogIn size={18} />}
          </button>
        </form>

        {mensagem && (
          <p className={`auth-message ${tipoMensagem}`}>
            {mensagem}
          </p>
        )}

        <p className="auth-switch">
          Ainda não tem uma conta?
          <Link to="/cadastro"> Criar conta</Link>
        </p>

        <p className="auth-footer">
          © 2026 NEXUS. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}

export default Login
