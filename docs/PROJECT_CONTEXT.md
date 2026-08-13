# Contexto permanente do produto

Este documento registra decisões de produto já fechadas para evitar que sejam reabertas ou perguntadas novamente sem conflito técnico real ou nova exigência.

## Produto

O fit-platform é um aplicativo de acompanhamento de treino, nutrição, progresso e saúde.

O produto não deve se apresentar como “treino gerado por IA”. A inteligência artificial funciona nos bastidores e não deve ser destacada na comunicação ao usuário.

- Área de treinamento: **Meu Treino**.
- Serviço: **Programa Personalizado**.

## Principais pilares

- Hoje
- Meu Treino
- Nutrição
- Progresso
- Health e wearables
- Assessoria futura

## Treinamento

Estão definidos conceitualmente:

- programa personalizado;
- registro de séries, repetições e cargas;
- progressão;
- cronômetro;
- substituição de exercícios;
- treino livre;
- histórico;
- check-in;
- medidas;
- fotos privadas opcionais;
- integração com HealthKit e Health Connect;
- programa externo de personal trainer.

## Nutrição

Estão definidos conceitualmente:

- plano alimentar personalizado;
- horários;
- substituições;
- lembretes;
- registro;
- lista de compras;
- plano externo de nutricionista;
- check-in integrado.

## Profissionais — futuro

- personal trainers;
- nutricionistas;
- marketplace;
- assessoria;
- painel profissional;
- pagamentos;
- comissão;
- chat.

Esses recursos não fazem parte do primeiro desenvolvimento imediato do core.

## Onboarding planejado

1. Sobre você
2. Objetivo
3. Rotina e disponibilidade
4. Experiência
5. Local e equipamentos
6. Preferências
7. Limitações e cuidados
8. Medidas opcionais
9. Fotos opcionais
10. Health e dispositivos opcionais
11. Revisão
12. Finalização

## Decisões de UX

- Trabalhar mobile-first.
- Evitar campos de texto quando uma seleção for possível.
- Fotos e medidas adicionais são opcionais.
- Fotos são privadas por padrão.
- Integração Health é opcional.
- Um programa externo deve ser suportado futuramente.
- IA não deve ser destacada na comunicação ao usuário.

## Product Experience Philosophy

- O produto deve atender do iniciante ao praticante avançado com a mesma base metodológica profissional.
- A experiência usa progressive disclosure: iniciantes recebem perguntas simples e explicações claras; perguntas adicionais aparecem somente quando o perfil e as respostas tornam essa profundidade relevante.
- A interface deve permanecer simples enquanto o motor trabalha com regras sofisticadas: **simple interface, sophisticated engine**.
- Usuários Free recebem programas coerentes e tecnicamente respeitáveis. A qualidade metodológica do Free nunca deve ser reduzida deliberadamente para incentivar upgrade.
- O Pro diferencia-se por maior profundidade de personalização, adaptações mais frequentes, análises avançadas, automação, gestão sofisticada de progressão e fadiga, histórico, tendências, integrações e conveniência.
- O acompanhamento por profissional humano é uma modalidade própria, não apenas uma versão superior do plano Pro.
- A interface não deve exigir conhecimento técnico de treinamento quando a mesma informação puder ser obtida com linguagem simples ou derivada pelo sistema.

## Dados sensíveis de saúde

- Respostas sobre dor, lesões, limitações, sinais de atenção e gestação devem ser usadas somente para segurança e personalização do programa.
- Esses dados não devem ser enviados para analytics, incluídos em logs ou exibidos fora das áreas em que forem necessários.
- A triagem não realiza diagnóstico, não substitui avaliação profissional e não deve afirmar aptidão clínica para exercício.

## Estado de continuidade — agosto de 2026

- As Etapas 1–8 do onboarding estão implementadas.
- A Etapa 9 está implementada em UI e normalização de payload; sua persistência é o próximo trabalho funcional.
- A migration 007 foi executada manualmente no Supabase.
- As migrations 001–007 não estão versionadas neste repositório. Existing Supabase migrations were historically executed manually and must be reconstructed/versioned through a dedicated verified database-baseline task.
- A auditoria de segurança está em andamento.
- RLS foi confirmada em `profiles` e `body_measurements`, e as policies dessas tabelas foram auditadas.
- O teste adversarial de isolamento entre usuários A e B foi implementado em `scripts/security/test-user-isolation.mjs`.
- O teste A x B ainda não foi concluído porque o fluxo de confirmação de email precisa ser resolvido.
- O próximo passo de segurança é corrigir ou projetar corretamente a confirmação de email e então executar novamente o teste de isolamento.
- Credenciais dos usuários de teste devem permanecer somente em arquivos locais ignorados e nunca ser armazenadas no repositório.
