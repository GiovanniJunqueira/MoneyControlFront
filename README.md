# Financeiro Web

Frontend do sistema de controle financeiro — dois módulos, **Gastos** e **Devedores**, com período fiscal configurável.

Conceito visual: livro-caixa analógico. Papel, tinta, números tabulares, linhas finas ao invés de cards com sombra.

## Stack

- React 18 + TypeScript + Vite
- React Router
- TailwindCSS (tokens customizados em `tailwind.config.js`)
- Axios

## Como rodar

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar a URL da API

Copie `.env.example` para `.env` e ajuste se necessário:

```bash
cp .env.example .env
```

Por padrão aponta para `http://localhost:8080` (o backend Spring Boot rodando localmente).

### 3. Rodar em desenvolvimento

```bash
npm run dev
```

Abre em `http://localhost:5173`.

### 4. Build de produção

```bash
npm run build
```

Gera a pasta `dist/`, pronta pra qualquer hospedagem estática (Vercel, Netlify, etc).

## Funciona como PWA no celular?

Esse projeto ainda é "só" um site responsivo (funciona bem no celular pelo navegador, com navegação em barra inferior). Se você quiser a experiência de "instalar" no celular (ícone na tela, abrir em tela cheia), o próximo passo é adicionar um manifest PWA (`vite-plugin-pwa`) — posso montar isso quando quiser.

## Estrutura

```
src/
  api/          # cliente axios + tipos TypeScript da API
  context/      # AuthContext (login/registro/logout)
  components/   # Sidebar, modais, navegador de período, etc.
  pages/        # Login, Registro, Gastos, Devedores, Detalhe do devedor
  utils/        # formatação de moeda e data
```

## Deploy

Hospedagem planejada: **Vercel** (free tier). É um build Vite padrão — o Vercel detecta o framework automaticamente (`npm run build`, saída em `dist/`). Só é preciso configurar, no painel do projeto na Vercel, a variável de ambiente:

- `VITE_API_URL` — URL pública da API depois do deploy dela no Render (ex: `https://financeiro-api.onrender.com`)

O backend correspondente é o `financeiro-api` (Spring Boot), hospedado no Render com banco Postgres no Neon.

## Rodando junto com o backend

1. Suba o backend Spring Boot (`financeiro-api`) na porta 8080
2. Rode esse frontend com `npm run dev`
3. Crie uma conta pela tela de registro — as categorias e o dia de fechamento (padrão: dia 1) começam vazios/padrão e são 100% customizáveis depois
