
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let ativo = true

    async function verificarSessao() {
      const { data, error } = await supabase.auth.getSession()

      if (ativo) {
        if (error) {
          console.error('Erro ao verificar sessão:', error.message)
        }

        setUsuario(data.session?.user ?? null)
        setCarregando(false)
      }
    }

    verificarSessao()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      setUsuario(sessao?.user ?? null)
      setCarregando(false)
    })

    return () => {
      ativo = false
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ usuario, carregando }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
