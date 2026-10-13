# 🎨 Maiara Mattia — Portfólio & Ateliê Digital

Plataforma web desenvolvida para a artista e designer **Maiara Mattia**. O projeto une uma experiência visual acolhedora para os clientes (apresentação do trabalho, vitrine de produtos e personalização de encomendas) a um painel administrativo ágil para a gestão do ateliê.

---

## ✨ Funcionalidades

### 🌸 Para os Clientes
- **Apresentação & Vitrine:** Portfólio das linhas autorais (como a linha *Familinha* e projetos gráficos personalizados), com fotos em alta resolução e visualização interativa.
- **Personalizador Maker:** Ferramenta interativa para transformar desenhos infantis em quadros decorativos, permitindo escolher cores, traço, dimensões e visualizar uma prévia na hora.
- **Carrinho & Orçamentos:** Seleção de múltiplos itens com direcionamento direto e estruturado para o atendimento via WhatsApp.
- **Acompanhamento de Pedidos:** Página exclusiva onde o cliente acompanha cada fase da produção (aprovação, confecção e entrega final).

### 🛠️ Para a Gestão (Painel Admin)
- **Central de Pedidos:** Visualização em formato **Kanban** e lista, com controle de status, anotações e envio de arquivos/prévias para o cliente.
- **Catálogo de Produtos:** Cadastro e edição simplificada dos itens da galeria e projetos especiais.
- **Gestão de Mídias:** Armazenamento otimizado de imagens e entregas digitais na nuvem.

---

## 💻 Tecnologias

- **Interface:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Estilização & Componentes:** [Tailwind CSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Framer Motion](https://www.framer.com/motion/)
- **Infraestrutura Serverless:** [Cloudflare Workers](https://workers.cloudflare.com/), [Cloudflare D1](https://developers.cloudflare.com/d1/) (banco de dados) e [Cloudflare R2](https://developers.cloudflare.com/r2/) (armazenamento de arquivos)

---

## 🚀 Como Rodar Localmente

### 1. Clonar e Instalar
```bash
git clone https://github.com/Faelavgtt/maiaraMatthia.git
cd maiaraMatthia
npm install
```

### 2. Preparar o Banco de Dados Local
```bash
npm run db:migrate:local
```

### 3. Iniciar o Projeto
```bash
# Executa a aplicação completa (Front-end + API local)
npm run dev

# Ou apenas o front-end com recarregamento rápido
npm run dev:vite
```

Acesse `http://localhost:5173` no seu navegador.

---

## 📦 Scripts Mais Usados

| Comando | Finalidade |
|---|---|
| `npm run dev` | Inicia o projeto completo localmente |
| `npm run dev:vite` | Inicia somente o servidor de desenvolvimento do front-end |
| `npm run build` | Gera a versão de produção na pasta `dist/` |
| `npm run db:migrate:local` | Aplica migrações no banco de dados local |
| `npm run cf:worker:deploy` | Publica a aplicação e a API na Cloudflare |

---

## 👤 Autoria

- **Artes e Identidade Visual:** Maiara Mattia
- **Desenvolvimento:** [Rafael Vergotti](https://github.com/Faelavgtt)
