# fit-platform

Aplicativo mobile de acompanhamento de treino, nutrição, progresso e saúde. O produto organiza programas personalizados e registros do usuário sem se apresentar como um aplicativo de “treino gerado por IA”; recursos inteligentes devem funcionar nos bastidores.

## Stack

- Expo SDK 57
- React Native
- TypeScript
- Expo Router
- Supabase Auth e Database

## Estrutura principal

```text
src/
├── app/                  # Rotas e telas do Expo Router
│   ├── (auth)/           # Cadastro e login
│   ├── (onboarding)/     # Etapas do onboarding
│   ├── _layout.tsx       # Stack principal
│   └── index.tsx         # Boas-vindas
├── components/ui/        # Componentes reutilizáveis de interface
├── services/             # Clientes e integrações externas
└── theme/                # Cores, espaçamentos e tipografia

assets/                   # Imagens e outros recursos estáticos
docs/                     # Contexto e decisões permanentes do produto
```

## Instalação

```bash
npm install
```

## Variáveis de ambiente

Crie `.env.local` no ambiente local com as variáveis abaixo, sem versionar valores reais:

```text
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_KEY=
```

Nunca inclua segredos, senhas, tokens ou chaves privadas em documentação, commits ou logs.

## Execução

Iniciar o Metro Bundler:

```bash
npm start
```

Web:

```bash
npm run web
```

Android, com emulador configurado ou dispositivo disponível:

```bash
npm run android
```

O QR code exibido pelo Metro também pode ser usado com um ambiente mobile compatível.

## Arquitetura

O Expo Router usa `src/app` como raiz de rotas. Grupos entre parênteses organizam telas sem adicionar o nome do grupo à URL. Componentes compartilhados ficam em `src/components`, integrações em `src/services` e decisões visuais em `src/theme`.

O Supabase fornece autenticação e persistência. O cliente utiliza somente variáveis públicas apropriadas ao aplicativo; regras de acesso permanecem protegidas por RLS no banco. Mudanças de schema devem ser propostas em SQL e executadas manualmente após autorização.

As implementações devem preservar separação de responsabilidades, reutilizar componentes existentes e evitar duplicação ou abstrações prematuras.

## Estado atual

O projeto possui:

- tela de boas-vindas;
- cadastro com Supabase Auth e criação automática de perfil por trigger;
- login de usuários existentes;
- Etapa 1 do onboarding para dados pessoais;
- Etapa 2 para seleção e persistência do objetivo principal;
- feedback visual de loading, erros e sucesso nas operações implementadas.

A próxima etapa do onboarding ainda não foi implementada. Depois de salvar o objetivo, o usuário permanece temporariamente na Etapa 2.

## Fluxo atual

```text
Boas-vindas
├── Cadastro → Supabase Auth → Onboarding
└── Login → Supabase Auth → Onboarding

Onboarding
├── Etapa 1: Sobre você
└── Etapa 2: Objetivo
```

## Validação

```bash
npx tsc --noEmit
git diff --check
```

Execute testes ou builds adicionais quando o escopo da mudança exigir.

## Git

- Não faça commit ou push automaticamente.
- Valide as alterações antes de criar um commit.
- Use Conventional Commits quando o commit for autorizado.
- Não versione `.env.local` nem qualquer credencial.
- Não use operações destrutivas sem autorização explícita.

## Documentação permanente

- Consulte `AGENTS.md` para as regras obrigatórias de desenvolvimento e colaboração.
- Consulte `docs/PROJECT_CONTEXT.md` antes de propor decisões de produto ou novas funcionalidades.
