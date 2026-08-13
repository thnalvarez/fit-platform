# Regras permanentes do fit-platform

## Documentação versionada

- O Expo e o React Native mudam entre versões. Antes de implementar APIs dependentes de versão, consulte a documentação exata das versões instaladas no projeto.
- Para o Expo SDK 57, comece por `https://docs.expo.dev/versions/v57.0.0/`.
- Não aplique APIs, convenções ou instruções de versões diferentes sem confirmar compatibilidade com as dependências instaladas.

## Comunicação

- Converse com o desenvolvedor em português.
- Mantenha em português o conteúdo visível atual do aplicativo, salvo decisão explícita de internacionalização.
- Use inglês no código: arquivos, pastas técnicas, variáveis, funções, componentes, props, types, interfaces e nomes de banco quando apropriado.

## Contexto e decisões

- Antes de fazer perguntas, revise as decisões documentadas e o contexto existente do projeto.
- Não pergunte novamente algo já definido como regra ou decisão permanente.
- Não reabra decisões fechadas sem conflito técnico real ou nova exigência.
- Quando uma ambiguidade puder ser resolvida analisando o projeto, analise primeiro em vez de perguntar.
- Respeite o escopo solicitado pelo desenvolvedor.
- Consulte `docs/PROJECT_CONTEXT.md` antes de propor mudanças de produto ou novas funcionalidades.

## Alterações de código

- Sempre analise o arquivo completo antes de modificá-lo.
- Não faça alterações isoladas sem compreender o contexto do arquivo.
- Quando o desenvolvedor estiver editando código manualmente, forneça o arquivo completo para substituição, nunca apenas trechos isolados.
- Quando o Codex estiver autorizado a editar diretamente o repositório, modifique os arquivos necessários diretamente, após revisar cada arquivo completo.
- Não modifique arquivos fora do escopo necessário.
- Não faça refatorações não solicitadas.
- Não recrie o projeto para resolver problemas localizados.

## Arquitetura

- Preserve a arquitetura modular e o Expo Router existentes.
- Reutilize componentes existentes antes de criar novos.
- Evite duplicação de lógica, tipos, dados e estilos; mantenha uma fonte única de verdade.
- Separe UI, business logic, services, types, state, data e assets.
- Priorize componentes reutilizáveis quando houver reutilização real.
- Não crie abstrações prematuras.

## Nomenclatura

- Componentes React, types e interfaces: `PascalCase`.
- Variáveis e funções: `camelCase`.
- Pastas: `kebab-case` quando aplicável.
- Arquivos técnicos e assets: nomes descritivos em inglês.

## Mobile e acessibilidade

- Trabalhe mobile-first.
- Garanta áreas de toque confortáveis.
- Evite controles inadequados para celular quando cards, chips, pickers ou controles nativos forem melhores.
- Estados de loading devem impedir múltiplos envios.
- Preserve labels, contraste, estados selecionados, foco, feedback visual de erro e suporte razoável a leitores de tela.

## Supabase e segurança

- Nunca exponha secrets, service-role keys, passwords, tokens, `.env.local` ou outras credenciais.
- Publishable keys devem permanecer somente no mecanismo de environment já configurado.
- Não altere automaticamente o schema do Supabase sem autorização explícita.
- Para mudanças de banco:
  1. analise a necessidade;
  2. proponha o SQL;
  3. aguarde execução ou autorização manual;
  4. somente depois conecte a persistência.
- Preserve RLS.
- Nunca desabilite políticas de segurança para contornar erros.

## Dependências

- Use `npx expo install` para dependências nativas Expo quando apropriado.
- Não use `npm audit fix --force`.
- Não atualize versões major de dependências sem autorização.
- Consulte a documentação correspondente às versões realmente instaladas.

## Validação e diagnóstico

- Após mudanças relevantes de código, execute:
  - `npx tsc --noEmit`
  - `git diff --check`
- Execute outros testes ou builds relevantes quando a mudança exigir.
- Não declare um problema resolvido sem evidência.
- Se não for possível confirmar a causa, adicione diagnóstico, informe que a investigação continua e peça somente o dado específico necessário.

## Git

- Não faça commit ou push automaticamente.
- Não execute reset, force push ou outras operações destrutivas sem autorização explícita.
- Quando um commit for autorizado, use Conventional Commits.
- Valide as mudanças antes do commit.

## Integridade do produto

- Não invente dados, métricas, usuários, profissionais, resultados, depoimentos ou funcionalidades inexistentes.
- Documente decisões arquiteturais importantes.
- Não avance para novas funcionalidades enquanto existir erro funcional relevante na etapa atual.
