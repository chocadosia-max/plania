# AI Rules & Tech Stack — PlanIA

Este documento define as diretrizes técnicas e o stack tecnológico para o desenvolvimento do PlanIA.

## Tech Stack

- **Framework:** React 18 com TypeScript e Vite para um ambiente de desenvolvimento rápido.
- **Estilização:** Tailwind CSS para design utilitário e responsivo.
- **Componentes UI:** shadcn/ui (baseado em Radix UI) para componentes acessíveis e customizáveis.
- **Roteamento:** React Router DOM para navegação entre páginas e sub-rotas do dashboard.
- **Gerenciamento de Estado:** TanStack Query (React Query) para cache e sincronização de dados.
- **Visualização de Dados:** Recharts para gráficos financeiros interativos e responsivos.
- **Ícones:** Lucide React para uma biblioteca de ícones consistente e leve.
- **Formulários:** React Hook Form integrado com Zod para validação de esquemas type-safe.
- **Notificações:** Sonner para toasts elegantes e não intrusivos.
- **Temas:** Sistema de temas customizado via CSS Variables (suportando Aurora, Floresta, Oceano, etc.).

## Regras de Desenvolvimento

### 1. Componentes de UI
- **Sempre** utilize os componentes em `src/components/ui/` antes de criar novos elementos do zero.
- Siga o padrão de design do shadcn/ui para manter a consistência visual.
- Novos componentes devem ser criados em arquivos separados em `src/components/`.

### 2. Estilização e Design
- Use **exclusivamente** classes do Tailwind CSS. Evite arquivos CSS externos ou `style` inline.
- Utilize as variáveis de cor do tema (ex: `text-primary`, `bg-card`) para garantir que o componente funcione em todos os temas disponíveis.
- Mantenha o design responsivo (mobile-first) usando prefixos como `sm:`, `md:`, `lg:`.

### 3. Ícones
- Use apenas a biblioteca `lucide-react`.
- Mantenha tamanhos consistentes (geralmente `w-4 h-4` para botões e `w-5 h-5` para destaques).

### 4. Formulários e Validação
- Utilize `react-hook-form` para gerenciar o estado dos formulários.
- Defina esquemas de validação usando `zod` para garantir integridade dos dados.

### 5. Manipulação de Dados e Datas
- Use `date-fns` para qualquer lógica de manipulação ou formatação de datas.
- Para valores monetários, utilize `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` ou a lógica de formatação já existente em `src/pages/Transacoes.tsx`.

### 6. Navegação
- Use o componente `Link` do `react-router-dom` para navegação interna.
- Para links ativos na sidebar, utilize o componente customizado `NavLink` em `src/components/NavLink.tsx`.

### 7. Animações
- Utilize as animações customizadas definidas no `tailwind.config.ts` (ex: `animate-reveal`, `animate-panel-in`).
- Mantenha as transições suaves para melhorar a percepção de qualidade (micro-interações).