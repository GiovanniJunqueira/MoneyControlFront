# Contexto do projeto — Financeiro Web

Frontend do sistema de controle financeiro pessoal. Consome a API em `financeiro-api` (projeto irmão, Spring Boot). Este arquivo dá contexto rápido ao Claude Code sobre decisões já tomadas.

O usuário organiza os dados em **abas** (ex: uma por banco — BTG, Itaú...) — cada aba é uma cópia independente do sistema (categorias, gastos, devedores, período fiscal próprios). A tela inicial (`HomePage`) é um gráfico de rosca com uma fatia por aba (proporcional ao gasto do período) e "Visão Geral" clicável no centro, que soma todas as abas.

## Stack e por quê

- **React 18 + TypeScript + Vite** — escolhido por ser o mais pedido em vagas (decisão do usuário, mesmo raciocínio do backend em Java).
- **TailwindCSS**, com **tokens de design via CSS custom properties** (ver seção de conceito visual) — permite dark mode automático sem duplicar classes `dark:` em todo lugar.
- **React Router** pra navegação, **Axios** com interceptor de JWT.
- **Sem gerenciador de estado global** (Redux/Zustand) — o app é simples o suficiente pra `useState`/`useCallback` local em cada página + `AuthContext` pra sessão. Se o app crescer bastante, reavaliar.

## Conceito visual: estilo iOS Wallet/Health (trocado a pedido do usuário)

O conceito original era um "livro-caixa analógico" (papel, tinta, serifada Fraunces) — foi **descartado deliberadamente** a pedido do usuário, que queria algo "mais jovem, parecido com os layouts da Apple". Não reintroduzir o visual antigo (papel bege, Fraunces, `.ledger-row`) sem confirmar antes.

- **Cores** (`tailwind.config.js` + variáveis CSS em `index.css`): tokens `bg`/`surface`/`surface-soft`/`line`/`ink`/`ink-soft`/`accent`/`success`/`danger`/`warning` (+ variantes `-soft` pra fundos de pill/badge). Cada token é `rgb(var(--color-x) / <alpha-value>)`, com os valores das variáveis redefinidos em `:root.dark` — isso é o que permite o dark mode funcionar em toda a UI sem prefixo `dark:` espalhado pelo código.
- **Tipografia**: pilha de fonte do sistema Apple (`-apple-system, BlinkMacSystemFont`) com `Inter` (Google Fonts) como fallback pra quem não estiver no macOS/iOS. Sem serifada, sem monospace — números usam `.num` (tabular-nums + semibold na própria sans), não uma fonte separada.
- **Layout**: cards com `rounded-3xl` (`.card` em `index.css`), listas com `divide-line/70` dentro do card ao invés de bordas soltas, botões `rounded-full` (`.btn-primary`/`.btn-secondary`), modais como bottom-sheet no mobile (`rounded-t-3xl`) e centralizados no desktop.
- **Dark mode**: classe `.dark` na tag `<html>`, controlada por `ThemeContext` (`src/context/ThemeContext.tsx`), persistida em `localStorage` (`financeiro_theme`) e com um script inline no `index.html` que aplica a classe antes do React montar (evita flash do tema errado).
- **Ícones**: SVGs desenhados à mão em `src/components/icons.tsx` (sem dependência tipo lucide-react) — estilo de traço fino, arredondado, inspirado em SF Symbols.

**Se for adicionar uma tela nova, seguir esse padrão** — usar `.card`, os tokens de cor, e os ícones existentes; não introduzir cores hardcoded fora da paleta ou uma fonte serifada de volta.

## Decisões de produto (espelham o backend)

1. Gastos e Devedores são módulos independentes, cada um com seu próprio período fiscal (dia de fechamento configurável) — e **por aba**: cada aba tem sua própria config. O usuário escolhe o período diretamente clicando na data no `PeriodNavigator` (abre um `<input type="month">` nativo sobreposto ao label), além de navegar mês a mês com as setas.
2. Categorias são customizáveis (nome + cor, paleta vibrante estilo tags do iOS) — sem seed fixo, únicas por aba.
3. Dívidas têm 3 status (`pendente`/`parcial`/`quitado`) com cores próprias (ver `STATUS_CLASS` em `DevedorDetailPage.tsx`, usa os tokens `danger`/`warning`/`success`).
4. Abas: criar/renomear/recolorir/excluir (`CreateTabModal.tsx`, `ManageTabsModal.tsx`) — excluir a última aba é bloqueado pelo backend. A Visão Geral funde categorias/pessoas de mesmo nome entre abas diferentes numa linha só (decisão do usuário) e não permite lançar dado nela (é só leitura — pra lançar algo, precisa estar dentro de uma aba específica).

## Roteamento (três "famílias" de tela)

```
/                           -> HomePage (dentro de HomeLayout: topo simples, sem nav de Gastos/Devedores)
/visao-geral                -> OverviewPage (idem, HomeLayout)
/tabs/:tabId/gastos         -> GastosPage (dentro de AppLayout: sidebar com Gastos/Devedores da aba)
/tabs/:tabId/devedores      -> DevedoresPage
/tabs/:tabId/devedores/:id  -> DevedorDetailPage
/bets                       -> BetsHomePage (dentro de BetsLayout: própria topbar, nada a ver com Financeiro)
```

`AppLayout` busca `GET /tabs` pra descobrir o nome da aba atual (via `tabId` do `useParams`) e mostrar no lugar do wordmark "Financeiro" no topo da `Sidebar` — esse wordmark/ícone de casa é o link de volta pra `/`. Toda página dentro de uma aba lê `tabId` via `useParams` e prefixa as chamadas de API com `/tabs/${tabId}/...`; os modais (`AddExpenseModal`, `AddDebtModal`, `AddDebtorModal`, `ManageCategoriesModal`, `PeriodSettingsModal`, `RegisterPaymentModal`) recebem `tabId` como prop pro mesmo fim.

## Estrutura

```
src/
  api/          # client.ts (axios + interceptor JWT), types.ts (espelha os DTOs do backend)
  context/      # AuthContext (login/registro/logout, hidrata via GET /auth/me), ThemeContext (dark/light)
  components/   # Sidebar, AppLayout, HomeLayout, DonutTabChart, modais (Add*, Manage*, Create*, PeriodSettings), CategoryBar (genérico: categoria OU aba), icons.tsx
  pages/        # Login, Register, Home (radial), Overview (visão geral), Gastos, Devedores, DevedorDetail
  utils/        # format.ts (formatCurrency, formatDate, formatMonthName — sempre pt-BR), colors.ts (paleta de cores compartilhada categorias/abas)
```

Padrão de página: cada página de dados busca tudo via `useCallback` + `useEffect`, guarda em `useState` local, e re-chama `load()` depois de qualquer mutação (criar/editar/excluir) ao invés de atualizar o estado otimisticamente. Simples e suficiente pro tamanho atual do app.

## `DonutTabChart` — o gráfico de rosca da tela inicial

SVG puro (sem lib de gráfico), em `src/components/DonutTabChart.tsx`. Cada aba vira uma fatia cujo ângulo é proporcional a `totalGastoPeriodo` (vindo de `GET /dashboard/visao-geral`), com um piso mínimo de 8° pra aba com R$0 continuar visível/clicável — sem isso ela sumiria do gráfico. É uma rosca (donut), não uma pizza cheia, de propósito: sobra espaço no centro (a "rosquinha") pra um botão HTML absolutamente posicionado por cima do SVG ("Visão Geral" + total), sem competir com o hit-test das fatias.

## Módulo Bets — área separada, fora do layout do Financeiro

Ativado por `user.betsEnabled` (toggle no `SettingsModal.tsx`, ao lado do dark/light). Não tem nada a ver com abas — é uma segunda "aplicação" dentro do mesmo app React, com seu próprio layout (`BetsLayout.tsx`: topbar "Bets" + botão pra voltar ao Financeiro + Configurações + Sair, sem `Sidebar`/`AppLayout`).

- `BetsLayout` faz o guard de acesso: se `user.betsEnabled` for `false`, redireciona pra `/` (`<Navigate to="/" replace />`) — mesma ideia do `ProtectedRoute`, mas checando a flag em vez da sessão.
- `HomeLayout.tsx` mostra um ícone "Bets" (`TrendingUpIcon`) do lado do de Configurações **só se** `user.betsEnabled` — é o único ponto de entrada no fluxo normal do Financeiro; o caminho de volta é o ícone `WalletIcon` dentro do `BetsLayout`.
- **`BetsHomePage`**: busca `GET /bets/months/current` (204 = nenhum mês iniciado ainda → estado vazio) e `GET /bets/houses` em paralelo. Mostra banca total e lucro/prejuízo **em unidades primeiro, R$ como texto secundário** (decisão do usuário — em apostas o desempenho é discutido em unidades). Reaproveita `CategoryBar` pra mostrar a fatia de cada casa na banca total (o componente já era genérico o bastante, só precisa de `{nome, cor, total, percentual}`).
- Modais: `CreateBetHouseModal`/`ManageBetHousesModal` (cópia exata do padrão `CreateTabModal`/`ManageTabsModal`), `UpdateBetBalanceModal` (mostra saldo início do dia read-only + input do saldo atual, padrão do `RegisterPaymentModal`), `StartBetMonthModal` (pede o valor da unidade pro mês, texto muda se já existe um mês aberto sendo fechado), `ChangeUnitValueModal` (avisa que só vale a partir de hoje).
- `formatUnits()` em `utils/format.ts` formata em "X,XX un" (pt-BR, 2 casas).

## Autenticação

Token JWT salvo em `localStorage` (`financeiro_token`). Interceptor do axios em `api/client.ts` injeta o header e redireciona pra `/login` em qualquer 401. `AuthContext` chama `GET /auth/me` no boot pra restaurar sessão.

## O que ainda falta (próximos passos conhecidos)

- [x] Deploy no Vercel — feito, https://money-control-front-five.vercel.app
- [x] Dark/light mode
- [x] Seletor de período direto (não só navegação mês a mês)
- [ ] Transformar em PWA de verdade (manifest + service worker via `vite-plugin-pwa`) pra dar pra "instalar" no celular
- [ ] Sem testes ainda

## Deploy (contexto do sistema como um todo)

Backend (`financeiro-api`) vai pro Render (free web service) com banco Postgres no Neon. Este frontend vai pro Vercel. O único ajuste necessário aqui é a env var `VITE_API_URL` apontando pra URL pública da API no Render — sem outras mudanças de código.

## Backend irmão

`financeiro-api` (Spring Boot). Os tipos em `src/api/types.ts` espelham manualmente os DTOs Java — se o backend mudar um response, atualizar aqui também. `VITE_API_URL` no `.env` aponta pra ele (default `http://localhost:8080`).
