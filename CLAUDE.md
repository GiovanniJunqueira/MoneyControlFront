# Contexto do projeto — Financeiro Web

Frontend do sistema de controle financeiro pessoal. Consome a API em `financeiro-api` (projeto irmão, Spring Boot). Este arquivo dá contexto rápido ao Claude Code sobre decisões já tomadas.

## Stack e por quê

- **React 18 + TypeScript + Vite** — escolhido por ser o mais pedido em vagas (decisão do usuário, mesmo raciocínio do backend em Java).
- **TailwindCSS**, mas com **tokens de design customizados** — ver seção de conceito visual abaixo, é importante não voltar pro Tailwind "padrão" (cinza/azul, cards com sombra).
- **React Router** pra navegação, **Axios** com interceptor de JWT.
- **Sem gerenciador de estado global** (Redux/Zustand) — o app é simples o suficiente pra `useState`/`useCallback` local em cada página + `AuthContext` pra sessão. Se o app crescer bastante, reavaliar.

## Conceito visual: "livro-caixa analógico" (não é genérico, é proposital)

Definido deliberadamente pra fugir do visual de dashboard SaaS genérico (cards brancos com sombra cinza, tudo arredondado). A metáfora é um livro-caixa/extrato físico:

- **Cores** (em `tailwind.config.js`): papel `#EFEBE2`, tinta `#1C2B33`, verde-cédula `#2F5233` (positivo), terracota-queimado `#8B3A2B` (dívida/pendente), âmbar `#C98A2C` (parcial)
- **Tipografia**: `Fraunces` (serifada, títulos) + `IBM Plex Mono` (todo valor monetário — números tabulares) + `IBM Plex Sans` (resto da UI). Ver `index.html` pro import das fontes via Google Fonts.
- **Layout**: linhas finas separando lançamentos (`.ledger-row` em `index.css`) ao invés de cards com sombra. Números sempre alinhados à direita, com classe `.num` (font-mono tabular-nums).

**Se for adicionar uma tela nova, seguir esse padrão** — não introduzir cards brancos com `shadow-md` genéricos pra listas de dados; usar o padrão de linha de registro (`ledger-row`).

## Decisões de produto (espelham o backend)

1. Gastos e Devedores são módulos independentes, cada um com seu próprio período fiscal (dia de fechamento configurável).
2. Categorias são customizáveis (nome + cor) — sem seed fixo.
3. Dívidas têm 3 status (`pendente`/`parcial`/`quitado`) com cores próprias (ver `STATUS_CLASS` em `DevedorDetailPage.tsx`).

## Estrutura

```
src/
  api/          # client.ts (axios + interceptor JWT), types.ts (espelha os DTOs do backend)
  context/      # AuthContext (login/registro/logout, hidrata via GET /auth/me)
  components/   # Sidebar, AppLayout, modais (Add*, Manage*, PeriodSettings), CategoryBar
  pages/        # Login, Register, Gastos, Devedores, DevedorDetail
  utils/        # format.ts (formatCurrency, formatDate — sempre pt-BR)
```

Padrão de página: cada página de dados busca tudo via `useCallback` + `useEffect`, guarda em `useState` local, e re-chama `load()` depois de qualquer mutação (criar/editar/excluir) ao invés de atualizar o estado otimisticamente. Simples e suficiente pro tamanho atual do app.

## Autenticação

Token JWT salvo em `localStorage` (`financeiro_token`). Interceptor do axios em `api/client.ts` injeta o header e redireciona pra `/login` em qualquer 401. `AuthContext` chama `GET /auth/me` no boot pra restaurar sessão.

## O que ainda falta (próximos passos conhecidos)

- [ ] Transformar em PWA de verdade (manifest + service worker via `vite-plugin-pwa`) pra dar pra "instalar" no celular
- [ ] Deploy no Vercel (decisão tomada; falta configurar `VITE_API_URL` no painel apontando pro Render e provisionar)
- [ ] Sem testes ainda

## Deploy (contexto do sistema como um todo)

Backend (`financeiro-api`) vai pro Render (free web service) com banco Postgres no Neon. Este frontend vai pro Vercel. O único ajuste necessário aqui é a env var `VITE_API_URL` apontando pra URL pública da API no Render — sem outras mudanças de código.

## Backend irmão

`financeiro-api` (Spring Boot). Os tipos em `src/api/types.ts` espelham manualmente os DTOs Java — se o backend mudar um response, atualizar aqui também. `VITE_API_URL` no `.env` aponta pra ele (default `http://localhost:8080`).
