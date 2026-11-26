# NEXUS Dashboard

Sistema de gestão empresarial desenvolvido para pequenos negócios que desejam organizar suas operações, acompanhar resultados e ter mais controle sobre suas atividades.

🔗 **Aplicação online:** https://nexus-dashboard-dun-seven.vercel.app/

## Sobre o projeto

O NEXUS é uma aplicação web de gestão que centraliza informações importantes de um negócio em uma única plataforma.

O sistema permite administrar clientes, produtos, vendas e despesas, além de acompanhar indicadores financeiros e movimentações por meio de um dashboard intuitivo.

## Funcionalidades

- Dashboard com indicadores e gráficos.
- Cadastro, edição e exclusão de clientes.
- Gerenciamento de produtos e estoque.
- Registro de vendas com atualização automática do estoque.
- Controle de despesas.
- Relatórios financeiros e comerciais.
- Sistema de autenticação de usuários.
- Configurações de perfil e empresa.
- Notificações de estoque baixo.
- Isolamento dos dados por usuário.

## Tecnologias utilizadas

- React
- JavaScript
- Vite
- CSS
- React Router
- Supabase
- PostgreSQL
- Recharts
- Lucide React
- Vercel

## Segurança

O projeto utiliza autenticação do Supabase e Row Level Security (RLS) para controlar o acesso aos dados, garantindo que cada usuário visualize e gerencie apenas suas próprias informações.

## Execução local

Clone o repositório:

```bash
git clone https://github.com/tamiresalves024/nexus-dashboard.git
```

Entre na pasta:

```bash
cd nexus-dashboard
```

Instale as dependências:

```bash
npm install
```

Configure as variáveis de ambiente em um arquivo `.env`:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_publicavel
```

Inicie o projeto:

```bash
npm run dev
```

## Desenvolvido por

Projeto desenvolvido como parte da minha jornada de aprendizado em desenvolvimento Full Stack.

**Tecnologias, planejamento, implementação e integração desenvolvidos por mim.**(https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
